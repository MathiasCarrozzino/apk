/*
==========================================
Scanner Inventario v2.0
core.js

Contiene la lógica que faltaba:
- Variables globales lista / maestro
- Tema claro/oscuro
- Carga del maestro (Excel/CSV)
- Alta de artículos
- Buscador
- Nueva sesión
- Exportar a Excel
- Lector de cámara (html5-qrcode)
==========================================
*/

let lista = [];
let maestro = [];

let camaraActiva = false;
let html5QrCode = null;

// ==========================================
// TEMA
// ==========================================

function iniciarTema() {

    const config = cargarConfiguracion();

    if (config.tema === "oscuro") {
        document.body.classList.add("dark");
        document.getElementById("btnTema").textContent = "☀️";
    }
}

function cambiarTema() {

    document.body.classList.toggle("dark");

    const oscuro = document.body.classList.contains("dark");

    document.getElementById("btnTema").textContent =
        oscuro ? "☀️" : "🌙";

    const config = cargarConfiguracion();
    config.tema = oscuro ? "oscuro" : "claro";
    guardarConfiguracion(config);
}

// ==========================================
// MAESTRO
// ==========================================

function cargarMaestroExcel(evento) {

    const archivo = evento.target.files[0];

    if (!archivo)
        return;

    const estadoEl = document.getElementById("estado");
    estadoEl.textContent = "Leyendo archivo...";

    if (typeof XLSX === "undefined") {
        estadoEl.textContent = "Error: la librería de Excel no cargó (revisá tu conexión a internet)";
        mostrarMensaje("La librería de Excel no está disponible", "error");
        console.error("XLSX no está definido. Revisá que el <script> de cdn.jsdelivr.net/npm/xlsx esté en index.html y que haya internet.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function (e) {

        try {

            const datos = new Uint8Array(e.target.result);
            const libro = XLSX.read(datos, { type: "array" });
            const hoja = libro.Sheets[libro.SheetNames[0]];

            // Intento 1: por nombre de columna (EAN, Interno, Descripción...)
            const filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });

            maestro = filas
                .map(normalizarFilaMaestro)
                .filter(item => item.ean || item.interno);

            // Intento 2 (fallback): si no reconoció encabezados, usar las
            // primeras 3 columnas por posición (EAN | Interno | Descripción)
            if (maestro.length === 0) {

                const filasCrudas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });

                maestro = filasCrudas
                    .filter(fila => fila.some(celda => celda !== ""))
                    .map(fila => ({
                        ean: String(fila[0] ?? "").trim(),
                        interno: String(fila[1] ?? "").trim(),
                        descripcion: String(fila[2] ?? "").trim()
                    }))
                    .filter(item => item.ean || item.interno)
                    .filter(item => item.ean.toLowerCase() !== "ean");
            }

            if (maestro.length === 0) {
                estadoEl.textContent = "No se encontraron artículos en el archivo";
                mostrarMensaje("El archivo no tiene datos reconocibles", "error");
                console.warn("Encabezados detectados en la hoja:", filas[0] ? Object.keys(filas[0]) : "(sin filas)");
                return;
            }

            guardarMaestro();

            estadoEl.textContent = `Maestro cargado (${maestro.length} artículos)`;

            mostrarMensaje("Maestro cargado correctamente", "exito");

        } catch (error) {

            console.error("Error al leer el maestro:", error);
            estadoEl.textContent = "Error al leer el archivo maestro (ver consola)";
            mostrarMensaje("Error al leer el archivo maestro", "error");
        }
    };

    lector.onerror = function () {
        estadoEl.textContent = "No se pudo leer el archivo";
        mostrarMensaje("No se pudo leer el archivo", "error");
    };

    lector.readAsArrayBuffer(archivo);

    // Permite volver a elegir el mismo archivo si hace falta recargarlo
    evento.target.value = "";
}

function normalizarFilaMaestro(fila) {

    const claves = Object.keys(fila).reduce((acc, k) => {
        acc[k.toString().trim().toLowerCase()] = fila[k];
        return acc;
    }, {});

    const buscarValor = (...nombres) => {
        for (const nombre of nombres) {
            if (claves[nombre] !== undefined && claves[nombre] !== "") {
                return claves[nombre];
            }
        }
        return "";
    };

    return {
        ean: String(buscarValor("ean", "codigo", "código", "cod. barras", "codigo de barras") || "").trim(),
        interno: String(buscarValor("interno", "codigo interno", "código interno", "cod. interno") || "").trim(),
        descripcion: String(buscarValor("descripcion", "descripción", "producto", "detalle") || "").trim()
    };
}

function buscarEnMaestro(codigo) {

    return maestro.find(item =>
        item.ean === codigo || item.interno === codigo
    );
}

// ==========================================
// AGREGAR ARTÍCULO
// ==========================================

