/*
==========================================
Scanner Inventario v2.0
Archivo principal
==========================================
*/

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

function iniciarAplicacion() {

    console.log("Scanner Inventario iniciado");

    // Inicializar configuración
    if (typeof iniciarTema === "function")
        iniciarTema();

    if (typeof cargarConfiguracion === "function")
        cargarConfiguracion();

    // Cargar datos guardados
    if (typeof cargarMaestroLocal === "function")
        cargarMaestroLocal();

    if (typeof cargarInventarioLocal === "function")
        cargarInventarioLocal();

    // Eventos
    registrarEventos();

    // Dibujar interfaz
    if (typeof actualizarVista === "function")
        actualizarVista();

    // Mensaje de bienvenida
    mostrarMensaje(
        "Aplicación lista",
        "exito"
    );

}

function registrarEventos() {

    // ==========================
    // Botones
    // ==========================

    document
        .getElementById("btnAgregar")
        .addEventListener("click", agregarArticulo);

    document
        .getElementById("btnNueva")
        .addEventListener("click", nuevaSesion);

    document
        .getElementById("btnExportar")
        .addEventListener("click", exportarExcel);

    document
        .getElementById("btnCamara")
        .addEventListener("click", alternarCamara);

    document
        .getElementById("btnTema")
        .addEventListener("click", cambiarTema);

    document
        .getElementById("archivoMaestro")
        .addEventListener("change", cargarMaestroExcel);

    document
        .getElementById("buscar")
        .addEventListener("input", buscarArticulos);

    // ==========================
    // ENTER
    // ==========================

    document
        .getElementById("codigo")
        .addEventListener("keypress", eventoCodigo);

    document
        .getElementById("cantidad")
        .addEventListener("keypress", eventoCantidad);

    // ==========================
    // Guardado automático
    // ==========================

    setInterval(() => {

        if (typeof guardarInventario === "function")
            guardarInventario();

    }, 10000);

}

window.addEventListener("beforeunload", () => {

    if (typeof guardarInventario === "function")
        guardarInventario();

});
