/*
==========================================
Scanner Inventario v2.0

core.js

Lógica principal:
- Variables globales
- Tema
- Maestro Excel
- Búsqueda
- Inventario
==========================================
*/


let lista = [];

let maestro = [];

function sonMismoArticulo(a, b) {

    return (

        a.ean === b.ean &&
        a.interno === b.interno &&
        (a.observacion || "") === (b.observacion || "") &&
        (a.caja || "") === (b.caja || "")

    );

}


// ==========================================
// TEMA
// ==========================================

function iniciarTema() {


    const config =
        cargarConfiguracion();


    if (config.tema === "oscuro") {


        document.body.classList.add(
            "dark"
        );


        const boton =
            document.getElementById(
                "btnTema"
            );


        if (boton) {

            boton.textContent = "☀️";

        }

    }

}



function cambiarTema() {


    document.body.classList.toggle(
        "dark"
    );


    const oscuro =
        document.body.classList.contains(
            "dark"
        );


    const boton =
        document.getElementById(
            "btnTema"
        );


    if (boton) {

        boton.textContent =
            oscuro ? "☀️" : "🌙";

    }


    const config =
        cargarConfiguracion();


    config.tema =
        oscuro ? "oscuro" : "claro";


    guardarConfiguracion(
        config
    );

}



// ==========================================
// MAESTRO EXCEL
// ==========================================

function cargarMaestroExcel(evento) {


    const archivo =
        evento.target.files[0];


    if (!archivo)
        return;



    const estado =
        document.getElementById(
            "estado"
        );


    estado.textContent =
        "Leyendo archivo...";



    if (typeof XLSX === "undefined") {


        estado.textContent =
            "Error cargando Excel";


        mostrarMensaje(
            "La librería Excel no está disponible",
            "error"
        );


        return;

    }



    const lector =
        new FileReader();



    lector.onload = function(e) {


        try {


            const datos =
                new Uint8Array(
                    e.target.result
                );


            const libro =
                XLSX.read(
                    datos,
                    {
                        type:"array"
                    }
                );


            const hoja =
                libro.Sheets[
                    libro.SheetNames[0]
                ];



            const filas =
                XLSX.utils.sheet_to_json(
                    hoja,
                    {
                        defval:""
                    }
                );



            maestro =
                filas
                .map(normalizarFilaMaestro)
                .filter(
                    item =>
                    item.ean ||
                    item.interno
                );



            if (maestro.length === 0) {


                const filasCrudas =
                    XLSX.utils.sheet_to_json(
                        hoja,
                        {
                            header:1,
                            defval:""
                        }
                    );


                maestro =
                    filasCrudas
                    .filter(
                        fila =>
                        fila.some(
                            celda =>
                            celda !== ""
                        )
                    )
                    .map(
                        fila => ({

                            ean:
                            limpiarCodigo(
                                fila[0]
                            ),

                            interno:
                            limpiarCodigo(
                                fila[1]
                            ),

                            descripcion:
                            String(
                                fila[2] ?? ""
                            ).trim()

                        })
                    )
                    .filter(
                        item =>
                        item.ean ||
                        item.interno
                    );

            }



            if (maestro.length === 0) {


                estado.textContent =
                    "Sin artículos";


                mostrarMensaje(
                    "No se encontraron datos",
                    "error"
                );


                return;

            }



            guardarMaestro();



            estado.textContent =
                `Maestro cargado (${maestro.length} artículos)`;


            mostrarMensaje(
                "Maestro cargado correctamente",
                "exito"
            );



            console.log(
                "Ejemplo maestro:",
                maestro[0]
            );



        } catch(error) {


            console.error(
                error
            );


            mostrarMensaje(
                "Error leyendo maestro",
                "error"
            );

        }


    };



    lector.readAsArrayBuffer(
        archivo
    );


    evento.target.value = "";

}




// ==========================================
// NORMALIZAR FILA
// ==========================================

function normalizarFilaMaestro(fila) {


    const claves =
        Object.keys(fila)
        .reduce(
            (acc,k)=>{

                acc[
                    k
                    .toString()
                    .trim()
                    .toLowerCase()
                ] =
                fila[k];

                return acc;

            },
            {}
        );



    function obtener(...nombres) {


        for(
            const nombre of nombres
        ){

            if(
                claves[nombre] !== undefined &&
                claves[nombre] !== ""
            ){

                return claves[nombre];

            }

        }


        return "";

    }



    return {

        ean:
        limpiarCodigo(
            obtener(
                "ean",
                "codigo",
                "código",
                "cod barras",
                "codigo de barras"
            )
        ),


        interno:
        limpiarCodigo(
            obtener(
                "interno",
                "codigo interno",
                "código interno"
            )
        ),


        descripcion:
        String(
            obtener(
                "descripcion",
                "descripción",
                "producto",
                "detalle"
            )
        ).trim()

    };

}

