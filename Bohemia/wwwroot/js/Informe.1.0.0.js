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
          /* BOTÓN ANULAR */

          let botonRevertir = "";

          if (!venta.esReversa && !venta.esAnulada) {
            botonRevertir = `
            <button onclick="RevertirVenta(${venta.ventaID})"
                    class="btn btn-danger btn-sm ocultar-en-768px"
                    style="margin-left:10px;">
                Anular
            </button>`;
          }

          /* CABECERA VENTA */

          let estiloCabecera = venta.esReversa
            ? "background-color:#7f1d1d;"
            : venta.esAnulada
              ? "background-color:#78350f;"
              : "background-color:#1f2937;";

          contenidoTabla += `
<tr>
<td class="text-center" colspan="7"
    style="font-weight:bold; ${estiloCabecera}">
    
    <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
        <span class="text-warning">N° Venta: ${venta.ventaID}</span>
        <span class="ocultar-en-768px">Fecha: ${venta.fecha_Ventas}</span>
        <span class="ocultar-en-768px">${venta.emailUsuario}</span>
        <span class="ocultar-en-768px">${venta.forma_pagostring}</span>

        ${venta.esAnulada ? '<span style="color:red;">ANULADA</span>' : ""}
        ${venta.esReversa ? '<span style="color:red;">REVERSA</span>' : ""}

        ${botonRevertir}
    </div>
</td>
</tr>`;

          /* DETALLE PRODUCTOS */

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

<td class="ocultar-en-768px">
${detalle.descripcionProducto}
</td>

<td class="ocultar-en-768px">
$ ${formatearPrecioAR(detalle.precioCostoProducto)}
</td>

<td class="ocultar-en-768px">
$ ${formatearPrecioAR(detalle.precioUnitario)}
</td>

<td ${claseCantidad}>
${detalle.cantidad}
</td>

<td class="ocultar-en-768px" ${claseGanancia}>
$ ${formatearPrecioAR(detalle.gananciaProducto)}
</td>

<td ${claseTotal}>
$ ${formatearPrecioAR(detalle.totalVenta)}
</td>

</tr>`;
          });

          /* TOTAL POR VENTA */

          let claseTotalVenta =
            venta.total < 0 ? 'style="color:red;font-weight:bold;"' : "";

          let claseGananciaTotal =
            venta.gananciaTotal < 0
              ? 'style="color:red;font-weight:bold;"'
              : "";

          contenidoTabla += `
<tr style="background-color:#dff0d8;font-weight:bold;">

<td></td>
<td class="ocultar-en-768px"></td>
<td class="ocultar-en-768px"></td>
<td class="ocultar-en-768px"></td>

<td style="text-align:right;">
Total:
</td>

<td class="ocultar-en-768px" ${claseGananciaTotal}>
$ ${formatearPrecioAR(venta.gananciaTotal)}
</td>

<td ${claseTotalVenta}>
$ ${formatearPrecioAR(venta.total)}
</td>

</tr>`;
        });

        /* TOTAL GENERAL */

        let hayFiltrosAplicados =
          descripcionBuscar !== "0" || fechaDesde || fechaHasta;

        if (hayFiltrosAplicados) {
          contenidoTabla += `
<tr style="background-color:#ffd700;font-weight:bold;">

<td colspan="2"
    style="color:green;text-align:right;">

Total ventas seleccionadas:
$ ${formatearPrecioAR(totalVentasFecha)}

</td>

<td colspan="2"
    style="color:green;text-align:right;">

Ganancia total:
$ ${formatearPrecioAR(gananciaTotalFecha)}

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

document
  .getElementById("DescripcionBuscar")
  .addEventListener("change", TraerDetalleVentas);
document
  .getElementById("btnLimpiarFiltro")
  .addEventListener("click", function () {
    $("#DescripcionBuscar").val("0");
    TraerDetalleVentas();
  });

// Evento para limpiar el filtro y mostrar todas las ventas
document
  .getElementById("btnLimpiarFiltro")
  .addEventListener("click", function () {
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

function formatearPrecioAR(valor) {
  if (valor == null || valor === "") return "";

  if (typeof valor === "string") {
    valor = valor
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
  }

  const numero = parseFloat(valor);

  if (isNaN(numero)) return "";

  return numero.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}