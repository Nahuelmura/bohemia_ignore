window.onload = () => {
  cargarTarjetasClientes("");
  cargarTotalPendiente();
  cargarSaldoTotal();
};


$("#txtBuscarCliente").on("keyup", function () {
  let nombre = $(this).val();
  cargarTarjetasClientes(nombre);
});
function cargarTarjetasClientes(nombre) {
  $.ajax({
    url: "/MovimientoCuentaCorriente/ListadoCuentaCorrienteClientes",
    type: "GET",
    data: { nombre: nombre},
    success: function (clientes) {
      let html = "";

      clientes.forEach((c) => {
        const iniciales = c.clienteNombre
          .split(" ")
          .map((p) => p[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        html += `
                <article class="client-card"
                         data-clienteid="${c.clienteID}"
                         data-nombre="${c.clienteNombre}"
                         data-saldo="${c.SumaSaldo}"
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
                                        <span class="balance-amount ${c.pendiente >= 0 ? "positive" : "warning"}">
                                            $ ${formatearNumero(c.pendiente)}
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
    },
  });
}

function cargarMovimientosCliente(clienteID) {
  $.ajax({
    url: `/MovimientoCuentaCorriente/ListadoPorCliente?clienteID=${clienteID}`,
    type: "GET",
    success: function (movimientos) {
      let html = "";

      movimientos.forEach((m) => {
        const fecha = new Date(m.fecha);
        const dia = fecha.getDate();
        const mes = fecha
          .toLocaleString("es-AR", { month: "short" })
          .toUpperCase();

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
                        <div class="trans-meta">
                            <span>${m.referenciaTipo ?? ""}</span>
                        </div>
                    </div>

                    <span class="trans-amount ${esVenta ? "positive" : "negative"}">
                        ${esVenta ? "+" : "-"} $ ${formatearNumero(Math.abs(m.importe))}
                    </span>
                </div>`;
      });

      $("#drawerTransactions").html(html);
    },
  });
}

let clienteActivoID = null;

function openDrawer(card) {
  const clienteID = card.dataset.clienteid;
  const nombre = card.dataset.nombre;
  const saldo = Number(card.dataset.saldo);

  console.log("Saldo dataset:", card.dataset.saldo);
  console.log("Saldo numérico:", Number(card.dataset.saldo));

  clienteActivoID = clienteID;

  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  document.getElementById("drawerAvatar").innerText = iniciales;
  document.getElementById("drawerClientName").innerText = nombre;
  document.getElementById("drawerBalance").innerText =
    `Saldo: $ ${formatearNumero(saldo)}`;

  // 🔥 Cargar movimientos del cliente
  cargarMovimientosCliente(clienteID);
  SumaSaldo(clienteID); // 👈 le pasás el ID del cliente

  // 🔥 Abrir drawer
  document.getElementById("drawerOverlay").classList.add("active");
  document.getElementById("drawerPanel").classList.add("active");
}

function closeDrawer() {
  document.getElementById("drawerOverlay").classList.remove("active");
  document.getElementById("drawerPanel").classList.remove("active");
}

function SumaSaldo(clienteID) {
  $.ajax({
    url: "/MovimientoCuentaCorriente/SumaSaldo",
    type: "GET",
    data: { clienteID: clienteID },
    dataType: "json",
    success: function (response) {
      document.getElementById("drawerBalance").innerText =
        `saldo: $ ${formatearNumero(response.saldo)}`; // 👈 actualiza el drawer
    },
    error: function () {
      alert("Error al obtener el saldo");
    },
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
    },
  });
}

function cargarSaldoTotal() {
  $.ajax({
    url: "/MovimientoCuentaCorriente/ObtenerSaldoTotal",
    type: "GET",
    dataType: "json",
    success: function (response) {
      document.getElementById("saldoTotal").innerText =
        // 👈 cambio acá
        `$ ${formatearNumero(response.saldo)}`; // 👈 ahora usa el id
    },
    error: function () {
      alert("Error al obtener el saldo total");
    },
  });
}

function formatearNumero(valor) {
  return Number(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-AR");
}



function generarEstadoCuenta() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const nombre = document.getElementById("drawerClientName").innerText;
  const saldoTexto = document.getElementById("drawerBalance").innerText;
  const fechaActual = new Date().toLocaleDateString("es-AR");

  // 🏷️ TÍTULO
  doc.setFontSize(18);
  doc.text("ESTADO DE CUENTA", 105, 20, { align: "center" });

  // 📋 DATOS CLIENTE
  doc.setFontSize(12);
  doc.text(`Cliente: ${nombre}`, 14, 35);
  doc.text(`Fecha emisión: ${fechaActual}`, 14, 42);
  doc.text(saldoTexto, 14, 49);

  // 📌 CAPTURAR MOVIMIENTOS REALES DEL DRAWER
  const filas = [];
  const movimientos = document.querySelectorAll(
    "#drawerTransactions .transaction-item",
  );

  movimientos.forEach((mov) => {
    const dia = mov.querySelector(".day")?.innerText || "";
    const mes = mov.querySelector(".month")?.innerText || "";
    const tipo = mov.querySelector(".trans-type")?.innerText || "";
    const referencia = mov.querySelector(".trans-meta span")?.innerText || "";
    const importe = mov.querySelector(".trans-amount")?.innerText || "";

    const fecha = `${dia} ${mes}`;
    const detalle = `${tipo} ${referencia}`;

    filas.push([fecha, detalle, importe]);
  });

  // 📊 TABLA EN PDF
  doc.autoTable({
    startY: 60,
    head: [["Fecha", "Detalle", "Importe"]],
    body: filas,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 40, 40] },
    columnStyles: {
      2: { halign: "right" },
    },
  });


// Tu contenido
doc.text("Estado de Cuenta", 10, 10);

// En vez de guardar:
window.open(doc.output("bloburl"), "_blank");
}