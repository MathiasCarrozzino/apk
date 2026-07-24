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

function guardarEmpresas() {

    localStorage.setItem(

        STORAGE.EMPRESAS,

        JSON.stringify(empresas)

    );

    localStorage.setItem(

        STORAGE.MAESTROS_EMPRESA,

        JSON.stringify(maestrosEmpresa)

    );

    localStorage.setItem(

        STORAGE.EMPRESA_ACTIVA,

        empresaActiva || ""

    );

}

function cargarMaestroLocal() {

    const datosEmpresas = localStorage.getItem(

        STORAGE.EMPRESAS

    );

    const datosMaestros = localStorage.getItem(

        STORAGE.MAESTROS_EMPRESA

    );

    empresas = datosEmpresas

        ? JSON.parse(datosEmpresas)

        : [];

    maestrosEmpresa = datosMaestros

        ? JSON.parse(datosMaestros)

        : {};

    // Migración: si venías de la versión anterior (un solo maestro,
    // sin empresas), se convierte en la primera empresa
    if (empresas.length === 0) {

        const maestroViejo = localStorage.getItem(STORAGE.MAESTRO);

        if (maestroViejo) {

            try {

                const listaVieja = JSON.parse(maestroViejo);

                if (Array.isArray(listaVieja) && listaVieja.length > 0) {

                    empresas.push("Empresa 1");

                    maestrosEmpresa["Empresa 1"] = listaVieja;

                }

            } catch (error) {}

        }

    }

    empresaActiva = localStorage.getItem(STORAGE.EMPRESA_ACTIVA) || "";

    if (!empresaActiva || empresas.indexOf(empresaActiva) === -1) {
        empresaActiva = empresas[0] || "";
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

function limpiarMaestro() {

    if (empresaActiva) {
        maestrosEmpresa[empresaActiva] = [];
    }

    maestro = [];

    guardarEmpresas();

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