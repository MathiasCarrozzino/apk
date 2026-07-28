/*
==========================================
Scanner Inventario v2.0
storage.js
==========================================
*/

const STORAGE = {

    INVENTARIO: "inventario",

    MAESTRO: "maestro",

    EMPRESAS: "empresas",

    MAESTROS_EMPRESA: "maestrosEmpresa",

    EMPRESA_ACTIVA: "empresaActiva",

    CONFIG: "configuracion",

    HISTORIAL: "historial"

};

// ==========================================
// INVENTARIO
// ==========================================

function guardarInventario() {

    localStorage.setItem(

        STORAGE.INVENTARIO,

        JSON.stringify(lista)

    );

}

function cargarInventarioLocal() {

    const datos = localStorage.getItem(

        STORAGE.INVENTARIO

    );

    lista = datos

        ? JSON.parse(datos)

        : [];

}

// ==========================================
// MAESTRO
// ==========================================

function guardarListaEmpresas() {

    localStorage.setItem(

        STORAGE.EMPRESAS,

        JSON.stringify(empresas)

    );

    localStorage.setItem(

        STORAGE.EMPRESA_ACTIVA,

        empresaActiva || ""

    );

}

function esNativoCapacitor() {

    return !!(
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform() &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.Filesystem
    );

}

function rutaMaestro(nombreEmpresa) {

    return `maestros/${encodeURIComponent(nombreEmpresa)}.json`;

}

async function guardarMaestroDeEmpresa(nombreEmpresa) {

    const contenido =
        JSON.stringify(maestrosEmpresa[nombreEmpresa] || []);

    if (esNativoCapacitor()) {

        try {

            await window.Capacitor.Plugins.Filesystem.writeFile({
                path: rutaMaestro(nombreEmpresa),
                data: contenido,
                directory: "CACHE",
                encoding: "utf8",
                recursive: true
            });

            return true;

        } catch (error) {

            console.error("No se pudo guardar el maestro en archivo:", error);

            return false;

        }

    }

    // Respaldo para pruebas fuera de la APK (navegador de escritorio)
    try {

        localStorage.setItem("maestro_" + nombreEmpresa, contenido);

        return true;

    } catch (error) {

        console.error("No se pudo guardar el maestro (localStorage):", error);

        return false;

    }

}

async function cargarMaestroDeEmpresa(nombreEmpresa) {

    if (esNativoCapacitor()) {

        try {

            const resultado =
                await window.Capacitor.Plugins.Filesystem.readFile({
                    path: rutaMaestro(nombreEmpresa),
                    directory: "CACHE",
                    encoding: "utf8"
                });

            return JSON.parse(resultado.data);

        } catch (error) {

            // Puede no existir todavía (empresa recién creada, sin maestro)
            return [];

        }

    }

    const datos = localStorage.getItem("maestro_" + nombreEmpresa);

    return datos ? JSON.parse(datos) : [];

}

async function eliminarMaestroDeEmpresa(nombreEmpresa) {

    if (esNativoCapacitor()) {

        try {

            await window.Capacitor.Plugins.Filesystem.deleteFile({
                path: rutaMaestro(nombreEmpresa),
                directory: "CACHE"
            });

        } catch (error) {}

        return;

    }

    localStorage.removeItem("maestro_" + nombreEmpresa);

}