// ==========================================
// LIMPIAR CÓDIGO
// ==========================================

function limpiarCodigo(valor) {

    return String(valor ?? "")
        .trim()
        .replace(".0", "");

}



// ==========================================
// BUSCAR EN MAESTRO
// ==========================================

function buscarEnMaestro(codigo) {


    const buscado =
        limpiarCodigo(codigo);



    return maestro.find(item => {


        const ean =
            limpiarCodigo(item.ean);


        const interno =
            limpiarCodigo(item.interno);



        return (
            ean === buscado ||
            interno === buscado
        );


    });

}



// ==========================================
// AGREGAR ARTÍCULO
// ==========================================

async function agregarArticulo() {


    const inputCodigo =
        document.getElementById(
            "codigo"
        );


    const inputCantidad =
        document.getElementById(
            "cantidad"
        );


    const inputObs =
        document.getElementById(
            "observacion"
        );


    const inputCaja =
        document.getElementById(
            "campoCaja"
        );



    const codigo =
        inputCodigo.value.trim();



    const cantidad =
        Number(
            inputCantidad.value
        );



    const observacion =
        inputObs.value.trim();


    const caja =
        inputCaja ? inputCaja.value.trim() : "";



    if (!codigo) {


        mostrarMensaje(
            "Ingresá un código",
            "error"
        );


        inputCodigo.focus();

        return;

    }



    if (!cantidad || cantidad < 1) {


        mostrarMensaje(
            "Ingresá una cantidad válida",
            "error"
        );


        inputCantidad.focus();

        return;

    }



    const productoMaestro =
        buscarEnMaestro(
            codigo
        );



    let descripcion =
        productoMaestro
        ?
        productoMaestro.descripcion
        :
        "Sin descripción (no está en el maestro)";


    if (!productoMaestro) {


        const descripcionEditada =
            await pedirTextoModal(
                "Descripción del artículo",
                descripcion,
                "text"
            );


        // Canceló: no agregamos el artículo
        if (descripcionEditada === null) {

            inputCodigo.focus();

            return;

        }


        descripcion =
            descripcionEditada.trim() || descripcion;

    }



    const articulo = {


        ean:
        productoMaestro
        ?
        productoMaestro.ean || codigo
        :
        codigo,


        interno:
        productoMaestro
        ?
        productoMaestro.interno
        :
        "",



        descripcion,



        cantidad,


        observacion,


        caja

    };



    const unificar =
        document.getElementById(
            "unificar"
        );



    if (unificar) {


        const existente =
    lista.find(
        item => sonMismoArticulo(item, articulo)
    );



        if (existente) {


            existente.cantidad += cantidad;

        } else {


            lista.push(
                articulo
            );

        }



    } else {


        lista.push(
            articulo
        );

    }



    guardarInventario();


    actualizarVista();



    mostrarMensaje(

        productoMaestro
        ?
        "Artículo agregado"
        :
        "Agregado (no está en el maestro)",


        productoMaestro
        ?
        "exito"
        :
        "error"

    );



    inputCodigo.value = "";

    inputCantidad.value = "";

    inputObs.value = "";


    inputCodigo.focus();

}



// ==========================================
// ENTER EN CAMPOS
// ==========================================

function eventoCodigo(e) {


    const esEnter =
        e.key === "Enter" ||
        e.keyCode === 13 ||
        e.which === 13;


    if(
 esEnter ||
 e.key==="Tab"
) {


        e.preventDefault();



        const cantidad =
            document.getElementById(
                "cantidad"
            );



        cantidad.focus();


        cantidad.select();


    }

}




function eventoCantidad(e) {


    const esEnter =
        e.key === "Enter" ||
        e.keyCode === 13 ||
        e.which === 13;


    if (esEnter) {


        e.preventDefault();



        agregarArticulo();



        setTimeout(
            () => {


                document
                .getElementById(
                    "codigo"
                )
                .focus();


            },
            100
        );


    }

}



// ==========================================
// BUSCADOR
// ==========================================

function buscarArticulos() {


    const texto =
        document
        .getElementById(
            "buscar"
        )
        .value
        .trim()
        .toLowerCase();



    if (!texto) {


        actualizarVista();

        return;

    }



    const filtrada =
        lista.filter(
            item =>

            (item.ean || "")
            .toLowerCase()
            .includes(texto)


            ||

            (item.interno || "")
            .toLowerCase()
            .includes(texto)


            ||

            (item.descripcion || "")
            .toLowerCase()
            .includes(texto)

        );



    dibujarTabla(
        filtrada
    );


    dibujarTarjetas(
        filtrada
    );

}



