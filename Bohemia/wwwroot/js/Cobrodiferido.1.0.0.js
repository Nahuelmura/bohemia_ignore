window.addEventListener('DOMContentLoaded', () => {
    listadoCobroCheque();
    cargarCuotas();

});

function listadoCobroCheque() {

    const fechaDesde = document.getElementById('fechaDesde')?.value;
    const fechaHasta = document.getElementById('fechaHasta')?.value;

    const params = new URLSearchParams();

    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    fetch(`/CobroDiferido/ListadoCobroCheques?${params.toString()}`)
        .then(response => response.json())
        .then(data => {

            // 🔹 Cantidad pendientes
            const chequesPendientes = data.filter(x => x.estado === "Pendiente");
            document.getElementById("badgeCheques").innerText = chequesPendientes.length;

            // 🔹 Total pendientes (UNA SOLA VEZ)
            const totalCheques = chequesPendientes
                .reduce((acum, c) => acum + c.montoTotal, 0);

            document.getElementById("totalCheques").innerText =
                totalCheques.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS"
                });

            const tbody = document.querySelector('#cobroChequeTable tbody');
            tbody.innerHTML = '';

            // 🔹 Armado de tabla
            data.forEach(cobro => {

                
                 // 🔴 Detectar vencida automáticamente
                const fecha = new Date(cobro.fechaCobro);
                const hoy = new Date();

                const row = document.createElement('tr');
                row.dataset.cobroChequeId = cobro.cobroChequeId;

                let claseEstado = '';
                let claseFila = '';

                let estadoTexto = cobro.estado
                    ? cobro.estado.toLowerCase()
                    : "pendiente";

                switch (estadoTexto) {
                    case 'cobrado':
                        claseEstado = 'badge-cobrado';
                        break;
                    case 'pendiente':
                        claseEstado = 'badge-pendiente';
                        break;
                    case 'vencido':
                        claseEstado = 'badge-vencido';
                        break;
                    case 'rechazado':
                        claseEstado = 'badge-rechazado';
                        claseFila = 'rechazado-row';
                        break;
                    default:
                        claseEstado = 'badge-pendiente';
                        estadoTexto = 'pendiente';
                        break;
                }



                row.className = claseFila;


                const fechaFormateada = fecha.toLocaleDateString("es-AR");

                row.innerHTML = `
                    <td>${cobro.cliente || 'N/A'}</td>
                    <td>${cobro.banco}</td>
                    <td>${cobro.numeroCheque}</td>
                    <td><strong>$${formatearNumero(cobro.montoTotal)}</strong></td>
                    <td>${cobro.fechaEmision}</td>
                    <td>${fechaFormateada}</td>
                    <td class="text-center">

                    ${cobro.estado === 'Pendiente' ? `
                        <div class="d-flex justify-content-center gap-2">

                            <button 
                                class="btn btn-success btn-sm btn-action"
                                onclick="marcarCobradoCheque(${cobro.cobroChequeID})"
                                title="Marcar como cobrado">
                                <i class="fas fa-check"></i>
                            </button>

                            <button 
                                class="btn btn-outline-danger btn-sm btn-action"
                                onclick="marcarRechazado(${cobro.cobroChequeID})"
                                title="Marcar como rechazado">
                                <i class="fas fa-times"></i>
                            </button>

                        </div>
                    `
                    :
                    `
                        <span class="badge badge-estado ${claseEstado}">
                            ${estadoTexto.charAt(0).toUpperCase() + estadoTexto.slice(1)}
                        </span>
                    `}

                </td>
                `;

                tbody.appendChild(row);
            });

        })
        .catch(error => console.error('Error al cargar los datos:', error));
}


function marcarCobradoCheque(id) {


    Swal.fire({
        title: "¿Confirmar cobro?",
        text: "Se registrará el cobro y se actualizará el estado.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, cobrar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (!result.isConfirmed) return;

        fetch(`/CobroDiferido/MarcarCobradoCheque/${id}`, {
            method: "POST"
        })
        .then(r => {
            if (!r.ok) throw new Error();
        })
        .then(() => listadoCobroCheque()) // 🔥 mejor recargar tabla
        .catch(() => {
            Swal.fire("Error", "No se pudo registrar el cobro.", "error");
        });

    });
}


