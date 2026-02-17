window.onload = TraerDetalleVentas;
function TraerDetalleVentas() {
  let descripcionBuscar = $("#DescripcionBuscar").val();
  let fechaDesde = $("#FechaDesde").val();
  let fechaHasta = $("#FechaHasta").val();

  $.ajax({
    url: "../../Informe/TraerDetalleVentas",
    type: "POST",
    dataType: "json",
    data: {
      DescripcionBuscar: descripcionBuscar || "0",
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
    },
    success: function (response) {
      let ventasMostrar = response.detalleVentasMostrar;
      let totalVentasFecha = response.totalVentasFecha;
      let gananciaTotalFecha = response.gananciaTotalFecha;

      let contenidoTabla = ``;

      if (!ventasMostrar || ventasMostrar.length === 0) {
        contenidoTabla = `
                    <tr>
                        <td colspan="7" style="text-align:center;font-weight:bold;color:red;">
                            No se encontraron registros
                        </td>
                    </tr>`;
      } else {
        $.each(ventasMostrar, function (index, venta) {
          /* ------------------ BOTÓN ANULAR ------------------ */

          let botonRevertir = "";

          if (!venta.esReversa && !venta.esAnulada) {
            botonRevertir = `
                            <button onclick="RevertirVenta(${venta.ventaID})"
                                    class="btn btn-danger btn-sm"
                                    style="margin-left:10px;">
                                Anular
                            </button>`;
          }

          /* ------------------ CABECERA VENTA ------------------ */

          let estiloCabecera = venta.esReversa
            ? "background-color:#f8d7da;"
            : venta.esAnulada
              ? "background-color:#ffeeba;"
              : "background-color:#f0f0f0;";

          contenidoTabla += `
                        <tr>
                            <td class="Textobohemia" colspan="7"
                                style="font-weight:bold; ${estiloCabecera}">
                                
                                N° Venta: ${venta.ventaID}
                                - Fecha: ${venta.fecha_Ventas}
                                - ${venta.emailUsuario}
                                - ${venta.forma_pagostring}

                                ${venta.esAnulada ? '<span style="color:red;margin-left:10px;">ANULADA</span>' : ""}
                                ${venta.esReversa ? '<span style="color:red;margin-left:10px;">REVERSA</span>' : ""}

                                ${botonRevertir}
                            </td>
                        </tr>`;

          /* ------------------ DETALLES ------------------ */

          $.each(venta.listadoDetalle, function (i, detalle) {
            let claseCantidad =
              detalle.cantidad < 0 ? 'style="color:red;font-weight:bold;"' : "";

            let claseTotal =
              detalle.totalVenta < 0
                ? 'style="color:red;font-weight:bold;"'
                : "";

            let claseGanancia =
              detalle.gananciaProducto < 0
                ? 'style="color:red;font-weight:bold;"'
                : "";

            contenidoTabla += `
                            <tr>
                                <td>${detalle.codigoProducto}</td>
                                <td class="ocultar-en-768px">${detalle.descripcionProducto}</td>
                                <td class="ocultar-en-768px">$ ${detalle.precioCostoProducto}</td>
                                <td class="ocultar-en-768px">$ ${detalle.precioUnitario}</td>
                                <td ${claseCantidad}>${detalle.cantidad}</td>
                                <td class="ocultar-en-768px" ${claseGanancia}>$ ${detalle.gananciaProducto}</td>
                                <td ${claseTotal}>$ ${detalle.totalVenta}</td>
                            </tr>`;
          });

          /* ------------------ TOTAL POR VENTA ------------------ */

          let claseTotalVenta =
            venta.total < 0 ? 'style="color:red;font-weight:bold;"' : "";

          let claseGananciaTotal =
            venta.gananciaTotal < 0
              ? 'style="color:red;font-weight:bold;"'
              : "";

          contenidoTabla += `
                        <tr style="background-color:#dff0d8;font-weight:bold;">
                            <td colspan="3" style="text-align:right;">
                                Total de la venta:
                            </td>
                            <td ${claseTotalVenta}>$ ${venta.total}</td>
                            <td class="ocultar-en-768px">Ganancia total:</td>
                            <td class="ocultar-en-768px" ${claseGananciaTotal}>
                                $ ${venta.gananciaTotal}
                            </td>
                            <td></td>
                        </tr>`;
        });

        /* ------------------ TOTAL GENERAL ------------------ */

        let hayFiltrosAplicados =
          descripcionBuscar !== "0" || fechaDesde || fechaHasta;

        if (hayFiltrosAplicados) {
          contenidoTabla += `
                        <tr style="background-color:#ffd700;font-weight:bold;">
                            <td colspan="4"
                                style="color:green;text-align:right;">
                                Total ventas seleccionadas:
                                $ ${totalVentasFecha}
                            </td>
                            <td colspan="3"
                                style="color:green;text-align:right;">
                                Ganancia total:
                                $ ${gananciaTotalFecha}
                            </td>
                        </tr>`;
        }
      }

      $("#tbody-informe").html(contenidoTabla);
    },
    error: function () {
      alert("Error al traer los detalles de venta");
    },
  });
}

