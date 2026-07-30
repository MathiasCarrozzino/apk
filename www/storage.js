/*
==========================================
Scanner Inventario v2.0
storage.js
==========================================
*/

const STORAGE = {

    INVENTARIO: "inventario",

    MAESTRO: "maestro",

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
// MAESTRO (guardado en IndexedDB — mucha más
// capacidad que localStorage para listas grandes)
// ==========================================

const DB_NOMBRE = "ControlIngresoDB";
const DB_VERSION = 1;
const DB_ALMACEN = "maestro";

function abrirBaseDeDatos() {

    return new Promise((resolve, reject) => {

        const solicitud =
            indexedDB.open(DB_NOMBRE, DB_VERSION);

        solicitud.onupgradeneeded = (evento) => {

            const db = evento.target.result;

            if (!db.objectStoreNames.contains(DB_ALMACEN)) {
                db.createObjectStore(DB_ALMACEN);
            }

        };

        solicitud.onsuccess = (evento) =>
            resolve(evento.target.result);

        solicitud.onerror = (evento) =>
            reject(evento.target.error);

    });

}

async function guardarMaestro() {

    try {

        const db = await abrirBaseDeDatos();

        await new Promise((resolve, reject) => {

            const tx = db.transaction(DB_ALMACEN, "readwrite");

            tx.objectStore(DB_ALMACEN).put(maestro, "maestro");

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);

        });

        db.close();

        return true;

    } catch (error) {

        console.error("No se pudo guardar el maestro:", error);

        return false;

    }

}

async function cargarMaestroLocal() {

    try {

        const db = await abrirBaseDeDatos();

        const datos = await new Promise((resolve, reject) => {

            const tx = db.transaction(DB_ALMACEN, "readonly");

            const solicitud =
                tx.objectStore(DB_ALMACEN).get("maestro");

            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);

        });

        db.close();

        maestro = Array.isArray(datos) ? datos : [];

    } catch (error) {

        console.error("No se pudo leer el maestro guardado:", error);

        maestro = [];

    }

    // Migración: si venías del sistema anterior (localStorage), se
    // pasa una sola vez a IndexedDB y se limpia la clave vieja
    if (maestro.length === 0) {

        const datosViejos = localStorage.getItem(STORAGE.MAESTRO);

        if (datosViejos) {

            try {

                const listaVieja = JSON.parse(datosViejos);

                if (Array.isArray(listaVieja) && listaVieja.length > 0) {

                    maestro = listaVieja;

                    await guardarMaestro();

                    localStorage.removeItem(STORAGE.MAESTRO);

                }

            } catch (error) {}

        }

    }

    if (maestro.length > 0) {

        document.getElementById("estado").textContent =

            `Maestro cargado (${maestro.length} artículos)`;

    }

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

    maestro = [];

    await guardarMaestro();

}

function limpiarTodo() {

    localStorage.removeItem(

        STORAGE.INVENTARIO

    );

    localStorage.removeItem(

        STORAGE.MAESTRO

    );

}

// ==========================================
// EXPORTAR RESPALDO
// ==========================================

function exportarBackup() {

    const backup = {

        fecha: new Date().toISOString(),

        maestro,

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