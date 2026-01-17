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
                    <td>${movimiento.clienteNombre}</td>
                    <td>${movimiento.fechaString}</td>
                    <td>${movimiento.tipoMovimientoDescripcion}</td>
                    <td>$ ${Number(movimiento.importe).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                    })}</td>
                    <td>$ ${Number(movimiento.saldo).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                    })}</td>
                </tr>`;
            });

            $("#listadoMovimientosCuentaCorriente").html(contenidoTabla);
        }
    });
}