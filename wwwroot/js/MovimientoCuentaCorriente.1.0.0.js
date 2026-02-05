window.onload = () => {
    cargarTarjetasClientes();
    cargarSaldoTotal();
    cargarTotalPendiente();
};

function cargarTarjetasClientes() {
    $.ajax({
        url: "/MovimientoCuentaCorriente/ListadoCuentaCorrienteClientes",
        type: "GET",
        success: function (clientes) {

            let html = "";

            clientes.forEach(c => {

                const iniciales = c.clienteNombre
                    .split(" ")
                    .map(p => p[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                html += `
                <article class="client-card"
                         data-clienteid="${c.clienteID}"
                         data-nombre="${c.clienteNombre}"
                         data-saldo="${c.saldoActual}"
                         onclick="openDrawer(this)">

                    <div class="card-header">
                        <div class="client-info-row">
                            <div class="client-main-info">
                                <div class="avatar-circle">${iniciales}</div>
                                <div class="client-details">
                                    <h2>${c.clienteNombre}</h2>
                                    <div class="client-meta">
                                        <span class="status-badge active">Activo</span>
                                        <span>último: ${formatearFecha(c.ultimoMovimiento)}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="balances-container">
                                <div class="balance-row">
                                    <div class="balance-item">
                                        <span class="balance-label">Saldo Actual</span>
                                        <span class="balance-amount ${c.saldoActual >= 0 ? "positive" : "warning"}">
                                            $ ${formatearNumero(c.saldoActual)}
                                        </span>
                                    </div>

                                <div class="chevron-wrapper">
                                    <svg class="chevron-icon" viewBox="0 0 24 24">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>`;
            });

            $("#cardsContainer").html(html);
        }
    });
}



function cargarMovimientosCliente(clienteID) {
    $.ajax({
        url: `/MovimientoCuentaCorriente/ListadoPorCliente?clienteID=${clienteID}`,
        type: "GET",
        success: function (movimientos) {

            let html = "";

            movimientos.forEach(m => {

                const fecha = new Date(m.fecha);
                const dia = fecha.getDate();
                const mes = fecha.toLocaleString("es-AR", { month: "short" }).toUpperCase();

                const esVenta = m.tipoMovimiento === 1;

                html += `
                <div class="transaction-item">
                    <div class="trans-date-badge">
                        <span class="day">${dia}</span>
                        <span class="month">${mes}</span>
                    </div>

                    <div class="trans-details">
                        <span class="trans-type ${esVenta ? "type-venta" : "type-cobro"}">
                            ${esVenta ? "Venta" : "Cobro"}
                        </span>
                    </div>

                    <span class="trans-amount ${esVenta ? "positive" : "negative"}">
                        $ ${formatearNumero(Math.abs(m.importe))}
                    </span>
                </div>`;
            });

            $("#drawerTransactions").html(html);
        }
    });
}


let clienteActivoID = null;

function openDrawer(card) {

    const clienteID = card.dataset.clienteid;
    const nombre = card.dataset.nombre;
    const saldo = card.dataset.saldo;

    clienteActivoID = clienteID;

    const iniciales = nombre
        .split(" ")
        .map(p => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    document.getElementById("drawerAvatar").innerText = iniciales;
    document.getElementById("drawerClientName").innerText = nombre;
    document.getElementById("drawerBalance").innerText =
        `Saldo: $ ${formatearNumero(saldo)}`;

    // 🔥 Cargar movimientos del cliente
    cargarMovimientosCliente(clienteID);

    // 🔥 Abrir drawer
    document.getElementById("drawerOverlay").classList.add("active");
    document.getElementById("drawerPanel").classList.add("active");
}

function closeDrawer() {
    document.getElementById("drawerOverlay").classList.remove("active");
    document.getElementById("drawerPanel").classList.remove("active");
}


function cargarSaldoTotal() {
    $.ajax({
        url: "/MovimientoCuentaCorriente/ObtenerSaldoTotal",
        type: "GET",
        success: function (saldo) {
            document.querySelector(".stat-card .value").innerText =
                `$ ${formatearNumero(saldo)}`;
        }
    });
}


function cargarTotalPendiente() {
    $.ajax({
        url: "/MovimientoCuentaCorriente/ObtenerTotalPendiente",
        type: "GET",
        success: function (pendiente) {
            const el = document.getElementById("totalPendiente");

            el.innerText = `$ ${formatearNumero(pendiente)}`;

            // opcional: color según estado
            if (pendiente > 0) {
                el.classList.add("warning");
            } else {
                el.classList.remove("warning");
            }
        }
    });

}





function formatearNumero(valor) {
    return Number(valor).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR");
}










