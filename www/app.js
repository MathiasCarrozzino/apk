/*
==========================================
Scanner Inventario v2.0
Archivo principal
==========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


function iniciarAplicacion() {

    console.log(
        "Scanner Inventario iniciado"
    );


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



    // Actualizar interfaz

    if (typeof actualizarVista === "function")
        actualizarVista();



    mostrarMensaje(
        "Aplicación lista",
        "exito"
    );

}



// ==========================================
// REGISTRO DE EVENTOS
// ==========================================

function registrarEventos() {


    function agregarEvento(
        id,
        evento,
        funcion
    ) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.addEventListener(
                evento,
                funcion
            );

        } else {

            console.warn(
                "Elemento no encontrado:",
                id
            );

        }

    }



    // BOTONES

    agregarEvento(
        "btnAgregar",
        "click",
        agregarArticulo
    );


    agregarEvento(
        "btnNueva",
        "click",
        nuevaSesion
    );


    agregarEvento(
        "btnExportar",
        "click",
        exportarExcel
    );


    agregarEvento(
        "btnTema",
        "click",
        cambiarTema
    );


    agregarEvento(
        "archivoMaestro",
        "change",
        cargarMaestroExcel
    );


    agregarEvento(
        "buscar",
        "input",
        buscarArticulos
    );



    // ENTER

    agregarEvento(
        "codigo",
        "keypress",
        eventoCodigo
    );


    agregarEvento(
        "cantidad",
        "keypress",
        eventoCantidad
    );



    // GUARDADO AUTOMÁTICO

    setInterval(() => {


        if (
            typeof guardarInventario === "function"
        ) {

            guardarInventario();

        }


    },10000);


}



// ==========================================
// GUARDAR AL CERRAR
// ==========================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            typeof guardarInventario === "function"
        ) {

            guardarInventario();

        }

    }
);