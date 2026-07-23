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
        "keydown",
        eventoCodigo
    );


    agregarEvento(
        "cantidad",
        "keydown",
        eventoCantidad
    );


    // MODAL DE EDICIÓN

    agregarEvento(
        "modalEditarGuardar",
        "click",
        confirmarModalEditar
    );


    agregarEvento(
        "modalEditarCancelar",
        "click",
        cerrarModalEditar
    );


    agregarEvento(
        "modalEditarEspacio",
        "click",
        () => {

            const input = document.getElementById("modalEditarInput");

            const inicio = input.selectionStart ?? input.value.length;
            const fin = input.selectionEnd ?? input.value.length;

            input.value =
                input.value.slice(0, inicio) +
                " " +
                input.value.slice(fin);

            input.focus();

            input.setSelectionRange(inicio + 1, inicio + 1);

        }
    );


    agregarEvento(
        "modalEditarInput",
        "keydown",
        (evento) => {

            if (evento.key === "Enter") {
                evento.preventDefault();
                confirmarModalEditar();
            }

        }
    );


    const overlayModal = document.getElementById("modalEditar");

    if (overlayModal) {

        overlayModal.addEventListener("click", (evento) => {

            if (evento.target === overlayModal)
                cerrarModalEditar();

        });

    }


    // MODAL DE CONFIRMACIÓN

    agregarEvento(
        "modalConfirmarAceptar",
        "click",
        () => cerrarModalConfirmar(true)
    );


    agregarEvento(
        "modalConfirmarCancelar",
        "click",
        () => cerrarModalConfirmar(false)
    );


    const overlayConfirmar = document.getElementById("modalConfirmar");

    if (overlayConfirmar) {

        overlayConfirmar.addEventListener("click", (evento) => {

            if (evento.target === overlayConfirmar)
                cerrarModalConfirmar(false);

        });

    }



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