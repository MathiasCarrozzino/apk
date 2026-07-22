/*
==========================================
Scanner Inventario v2.0
ui.js
==========================================
*/

function actualizarVista() {

    dibujarTabla();

    dibujarTarjetas();

    actualizarDashboard();

}

// =========================================
// TABLA (PC)
// =========================================

function dibujarTabla(listaMostrar = lista) {

    const tbody = document.getElementById("lista");

    tbody.innerHTML = "";

    listaMostrar.forEach((articulo, indice) => {

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>${articulo.ean}</td>

            <td>

                <input
                    type="text"
                    value="${articulo.caja || ""}"
                    data-id="${indice}"
                    class="cajaInput">

            </td>

            <td>${articulo.interno}</td>

            <td>

                <input
                    type="text"
                    value="${articulo.descripcion}"
                    data-id="${indice}"
                    class="descInput">

            </td>

            <td>

                <input
                    type="number"
                    min="1"
                    value="${articulo.cantidad}"
                    data-id="${indice}"
                    class="cantidadInput">

            </td>

            <td>

                <input
                    type="text"
                    value="${articulo.observacion || ""}"
                    data-id="${indice}"
                    class="obsInput">

            </td>

            <td>

                <button
                    class="btnEliminar"
                    data-id="${indice}">

                    🗑

                </button>

            </td>

        `;

        tbody.appendChild(fila);

    });

    registrarEventosTabla();

}

// =========================================
// TARJETAS (CELULAR)
// =========================================

function dibujarTarjetas(listaMostrar = lista) {

    const contenedor = document.getElementById("listaMobile");

    contenedor.innerHTML = "";

    listaMostrar.forEach((articulo, indice) => {

        const card = document.createElement("div");

        card.className = "mobile-card";

        card.innerHTML = `

            <h3>

                ${articulo.descripcion}

                <button
                    class="btnEditarCampo"
                    onclick="editarDescripcion(${indice})">

                    ✏️

                </button>

            </h3>

            <p class="fila-doble">

                <span>

                    <strong>EAN:</strong>

                    ${articulo.ean}

                </span>

                <span>

                    <strong>Caja:</strong>

                    ${articulo.caja || "-"}

                    <button
                        class="btnEditarCampo"
                        onclick="editarCaja(${indice})">

                        ✏️

                    </button>

                </span>

            </p>

            <p>

                <strong>Interno:</strong>

                ${articulo.interno}

            </p>

            <p>

                <strong>Cantidad:</strong>

                ${articulo.cantidad}

                <button
                    class="btnEditarCampo"
                    onclick="editarCantidad(${indice})">

                    ✏️

                </button>

            </p>

            <p>

                <strong>Obs:</strong>

                ${articulo.observacion || "-"}

                <button
                    class="btnEditarCampo"
                    onclick="editarObservacion(${indice})">

                    ✏️

                </button>

            </p>

            <div class="mobile-actions">

                <button
                    onclick="eliminarArticulo(${indice})">

                    🗑 Eliminar

                </button>

            </div>

        `;

        contenedor.appendChild(card);

    });

}

// =========================================
// DASHBOARD
// =========================================

function actualizarDashboard() {

    document.getElementById("cantidadArticulos").textContent =
        lista.length;

    const total = lista.reduce(

        (a, b) => a + b.cantidad,

        0

    );

    document.getElementById("totalUnidades").textContent =
        total;

    const ultimo = lista.length
        ? lista[lista.length - 1].descripcion
        : "-";

    document.getElementById("ultimoArticulo").textContent =
        ultimo;

}

// =========================================
// EVENTOS TABLA
// =========================================

function registrarEventosTabla() {

    document.querySelectorAll(".btnEliminar")
        .forEach(btn => {

            btn.onclick = function () {

                eliminarArticulo(

                    Number(this.dataset.id)

                );

            };

        });

    document.querySelectorAll(".cantidadInput")
        .forEach(input => {

            input.onchange = function () {

                lista[this.dataset.id].cantidad =
                    Number(this.value);

                guardarInventario();

                actualizarDashboard();

            };

        });

    document.querySelectorAll(".descInput")
        .forEach(input => {

            input.onchange = function () {

                const valor = this.value.trim();

                if (valor) {

                    lista[this.dataset.id].descripcion = valor;

                    guardarInventario();

                    actualizarDashboard();

                } else {

                    // No dejamos guardar una descripción vacía:
                    // volvemos a mostrar la que tenía
                    this.value = lista[this.dataset.id].descripcion;

                }

            };

        });

    document.querySelectorAll(".cajaInput")
        .forEach(input => {

            input.onchange = function () {

                const indice = Number(this.dataset.id);

                lista[indice].caja = this.value.trim();


                const unificar =
                    document.getElementById("unificar").checked;

                if (unificar) {

                    const articulo = lista[indice];

                    const indiceExistente =
                        lista.findIndex((item, i) =>
                            i !== indice &&
                            item.ean === articulo.ean &&
                            item.interno === articulo.interno &&
                            (item.observacion || "") === (articulo.observacion || "") &&
                            (item.caja || "") === (articulo.caja || "")
                        );

                    if (indiceExistente !== -1) {

                        lista[indiceExistente].cantidad += articulo.cantidad;

                        lista.splice(indice, 1);

                        mostrarMensaje(
                            "Se unificó con un artículo existente",
                            "exito"
                        );

                        guardarInventario();

                        actualizarVista();

                        return;

                    }

                }


                guardarInventario();

            };

        });

    document.querySelectorAll(".obsInput")
        .forEach(input => {

            input.onchange = function () {

                lista[this.dataset.id].observacion =
                    this.value;

                guardarInventario();

            };

        });

}

// =========================================
// ELIMINAR
// =========================================

async function eliminarArticulo(indice) {

    const confirmado =
        await pedirConfirmacion(
            "Eliminar artículo",
            "¿Seguro que querés eliminar este artículo del inventario?",
            "Eliminar"
        );

    if (!confirmado)
        return;

    lista.splice(indice, 1);

    guardarInventario();

    actualizarVista();

    mostrarMensaje(

        "Artículo eliminado",

        "exito"

    );

}

// =========================================
// EDITAR
// =========================================

// =========================================
// MODAL DE EDICIÓN (reemplaza prompt())
// =========================================

let modalEditarCallback = null;

function abrirModalEditar(titulo, valorActual, tipo, callback) {

    const modal = document.getElementById("modalEditar");
    const input = document.getElementById("modalEditarInput");

    document.getElementById("modalEditarTitulo").textContent = titulo;

    input.type = tipo;
    input.value = valorActual;

    modalEditarCallback = callback;

    modal.classList.add("abierto");

    setTimeout(() => {
        input.focus();
        input.select();
    }, 50);

}

function cerrarModalEditar() {

    document.getElementById("modalEditar").classList.remove("abierto");

    const callback = modalEditarCallback;

    modalEditarCallback = null;

    // Avisamos que se canceló, igual que hace prompt() al devolver null
    if (callback)
        callback(null);

}

function confirmarModalEditar() {

    const valor = document.getElementById("modalEditarInput").value;

    document.getElementById("modalEditar").classList.remove("abierto");

    const callback = modalEditarCallback;

    modalEditarCallback = null;

    if (callback)
        callback(valor);

}

// Versión con Promise, para usar con "await" en funciones async
// (por ejemplo, al pedir el nombre del archivo antes de exportar)
function pedirTextoModal(titulo, valorActual, tipo = "text") {

    return new Promise((resolve) => {

        abrirModalEditar(
            titulo,
            valorActual,
            tipo,
            (valor) => resolve(valor)
        );

    });

}

// =========================================
// MODAL DE CONFIRMACIÓN (reemplaza confirm())
// =========================================

let modalConfirmarCallback = null;

function pedirConfirmacion(titulo, mensaje, textoBoton = "Confirmar") {

    return new Promise((resolve) => {

        document.getElementById("modalConfirmarTitulo").textContent = titulo;
        document.getElementById("modalConfirmarMensaje").textContent = mensaje;
        document.getElementById("modalConfirmarAceptar").textContent = textoBoton;

        modalConfirmarCallback = resolve;

        document.getElementById("modalConfirmar").classList.add("abierto");

    });

}

function cerrarModalConfirmar(resultado) {

    document.getElementById("modalConfirmar").classList.remove("abierto");

    const callback = modalConfirmarCallback;

    modalConfirmarCallback = null;

    if (callback)
        callback(resultado);

}

function editarDescripcion(indice) {

    abrirModalEditar(
        "Descripción",
        lista[indice].descripcion,
        "text",
        (valor) => {

            if (valor === null)
                return;

            if (valor.trim() === "")
                return;

            lista[indice].descripcion = valor.trim();

            guardarInventario();

            actualizarVista();

        }
    );

}

function editarCantidad(indice) {

    abrirModalEditar(
        "Cantidad",
        lista[indice].cantidad,
        "number",
        (valor) => {

            if (valor === null)
                return;

            const num = Number(valor);

            if (!num || num < 1) {

                mostrarMensaje(
                    "Cantidad no válida",
                    "error"
                );

                return;

            }

            lista[indice].cantidad = num;

            guardarInventario();

            actualizarVista();

        }
    );

}

function editarObservacion(indice) {

    abrirModalEditar(
        "Observación",
        lista[indice].observacion || "",
        "text",
        (valor) => {

            if (valor === null)
                return;

            lista[indice].observacion = valor;

            guardarInventario();

            actualizarVista();

        }
    );

}

function editarCaja(indice) {

    abrirModalEditar(
        "Caja",
        lista[indice].caja || "",
        "text",
        (valor) => {

            if (valor === null)
                return;

            lista[indice].caja = valor.trim();


            const unificar =
                document.getElementById("unificar").checked;

            if (unificar) {

                const articulo = lista[indice];

                const indiceExistente =
                    lista.findIndex((item, i) =>
                        i !== indice &&
                        item.ean === articulo.ean &&
                        item.interno === articulo.interno &&
                        (item.observacion || "") === (articulo.observacion || "") &&
                        (item.caja || "") === (articulo.caja || "")
                    );

                if (indiceExistente !== -1) {

                    lista[indiceExistente].cantidad += articulo.cantidad;

                    lista.splice(indice, 1);

                    mostrarMensaje(
                        "Se unificó con un artículo existente",
                        "exito"
                    );

                }

            }


            guardarInventario();

            actualizarVista();

        }
    );

}

// =========================================
// MENSAJES
// =========================================

let timerMensaje;

function mostrarMensaje(texto, tipo) {

    const div = document.getElementById("mensaje");

    clearTimeout(timerMensaje);

    div.className = tipo;

    div.textContent = texto;

    div.style.display = "block";

    // Reiniciar la animación para que se repita en mensajes seguidos
    div.classList.remove("mensaje-entrando", "mensaje-saliendo");
    void div.offsetWidth;
    div.classList.add("mensaje-entrando");

    timerMensaje = setTimeout(() => {

        div.classList.remove("mensaje-entrando");
        div.classList.add("mensaje-saliendo");

        setTimeout(() => {
            div.style.display = "none";
            div.classList.remove("mensaje-saliendo");
        }, 220);

    }, 2500);

}