function agregarArticulo() {

    const inputCodigo = document.getElementById("codigo");
    const inputCantidad = document.getElementById("cantidad");
    const inputObs = document.getElementById("observacion");

    const codigo = inputCodigo.value.trim();
    const cantidad = Number(inputCantidad.value) || 1;
    const observacion = inputObs.value.trim();

    if (!codigo) {
        mostrarMensaje("Ingresá un código", "error");
        inputCodigo.focus();
        return;
    }

    const productoMaestro = buscarEnMaestro(codigo);

    const articulo = {
        ean: productoMaestro ? (productoMaestro.ean || codigo) : codigo,
        interno: productoMaestro ? productoMaestro.interno : "",
        descripcion: productoMaestro
            ? productoMaestro.descripcion
            : "Sin descripción (no está en el maestro)",
        cantidad,
        observacion
    };

    const unificar = document.getElementById("unificar").checked;

    if (unificar) {

        const existente = lista.find(item =>
            item.ean === articulo.ean && item.interno === articulo.interno
        );

        if (existente) {
            existente.cantidad += cantidad;
            if (observacion) existente.observacion = observacion;
        } else {
            lista.push(articulo);
        }

    } else {
        lista.push(articulo);
    }

    guardarInventario();
    actualizarVista();

    mostrarMensaje(
        productoMaestro ? "Artículo agregado" : "Agregado (no está en el maestro)",
        productoMaestro ? "exito" : "error"
    );

    inputCodigo.value = "";
    inputCantidad.value = 1;
    inputObs.value = "";
    inputCodigo.focus();
}

// ==========================================
// ENTER en los campos
// ==========================================

function eventoCodigo(e) {

    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("cantidad").focus();
        document.getElementById("cantidad").select();
    }
}

function eventoCantidad(e) {

    if (e.key === "Enter") {
        e.preventDefault();
        agregarArticulo();
    }
}

// ==========================================
// BUSCADOR
// ==========================================

function buscarArticulos() {

    const texto = document.getElementById("buscar").value.trim().toLowerCase();

    if (!texto) {
        actualizarVista();
        return;
    }

    const filtrada = lista.filter(item =>
        (item.ean || "").toLowerCase().includes(texto) ||
        (item.interno || "").toLowerCase().includes(texto) ||
        (item.descripcion || "").toLowerCase().includes(texto)
    );

    dibujarTabla(filtrada);
    dibujarTarjetas(filtrada);
}

// ==========================================
// NUEVA SESIÓN
// ==========================================

function nuevaSesion() {

    if (lista.length === 0) {
        mostrarMensaje("El inventario ya está vacío", "error");
        return;
    }

    if (!confirm("¿Iniciar una nueva sesión? El inventario actual queda guardado en el historial.")) {
        return;
    }

    guardarHistorial();
    limpiarInventario();
    actualizarVista();

    document.getElementById("buscar").value = "";

    mostrarMensaje("Nueva sesión iniciada", "exito");
}

// ==========================================
// EXPORTAR EXCEL
// ==========================================

function exportarExcel() {

    if (lista.length === 0) {
        mostrarMensaje("No hay artículos para exportar", "error");
        return;
    }

    const datos = lista.map(item => ({
        EAN: item.ean,
        Interno: item.interno,
        Descripción: item.descripcion,
        Cantidad: item.cantidad,
        Observación: item.observacion || ""
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Inventario");

    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `inventario_${fecha}.xlsx`);

    mostrarMensaje("Excel exportado", "exito");
}

// ==========================================
// CÁMARA (html5-qrcode)
// ==========================================

function alternarCamara() {

    const boton = document.getElementById("btnCamara");

    if (!camaraActiva) {

        const contenedor = document.getElementById("lectorCamara");
        contenedor.innerHTML = `<div id="qr-reader" style="width:100%"></div>`;

        html5QrCode = new Html5Qrcode("qr-reader");

        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (codigoDecodificado) => {

                document.getElementById("codigo").value = codigoDecodificado;

                if (navigator.vibrate)
                    navigator.vibrate(100);

                detenerCamara();

                document.getElementById("cantidad").focus();
                document.getElementById("cantidad").select();
            },
            () => { /* se ignoran los frames sin código detectado */ }

        ).then(() => {

            camaraActiva = true;
            boton.textContent = "✖ Cerrar";

        }).catch((error) => {

            console.error(error);
            mostrarMensaje("No se pudo acceder a la cámara", "error");
            contenedor.innerHTML = "";
        });

    } else {

        detenerCamara();
    }
}

function detenerCamara() {

    const boton = document.getElementById("btnCamara");
    const contenedor = document.getElementById("lectorCamara");

    if (html5QrCode) {

        html5QrCode.stop()
            .then(() => {
                html5QrCode.clear();
                contenedor.innerHTML = "";
            })
            .catch(() => {
                contenedor.innerHTML = "";
            });
    }

    camaraActiva = false;
    boton.textContent = "📷 Cámara";
}