async function cargarMaestroLocal() {

    const datosEmpresas =
        localStorage.getItem(STORAGE.EMPRESAS);

    empresas = datosEmpresas
        ? JSON.parse(datosEmpresas)
        : [];

    // Migración desde versiones anteriores
    if (empresas.length === 0) {

        const maestrosEmpresaViejo =
            localStorage.getItem(STORAGE.MAESTROS_EMPRESA);

        if (maestrosEmpresaViejo) {

            // Venías de la versión que guardaba todos los maestros
            // juntos en localStorage (la que se quedaba sin espacio)

            try {

                const datosViejos = JSON.parse(maestrosEmpresaViejo);

                for (const nombre of Object.keys(datosViejos)) {

                    empresas.push(nombre);

                    maestrosEmpresa[nombre] = datosViejos[nombre];

                    await guardarMaestroDeEmpresa(nombre);

                }

            } catch (error) {

                console.error("Error migrando maestros:", error);

            }

            localStorage.removeItem(STORAGE.MAESTROS_EMPRESA);

        } else {

            // Versión aún más vieja: un solo maestro, sin empresas
            const maestroViejo = localStorage.getItem(STORAGE.MAESTRO);

            if (maestroViejo) {

                try {

                    const listaVieja = JSON.parse(maestroViejo);

                    if (Array.isArray(listaVieja) && listaVieja.length > 0) {

                        empresas.push("Empresa 1");

                        maestrosEmpresa["Empresa 1"] = listaVieja;

                        await guardarMaestroDeEmpresa("Empresa 1");

                    }

                } catch (error) {}

            }

        }

        guardarListaEmpresas();

    }

    empresaActiva = localStorage.getItem(STORAGE.EMPRESA_ACTIVA) || "";

    if (!empresaActiva || empresas.indexOf(empresaActiva) === -1) {
        empresaActiva = empresas[0] || "";
    }

    // Cargamos el maestro de cada empresa desde su archivo
    for (const nombre of empresas) {

        if (!maestrosEmpresa[nombre]) {
            maestrosEmpresa[nombre] = await cargarMaestroDeEmpresa(nombre);
        }

    }

    maestro = maestrosEmpresa[empresaActiva] || [];

    if (typeof actualizarSelectorEmpresaActiva === "function")
        actualizarSelectorEmpresaActiva();

    if (typeof actualizarEstadoMaestro === "function")
        actualizarEstadoMaestro();

}

// ==========================================
// CONFIGURACIÓN
// ==========================================

function configuracionDefecto() {

    return {

        tema: "claro",

        unificar: true,

        vibracion: true,

        sonido: true,

        camara: "environment",

        ultimoUso: new Date().toISOString()

    };

}

function guardarConfiguracion(config) {

    localStorage.setItem(

        STORAGE.CONFIG,

        JSON.stringify(config)

    );

}

function cargarConfiguracion() {

    let config = localStorage.getItem(

        STORAGE.CONFIG

    );

    if (!config) {

        config = configuracionDefecto();

        guardarConfiguracion(config);

        return config;

    }

    config = JSON.parse(config);

    document.getElementById("unificar").checked =

        config.unificar;

    return config;

}

// ==========================================
// HISTORIAL
// ==========================================

function guardarHistorial() {

    if (lista.length === 0)

        return;

    let historial = localStorage.getItem(

        STORAGE.HISTORIAL

    );

    historial = historial

        ? JSON.parse(historial)

        : [];

    historial.unshift({

        fecha: new Date().toLocaleString(),

        cantidadArticulos: lista.length,

        totalUnidades: lista.reduce(

            (a, b) => a + b.cantidad,

            0

        ),

        datos: [...lista]

    });

    // Mantener últimos 100

    historial = historial.slice(0, 100);

    localStorage.setItem(

        STORAGE.HISTORIAL,

        JSON.stringify(historial)

    );

}

function obtenerHistorial() {

    let historial = localStorage.getItem(

        STORAGE.HISTORIAL

    );

    return historial

        ? JSON.parse(historial)

        : [];

}

// ==========================================
// BORRAR TODO
// ==========================================

function limpiarInventario() {

    lista = [];

    guardarInventario();

}

async function limpiarMaestro() {

    if (empresaActiva) {

        maestrosEmpresa[empresaActiva] = [];

        await guardarMaestroDeEmpresa(empresaActiva);

    }

    maestro = [];

}

function limpiarTodo() {

    localStorage.removeItem(

        STORAGE.INVENTARIO

    );

    localStorage.removeItem(

        STORAGE.MAESTRO

    );

    localStorage.removeItem(

        STORAGE.EMPRESAS

    );

    localStorage.removeItem(

        STORAGE.MAESTROS_EMPRESA

    );

    localStorage.removeItem(

        STORAGE.EMPRESA_ACTIVA

    );

}

// ==========================================
// EXPORTAR RESPALDO
// ==========================================

function exportarBackup() {

    const backup = {

        fecha: new Date().toISOString(),

        empresas,

        maestrosEmpresa,

        empresaActiva,

        inventario: lista,

        configuracion: cargarConfiguracion()

    };

    const blob = new Blob(

        [JSON.stringify(backup, null, 2)],

        {

            type: "application/json"

        }

    );

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(blob);

    enlace.download =

        "backup_scanner_inventario.json";

    enlace.click();

}