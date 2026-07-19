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
// MAESTRO
// ==========================================

function guardarMaestro() {

    localStorage.setItem(

        STORAGE.MAESTRO,

        JSON.stringify(maestro)

    );

}

function cargarMaestroLocal() {

    const datos = localStorage.getItem(

        STORAGE.MAESTRO

    );

    maestro = datos

        ? JSON.parse(datos)

        : [];

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

    // Mantener últimos 30

    historial = historial.slice(0, 30);

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

function limpiarMaestro() {

    maestro = [];

    guardarMaestro();

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