/* ------------------ FUNCIÓN PARA ANULAR ------------------ */

function RevertirVenta(ventaId) {
  if (!confirm("¿Seguro que querés anular esta venta?")) {
    return;
  }

  $.ajax({
    url: "/Venta/RevertirVenta",
    type: "POST",
    data: { ventaId: ventaId },
    success: function (response) {
      if (response.ok) {
        alert("Venta anulada correctamente");
        TraerDetalleVentas(); // Recarga automática
      } else {
        alert(response.mensaje);
      }
    },
    error: function () {
      alert("Error al anular la venta");
    },
  });
}












document.getElementById("DescripcionBuscar").addEventListener("change", TraerDetalleVentas);
document.getElementById("btnLimpiarFiltro").addEventListener("click", function () {
    $("#DescripcionBuscar").val("0");
    TraerDetalleVentas();
});


// Evento para limpiar el filtro y mostrar todas las ventas
document.getElementById("btnLimpiarFiltro").addEventListener("click", function () {
    $("#FechaBuscar").val(""); // Borrar la fecha seleccionada
    TraerDetalleVentas(null); // Recargar todas las ventas sin filtro
});





// function RevertirVenta(ventaId) {
//   if (!confirm("¿Seguro que querés anular esta venta?")) {
//     return;
//   }

//   $.ajax({
//     url: "../../Venta/RevertirVenta",
//     type: "POST",
//     data: { ventaId: ventaId },
//     success: function (response) {
//       if (response.ok) {
//         alert("Venta anulada correctamente");
//         TraerDetalleVentas(); // Recargar informe
//       } else {
//         alert(response.mensaje);
//       }
//     },
//     error: function () {
//       alert("Error al intentar anular la venta");
//     },
//   });
// }



// function ObtenerProductosMinimos() {
//     $.ajax({
//         url: '../../Informe/ProductosMinimos',
//         type: 'GET',
//         dataType: 'json',
//         beforeSend: function () {
//             $("#tbody-productos-minimos").html(`<tr><td colspan="3" style="text-align:center;">Cargando...</td></tr>`);
//         },
//         success: function (response) {
//             let contenidoTabla = response.length === 0
//                 ? `<tr><td colspan="3" style="text-align: center; font-weight: bold; color: red;">No hay productos registrados</td></tr>`
//                 : response.map(producto => `
//                     <tr>
//                         <td>${producto.descripcionProducto}</td>
//                         <td>${producto.nombreProducto}</td>
//                         <td>${producto.totalVentas}</td>
//                     </tr>
//                 `).join("");

//             $("#tbody-productos-minimos").html(contenidoTabla);
//         },
//         error: function (xhr, status, error) {
//             console.error("Error al traer los productos menos vendidos:", error);
//         }
//     });
// }

// // Llamar la función cuando la página cargue
// window.onload = ObtenerProductosMinimos;