// ==========================================
// NUEVA SESIÓN
// ==========================================

async function nuevaSesion() {


    if (lista.length === 0) {


        mostrarMensaje(
            "El inventario ya está vacío",
            "error"
        );


        return;

    }



    const confirmado =
        await pedirConfirmacion(
            "Borrar listado",
            "¿Seguro que querés borrar todo el inventario actual? Se guarda una copia en el historial.",
            "Borrar"
        );

    if (!confirmado) {

        return;

    }



    guardarHistorial();


    limpiarInventario();


    actualizarVista();



    document.getElementById(
        "buscar"
    ).value = "";



    mostrarMensaje(
        "Nueva sesión iniciada",
        "exito"
    );

}



// ==========================================
// EXPORTAR EXCEL
// ==========================================

let exportandoExcel = false;

async function exportarExcel() {

    if (exportandoExcel) {

        mostrarMensaje(
            "Ya se está exportando el Excel, esperá un momento",
            "error"
        );

        return;

    }


    if (lista.length === 0) {


        mostrarMensaje(
            "No hay artículos para exportar",
            "error"
        );


        return;

    }


    exportandoExcel = true;

    const btnExportar =
        document.getElementById("btnExportar");

    if (btnExportar) btnExportar.disabled = true;



    let buffer, archivo;

    try {

    const datos =
        lista.map(
            item => ({


                EAN:item.ean,

                Interno:item.interno,

                Descripción:item.descripcion,

                Cantidad:item.cantidad,

                Observación:item.observacion || "",

                Caja:item.caja || ""


            })
        );



    const hoja = XLSX.utils.json_to_sheet(datos, {
    origin: "A4"
});

const libro = XLSX.utils.book_new();


// ===============================
// CABECERA
// ===============================

XLSX.utils.sheet_add_aoa(
    hoja,
    [
        ["CONTROL DE INGRESOS"],
        [""],
        [
            "",
            "",
            "",
            "",
            "Fecha: " + new Date().toLocaleDateString()
        ]
    ],
    {
        origin: "A1"
    }
);



// ===============================
// ANCHO DE COLUMNAS
// ===============================

hoja["!cols"] = [

    { wch: 20 }, // EAN
    { wch: 16 }, // Interno
    { wch: 45 }, // Descripción
    { wch: 12 }, // Cantidad
    { wch: 35 }, // Observación
    { wch: 18 }  // Caja

];



// ===============================
// BORDES
// ===============================

const rango = XLSX.utils.decode_range(
    hoja["!ref"]
);


for (
    let fila = rango.s.r;
    fila <= rango.e.r;
    fila++
) {

    for (
        let columna = rango.s.c;
        columna <= rango.e.c;
        columna++
    ) {


        const celda =
            hoja[
                XLSX.utils.encode_cell({
                    r:fila,
                    c:columna
                })
            ];


        if (celda) {

            celda.s = {

                border: {

                    top:{
                        style:"thin",
                        color:{
                            rgb:"000000"
                        }
                    },

                    bottom:{
                        style:"thin",
                        color:{
                            rgb:"000000"
                        }
                    },

                    left:{
                        style:"thin",
                        color:{
                            rgb:"000000"
                        }
                    },

                    right:{
                        style:"thin",
                        color:{
                            rgb:"000000"
                        }
                    }

                }

            };

        }

    }

}



// Filtro en encabezados

hoja["!autofilter"] = {

    ref:
    "A4:F" + (datos.length + 4)

};


XLSX.utils.book_append_sheet(
    libro,
    hoja,
    "Inventario"
);



    const ahora =
        new Date();

    const fecha =
        ahora
        .toISOString()
        .slice(
            0,
            10
        );

    const hora =
        [
            ahora.getHours(),
            ahora.getMinutes(),
            ahora.getSeconds()
        ]
        .map(n => String(n).padStart(2, "0"))
        .join("-");

    const nombreSugerido =
        `inventario_${fecha}_${hora}`;


    let nombreElegido =
        await pedirTextoModal(
            "Nombre del archivo",
            nombreSugerido,
            "text"
        );

    // El usuario tocó "Cancelar": no exportamos nada
    if (nombreElegido === null) {

        document
            .getElementById("codigo")
            .focus();

        exportandoExcel = false;

        if (btnExportar) btnExportar.disabled = false;

        return;

    }

    nombreElegido = nombreElegido.trim();

    if (!nombreElegido) {
        nombreElegido = nombreSugerido;
    }

    // Sacar caracteres no permitidos en nombres de archivo
    nombreElegido =
        nombreElegido.replace(
            /[\\/:*?"<>|]/g,
            "_"
        );

    archivo =
        nombreElegido.toLowerCase().endsWith(".xlsx")
            ? nombreElegido
            : `${nombreElegido}.xlsx`;



    buffer =
        XLSX.write(
            libro,
            {
                bookType:"xlsx",
                type:"array"
            }
        );

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo generar el Excel (revisá la cantidad de artículos)",
            "error"
        );

        exportandoExcel = false;
        if (btnExportar) btnExportar.disabled = false;

        return;

    }


    // ==========================================
    // GUARDADO NATIVO (dentro de la APK Android)
    // ==========================================

    const esNativo =
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform();


    if (
        esNativo &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.FileSharer
    ) {

        // Guardado directo en la carpeta Descargas del teléfono
        // (usa MediaStore internamente, sin necesitar permisos
        // especiales en Android 10+).

        try {

            const base64 =
                arrayBufferABase64(buffer);

            await window.Capacitor.Plugins.FileSharer.save({
                filename: archivo,
                contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                base64Data: base64,
                android: {
                    saveDirectory: "downloads"
                }
            });

            mostrarMensaje(
                "Excel guardado en Descargas",
                "exito"
            );

        } catch (error) {

            console.error(error);

            mostrarMensaje(
                "No se pudo guardar el Excel en Descargas",
                "error"
            );

        }

        exportandoExcel = false;
        if (btnExportar) btnExportar.disabled = false;

        return;

    }


    if (
        esNativo &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.Filesystem
    ) {

        try {

            const base64 =
                arrayBufferABase64(buffer);

            const resultado =
                await window.Capacitor.Plugins.Filesystem.writeFile({
                    path: archivo,
                    data: base64,
                    directory: "CACHE",
                    recursive: true
                });


            // Abrir el selector nativo de compartir para que el usuario
            // elija dónde guardarlo/enviarlo (Drive, WhatsApp, Gmail,
            // "Guardar en archivos", etc). Necesario porque el archivo
            // queda en una carpeta privada de la app que Android no deja
            // ver desde un explorador de archivos normal.

            if (window.Capacitor.Plugins.Share) {

                await window.Capacitor.Plugins.Share.share({
                    title: "Inventario",
                    text: "Listado de inventario: " + archivo,
                    files: [resultado.uri],
                    dialogTitle: "Guardar o enviar Excel"
                });

                mostrarMensaje(
                    "Excel listo para guardar o enviar",
                    "exito"
                );

            } else {

                mostrarMensaje(
                    "Excel guardado (falta el plugin Share para compartirlo)",
                    "exito"
                );

            }

        } catch (error) {

            // El usuario cierra el selector de compartir sin elegir nada:
            // no es un error real, el archivo ya está guardado.
            if (error && error.message === "Share canceled") {

                mostrarMensaje(
                    "Excel guardado",
                    "exito"
                );

            } else {

                console.error(error);

                mostrarMensaje(
                    "No se pudo guardar el Excel en el dispositivo",
                    "error"
                );

            }

        }

        exportandoExcel = false;
        if (btnExportar) btnExportar.disabled = false;

        return;

    }


    // ==========================================
    // RESPALDO (navegador de escritorio / pruebas)
    // ==========================================

    const blob =
        new Blob(
            [buffer],
            {
                type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );



    const url =
        URL.createObjectURL(
            blob
        );



    const enlace =
        document.createElement(
            "a"
        );


    enlace.href = url;

    enlace.download = archivo;



    document.body.appendChild(enlace);

enlace.dispatchEvent(
    new MouseEvent(
        "click",
        {
            bubbles:true,
            cancelable:true,
            view:window
        }
    )
);

document.body.removeChild(enlace);



    setTimeout(
        ()=>{
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );



    mostrarMensaje(
        "Excel exportado",
        "exito"
    );

    exportandoExcel = false;
    if (btnExportar) btnExportar.disabled = false;

}



// ==========================================
// CONVERTIR BUFFER A BASE64 (para Filesystem)
// ==========================================


function arrayBufferABase64(buffer) {

    // Se procesa en bloques (chunks) en vez de byte a byte:
    // concatenar carácter por carácter con += es O(n²) y para
    // inventarios medianos/grandes puede colgar el WebView y
    // hacer que Android mate el proceso (la app "se cierra sola").

    const bytes = new Uint8Array(buffer);

    const TAMANO_BLOQUE = 0x8000; // 32768

    const partes = [];

    for (let i = 0; i < bytes.byteLength; i += TAMANO_BLOQUE) {

        const bloque =
            bytes.subarray(i, i + TAMANO_BLOQUE);

        partes.push(
            String.fromCharCode.apply(null, bloque)
        );

    }

    return btoa(partes.join(""));

}
