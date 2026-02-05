window.onload = TraerDetalleVentas;
function TraerDetalleVentas() {
    let descripcionBuscar = $("#DescripcionBuscar").val();

    let fechaDesde = $("#FechaDesde").val();
    let fechaHasta = $("#FechaHasta").val();
    
    $.ajax({
        url: '../../Informe/TraerDetalleVentas',
        type: 'POST',
        dataType: 'json',
        data: {
         
            DescripcionBuscar: descripcionBuscar || "0" ,
            fechaDesde :fechaDesde,
            fechaHasta :fechaHasta
        },
        success: function (response) {
            let ventasMostrar = response.detalleVentasMostrar;
            let totalVentasFecha = response.totalVentasFecha;
            let gananciaTotalFecha = response.gananciaTotalFecha;
            
            let contenidoTabla = ``;

            if (ventasMostrar.length === 0) {
                contenidoTabla = `
                    <tr>
                        <td colspan="4" style="text-align: center; font-weight: bold; color: red;">
                            No se encontraron registros
                        </td>
                    </tr>`;
            } else {
                $.each(ventasMostrar, function (index, venta) {
                    contenidoTabla += `
                    <tr>
                    
                    
                         <td class="Textobohemia" colspan="5" style="font-weight: bold; background-color: #f0f0f0;">
                            N° Venta: ${venta.ventaID} - Fecha de venta: ${venta.fecha_Ventas} -: ${venta.emailUsuario}  -: ${venta.forma_pagostring}  
                        </td>
                    </tr>`;

                    $.each(venta.listadoDetalle, function (index, detalle) {
                        let claseCantidad = detalle.cantidad < 0 ? 'style="color: red; font-weight: bold;"' : '';
                        let claseTotal = detalle.totalVenta < 0 ? 'style="color: red; font-weight: bold;"' : '';
                        let ganancia = detalle.gananciaProducto < 0 ? 'style="color: red; font-weight: bold;"' : '';
                     
                        contenidoTabla += `
                        <tr>
                            <td>${detalle.codigoProducto}</td>
                            <td class=" ocultar-en-768px">${detalle.descripcionProducto}</td>
                            <td class=" ocultar-en-768px"> $ ${detalle.precioCostoProducto}</td>
                             <td class=" ocultar-en-768px"> $ ${detalle.precioUnitario}</td>
                             <td ${claseCantidad}>${detalle.cantidad}</td>
                            <td class=" ocultar-en-768px"  ${ganancia}> $ ${detalle.gananciaProducto}</td>
                           <td ${claseTotal}> $ ${detalle.totalVenta}</td>
                         

                             
                             
                           
                        </tr>`;
                    });

                    // Agregar la fila con el total de cada venta individual
                    let claseTotalVenta = venta.total < 0 ? 'style="color: red; font-weight: bold;"' : '';
                    let gananciaTotal = venta.gananciaTotal < 0 ? 'style="color: red; font-weight: bold;"' : '';
                    contenidoTabla += `
                    <tr style="background-color: #dff0d8; font-weight: bold;">
                        <td class="Textobohemia" colspan="3" style="text-align: right;">Total de la venta:</td>
                              <td ${claseTotalVenta}> $ ${venta.total}</td>
                        <td class="Textobohemia ocultar-en-768px">Ganancia total venta:</td> 
                         <td class=" ocultar-en-768px"${gananciaTotal}> $ ${venta.gananciaTotal}</td>
                    </tr>`;
                });

                // Agrega la fila con el total de todas las ventas del día
                    let hayFiltrosAplicados = ( descripcionBuscar !== "0" || fechaDesde || fechaHasta);

                if (hayFiltrosAplicados) {
                    contenidoTabla += `
                    <tr style="background-color: #ffd700; font-weight: bold;">
                        <td class="Textobohemia" colspan="3" style="color: green; font-weight: bold;  text-align: right;">Total de las ventas seleccionadas :
                       $ ${totalVentasFecha}</td>
                        <td class="Textobohemia" style="color: green; font-weight: bold;  text-align: right;">Ganancia total: $ ${gananciaTotalFecha}</td>
                    </tr>`;
                }
            }

            document.getElementById("tbody-informe").innerHTML = contenidoTabla;
        },
        error: function (xhr, status, error) {
            console.error("Error al traer los detalles de venta:", error);
        }
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
