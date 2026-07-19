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

            <td>${articulo.interno}</td>

            <td>${articulo.descripcion}</td>

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

            </h3>

            <p>

                <strong>EAN:</strong>

                ${articulo.ean}

            </p>

            <p>

                <strong>Interno:</strong>

                ${articulo.interno}

            </p>

            <p>

                <strong>Cantidad:</strong>

                ${articulo.cantidad}

            </p>

            <p>

                <strong>Obs:</strong>

                ${articulo.observacion || "-"}

            </p>

            <div class="mobile-actions">

                <button
                    onclick="editarArticulo(${indice})">

                    ✏️

                </button>

                <button
                    onclick="eliminarArticulo(${indice})">

                    🗑

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

function eliminarArticulo(indice) {

    if (!confirm("¿Eliminar artículo?"))
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

function editarArticulo(indice) {

    const cantidad = prompt(

        "Cantidad",

        lista[indice].cantidad

    );

    if (cantidad === null)
        return;

    lista[indice].cantidad = Number(cantidad);

    const obs = prompt(

        "Observación",

        lista[indice].observacion

    );

    if (obs !== null)
        lista[indice].observacion = obs;

    guardarInventario();

    actualizarVista();

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

    timerMensaje = setTimeout(() => {

        div.style.display = "none";

    }, 2500);

}
