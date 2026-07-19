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

function agregarArticulo() {


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



    const codigo =
        inputCodigo.value.trim();



    const cantidad =
        Number(
            inputCantidad.value
        );



    const observacion =
        inputObs.value.trim();



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



        descripcion:
        productoMaestro
        ?
        productoMaestro.descripcion
        :
        "Sin descripción (no está en el maestro)",



        cantidad,


        observacion

    };



    const unificar =
        document.getElementById(
            "unificar"
        ).checked;



    if (unificar) {


        const existente =
            lista.find(
                item =>
                item.ean === articulo.ean &&
                item.interno === articulo.interno
            );



        if (existente) {


            existente.cantidad += cantidad;



            if (observacion) {

                existente.observacion =
                    observacion;

            }


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


    if(
 e.key==="Enter" ||
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


    if (e.key === "Enter") {


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

function nuevaSesion() {


    if (lista.length === 0) {


        mostrarMensaje(
            "El inventario ya está vacío",
            "error"
        );


        return;

    }



    if(
        !confirm(
            "¿Iniciar una nueva sesión?"
        )
    ) {

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

async function exportarExcel() {


    if (lista.length === 0) {


        mostrarMensaje(
            "No hay artículos para exportar",
            "error"
        );


        return;

    }



    const datos =
        lista.map(
            item => ({


                EAN:item.ean,

                Interno:item.interno,

                Descripción:item.descripcion,

                Cantidad:item.cantidad,

                Observación:item.observacion || ""


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
    { wch: 35 }  // Observación

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
    "A4:E" + (datos.length + 4)

};


XLSX.utils.book_append_sheet(
    libro,
    hoja,
    "Inventario"
);



    const fecha =
        new Date()
        .toISOString()
        .slice(
            0,
            10
        );



    const archivo =
        `inventario_${fecha}.xlsx`;



    const buffer =
        XLSX.write(
            libro,
            {
                bookType:"xlsx",
                type:"array"
            }
        );


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
        window.Capacitor.Plugins.Filesystem
    ) {

        try {

            const base64 =
                arrayBufferABase64(buffer);

            await window.Capacitor.Plugins.Filesystem.writeFile({
                path: archivo,
                data: base64,
                directory: "DOCUMENTS",
                recursive: true
            });

            mostrarMensaje(
                "Excel guardado en Documentos: " + archivo,
                "exito"
            );

        } catch (error) {

            console.error(error);

            mostrarMensaje(
                "No se pudo guardar el Excel en el dispositivo",
                "error"
            );

        }

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

}



// ==========================================
// CONVERTIR BUFFER A BASE64 (para Filesystem)
// ==========================================

function arrayBufferABase64(buffer) {

    let binario = "";

    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.byteLength; i++) {

        binario += String.fromCharCode(bytes[i]);

    }

    return btoa(binario);

}