function marcarRechazado(id) {

    if (!id) {
        console.error("ID inválido:", id);
        return;
    }

    Swal.fire({
        title: "¿Rechazar cobro?",
        text: "Esta acción marcará el cheque como rechazado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, rechazar",
        cancelButtonText: "Cancelar"
    }).then(result => {

        if (!result.isConfirmed) return;

        fetch(`/CobroDiferido/MarcarRechazado/${id}`, {
            method: "POST"
        })
        .then(r => {
            if (!r.ok) throw new Error();
        })
        .then(() => {

            Swal.fire({
                title: "Rechazado",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            listadoCobroCheque(); // 🔥 recarga tabla completa

        })
        .catch(() => {
            Swal.fire({
                title: "Error",
                text: "No se pudo actualizar el estado.",
                icon: "error"
            });
        });

    });
}






function cargarCuotas() {

    
    fetch('/CobroDiferido/ListadoCobroCuotas')
    .then(response => response.json())
    .then(data => {

        const tbody = document.getElementById("tbodyCuotas");
        tbody.innerHTML = "";

        // 🔹 Cuotas pendientes
        const cuotasPendientes = data.filter(x => !x.pagada);

        // 🔹 Badge cantidad
        document.getElementById("badgeCuotas").innerText =
            cuotasPendientes.length;

        // 🔹 Total pendiente
        const total = cuotasPendientes
            .reduce((acum, c) => acum + c.montoCuota, 0);

        document.getElementById("totalCuotas").innerText =
            "$" + formatearNumero(total);

        // 🔹 Armar filas
        data.forEach(c => {

            let estadoBadge = "";
            let filaClase = "";

            // 🔴 Detectar vencida automáticamente
            const fecha = new Date(c.fechaVencimiento);
            const hoy = new Date();

            if (c.pagada) {
                estadoBadge = `<span class="badge bg-success">Cobrada</span>`;
            } 
            else if (fecha < hoy) {
                estadoBadge = `<span class="badge bg-danger">Vencida</span>`;
                filaClase = "table-danger";
            }
            else {
                estadoBadge = `<span class="badge bg-warning text-dark">Pendiente</span>`;
            }

            const fechaFormateada = fecha.toLocaleDateString("es-AR");

            const fila = `
                <tr class="${filaClase}">
                    <td><strong>${c.cliente}</strong></td>
                    <td>Cuota ${c.numeroCuota}</td>
                    <td><strong>$${formatearNumero(c.montoCuota)}</strong></td>
                    <td>${fechaFormateada}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        ${!c.pagada ? `
                        <button class="btn btn-sm btn-success"
                            onclick="marcarCobrado(${c.cobroCuotaID})">
                            <i class="fas fa-check"></i> Cobrar
                        </button>` : ""}
                    </td>
                </tr>
            `;

            tbody.innerHTML += fila;
        });

    })
    .catch(error => {
        console.error("Error:", error);
    });
}

let listaCuotas = [];
let listaCheques = [];

document.addEventListener("DOMContentLoaded", function () {

    cargarCuota();
    cargarCheques();


});

function cargarCuota() {

    fetch('/CobroDiferido/ListadoCobroCuotas')
        .then(r => r.json())
        .then(data => {
            listaCuotas = data;
            actualizarCard();
            actualizarCobradosMes();
            actualizarCardVencidos(listaCheques, listaCuotas);
            actualizarCardRechazados(listaCheques);
        });
}

function cargarCheques() {

    fetch('/CobroDiferido/ListadoCobroCheques')
        .then(r => r.json())
        .then(data => {
            listaCheques = data;
            actualizarCard();
            actualizarCobradosMes();
            actualizarCardVencidos(listaCheques, listaCuotas);
            actualizarCardRechazados(listaCheques);
        });
}

function actualizarCard() {

    if (!listaCuotas.length && !listaCheques.length)
        return;

    const cuotasPendientes = listaCuotas.filter(c => !c.pagada);
    const chequesPendientes = listaCheques.filter(c => c.estado === "Pendiente");

    const totalCuotas = cuotasPendientes.reduce((a, c) => a + c.montoCuota, 0);
    const totalCheques = chequesPendientes.reduce((a, c) => a + c.montoTotal, 0);

    const total = totalCuotas + totalCheques;

    document.getElementById("totalPorCobrar").innerText =
        "$" + formatearNumero(total);

    document.getElementById("detallePorCobrar").innerText =
        chequesPendientes.length + " Cheques + " +
        cuotasPendientes.length + " Cuotas";
}


function actualizarCobradosMes() {

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    

    // Cheques cobrados este mes
    const chequesCobrados = listaCheques.filter(c => {

        if (c.estado !== "Cobrado") return false;

        const fecha = new Date(c.fechaCobro);

        return fecha.getMonth() === mesActual &&
               fecha.getFullYear() === anioActual;
    });

    

    // Cuotas pagadas este mes
    const cuotasCobradas = listaCuotas.filter(c => {

        if (!c.pagada) return false;

        const fecha = new Date(c.fechaVencimiento);

        return fecha.getMonth() === mesActual &&
               fecha.getFullYear() === anioActual;
    });

    const totalCheques = chequesCobrados.reduce((a, c) => a + c.montoTotal, 0);
    const totalCuotas = cuotasCobradas.reduce((a, c) => a + c.montoCuota, 0);

    const total = totalCheques + totalCuotas;

    document.getElementById("totalCobradosMes").innerText =
        "$" + formatearNumero(total);

    document.getElementById("detalleCobradosMes").innerText =
        chequesCobrados.length + " Cheques + " +
        cuotasCobradas.length + " Cuotas";
}


function marcarCobrado(cobroCuotaID) {
    
    fetch(`/CobroDiferido/MarcarCobrado/${cobroCuotaID}`, {
        method: 'POST'
    }) 
    .then(response => {
        if (response.ok) {
            cargarCuotas(); // tenías mal el nombre
            cargarCheques();
        } else {
            console.error('Error al marcar como cobrado');
        }
    })
    .catch(error => console.error('Error en la solicitud:', error));
}



function actualizarCardVencidos(listaCheques, listaCuotas) {

    const hoy = new Date();

    // 🔴 Cheques vencidos
    const chequesVencidos = listaCheques.filter(c => {
        if (c.estado !== "Pendiente") return false;

        const fecha = new Date(c.fechaCobro);
        return fecha < hoy;
    });

    // 🔴 Cuotas vencidas
    const cuotasVencidas = listaCuotas.filter(c => {
        if (c.pagada) return false;

        const fecha = new Date(c.fechaVencimiento);
        return fecha < hoy;
    });

    // 🔹 Total vencido
    const totalCheques = chequesVencidos
        .reduce((acum, c) => acum + c.montoTotal, 0);

    const totalCuotas = cuotasVencidas
        .reduce((acum, c) => acum + c.montoCuota, 0);

    const totalGeneral = totalCheques + totalCuotas;

    // 🔹 Mostrar monto
    document.getElementById("totalVencidos").innerText =
        totalGeneral.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS"
        });

    // 🔹 Mostrar detalle
    document.getElementById("detalleVencidos").innerText =
        `${chequesVencidos.length} Cheques + ${cuotasVencidas.length} Cuotas`;
}


function actualizarCardRechazados(listaCheques) {

    const chequesRechazados = listaCheques
        .filter(c => c.estado === "Rechazado");

    const total = chequesRechazados
        .reduce((acum, c) => acum + c.montoTotal, 0);

    document.getElementById("totalRechazados").innerText =
        total.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS"
        });

    document.getElementById("detalleRechazados").innerText =
        `${chequesRechazados.length} Cheques`;
}

function formatearNumero(numero) {
    return numero.toLocaleString("es-AR");
}


