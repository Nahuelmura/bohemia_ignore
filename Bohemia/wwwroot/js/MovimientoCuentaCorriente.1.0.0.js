window.onload = ListadoMovimientosCuentaCorriente();

function ListadoMovimientosCuentaCorriente() {
    $.ajax({
        url: "/MovimientoCuentaCorriente/ListadoMovimientosCuentaCorriente",
        type: "GET",
        dataType: "json",
        success: function (listadoMovimientos) {
            let contenidoTabla = ``;

            $.each(listadoMovimientos, function (index, movimiento) {
                contenidoTabla += `
                <tr>
                    <td>${movimiento.clienteID}</td>
                    <td>${movimiento.fecha}</td>
                    <td>${movimiento.tipoMovimiento}</td>
                    <td>${movimiento.importe}</td>
                    <td>${movimiento.saldo}</td>
                </tr>`;
            });

            $("#listadoMovimientosCuentaCorriente").html(contenidoTabla);
        }
    });
}