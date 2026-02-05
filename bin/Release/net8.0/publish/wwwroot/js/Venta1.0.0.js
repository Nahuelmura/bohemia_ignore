window.onload = ListadoDetalleVenta();


$(document).ready(function () {
    $("#buscarventa, #fechabuscarventa, #descripcionbuscarventa").on("keyup change", function () {

        ListadoDetalleVenta();
    });
});

function ListadoDetalleVenta() {
    var codigobuscarVenta = $("#buscarventa").val();
    var fechabuscarventa = $("#fechabuscarventa").val();
    let descripcionbuscarventa = $("#descripcionbuscarventa").val();

    $.ajax(
        {

            url: '../../Venta/ListadoDetalleVenta',
            data: { codigo: codigobuscarVenta, fecha: fechabuscarventa, Descripcionbuscarventa: descripcionbuscarventa || "0" },
            type: 'POST',
            dataType: 'json',


            success: function (listadoVentas) {
                let contenidoTabla = ``;

                $.each(listadoVentas, function (index, ventas) {

                    let claseCantidad = ventas.cantidad < 0 ? 'style="color: red; font-weight: bold;"' : '';
                    let claseTotal = ventas.total < 0 ? 'style="color: red; font-weight: bold;"' : '';


                    let observacion = (ventas.observacion === null || ventas.observacion === undefined || ventas.observacion.trim() === "")
                        ? "No definido"
                        : ventas.observacion;

                    contenidoTabla += `
                    <tr>
                        <td>${ventas.codigoProducto}</td>
                        <td  class="ocultar-en-768px">${ventas.descripcionProducto}</td>
                        <td>${observacion}</td> 
                        <td class="ocultar-en-768px">${ventas.fecha_Venta_string}</td>
                        <td> $ ${  ventas.precioUnitario}</td>
                         <td  class="ocultar-en-768px"> ${claseCantidad}${ventas.cantidad}</td>
                        <td ${claseTotal} class="ocultar-en-768px">$ ${ventas.total}</td> 
                          <td class="ocultar-en-768px">${ventas.forma_pagostring}</td>
                     
                    </tr>
                `;
                });


                document.getElementById("tbody-Carga_Venta").innerHTML = contenidoTabla;
            },
            error: function (xhr, status) {
                console.error("Error al cargar los datos de venta.");
            }

        }
    )
}

// Definir la variable en el ámbito global
let formaPagoCambiado = false;

$(document).ready(function () {
    $("#Forma_pago").one("change", function () {
        if (!formaPagoCambiado) {
            formaPagoCambiado = true;
            $(this).prop("disabled", true);
        }
    });
});

// Cuando se cierra el modal, se habilita el select y se reinicia su valor
$('#DetalleModal').on('hidden.bs.modal', function () {
    const select = $("#Forma_pago");
    select.prop("disabled", false);
    select.prop("selectedIndex", 0); // Esto vuelve al primer valor
    formaPagoCambiado = false;

    // Permitir que vuelva a deshabilitarse al cambiar (reiniciar one)
    select.off("change").one("change", function () {
        if (!formaPagoCambiado) {
            formaPagoCambiado = true;
            $(this).prop("disabled", true);
        }
    });
});

function obtenerPorcentajeDescuentoPorValor(formaVal) {
    switch (parseInt(formaVal, 10)) {
        case 1: // Contado
        case 3: // Descuento_10
            return 0.10;
        case 2: // financiacion
            return 0.00;
        case 4: return 0.20; // Descuento_20
        case 5: return 0.30;
        case 6: return 0.40;
        case 7: return 0.50;
        default: return 0.00;
    }
}

function actualizarTotalConDescuento() {
    let cantidad = parseInt($("#cantidad").val(), 10) || 0;
    let precio = parseFloat($("#precioUnitario").val().replace(",", ".")) || 0;
    let formaVal = $("#Forma_pago").val();

    let porcentaje = obtenerPorcentajeDescuentoPorValor(formaVal);
    let totalFinal = cantidad * precio * (1 - porcentaje);

    $("#totalConDescuento").val(totalFinal.toFixed(2));
}

$(document).ready(function () {
    
    $("#Forma_pago").on("change", actualizarTotalConDescuento);
    $("#cantidad").on("input", actualizarTotalConDescuento);

    $("#CodigoProducto").on("blur", function () {
      
        actualizarTotalConDescuento();
    });
});





// alerta verde. tostol 
document.addEventListener("DOMContentLoaded", function () {
    var delayModal = 2000;
    var delayOutside = 400;

    setTimeout(function () {
        var myToastModal = document.getElementById('myToastModal');
        if (myToastModal) {
            new bootstrap.Toast(myToastModal).show();
        }
    }, delayModal);

    setTimeout(function () {
        var myToastOutside = document.getElementById('myToastOutside');
        if (myToastOutside) {
            new bootstrap.Toast(myToastOutside).show();
        }
    }, delayOutside);
});


$(document).ready(function () {
    $("#CodigoProducto").on("blur", function () {
        let codigo = $(this).val().toUpperCase();

        if (codigo.trim() !== "") {
            $.ajax({
                url: '../../Venta/ObtenerProductoInfo',
                type: 'GET',
                dataType: 'json',
                data: { codigoProducto: codigo },
                success: function (response) {
                    if (response.success) {
                        $("#precioUnitario").val(response.precio); // Asignar precio
                        $("#stockdisponible").val(response.stock); // Asignar stock disponible
                        $("#descripcion").val(response.descripcionProducto);
                        $("#Observacion").val(response.observacion);
                    } else {
                        $("#precioUnitario").val(""); // Limpiar si no existe
                        $("#stockdisponible").val(""); // Limpiar si no existe
                        $("#descripcion").val("")
                        $("#Observacion").val("");
                        alert(response.message);
                    }
                },
                error: function () {
                    alert("Error al obtener la información del producto");
                }
            });
        } else {
            $("#precioUnitario").val(""); // Limpiar si el código está vacío
            $("#stockdisponible").val("");
            $("#descripcion").val("");
            $("#Observacion").val("");
        }
    });
});









let detallesVenta = [];


function AgregarProductoTemporal() {
    let codigoProducto = $("#CodigoProducto").val().toUpperCase();
    let cantidad = parseInt($("#cantidad").val());
    let precioUnitario = parseFloat($("#precioUnitario").val());
    let descripcion = $("#descripcion").val();
    let observacion = $("#Observacion").val() || "No definido"; // Si es null o vacío, asigna "No definido"
    let stockDisponible = parseInt($("#stockdisponible").val());
    let forma_Pago = $("#Forma_pago option:selected").text();
    let totalConDescuento = $("#totalConDescuento").val();





    if (!codigoProducto || isNaN(cantidad) || isNaN(precioUnitario)) {
        alert("Ingrese datos válidos");
        return;
    }


    if (cantidad > stockDisponible) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Tienes ${stockDisponible} unidades disponibles.`
        });
        return;
    }

    // Agregar producto a la memoria
    detallesVenta.push({
        codigoProducto: codigoProducto,
        cantidad: cantidad,
        observacion: observacion,
        precioUnitario: precioUnitario,
        descripcion: descripcion,
        forma_Pago: forma_Pago,
        totalConDescuento: totalConDescuento





    });
    console.log(forma_Pago)
    // Actualizar la tabla después de agregar el producto
    ActualizarTabla();

    ActualizarTotalCompra();

    limpiarCamposVistaTemporal()
}

function ActualizarTotalCompra() {
    // Sumar directamente los valores de totalConDescuento
    let total = detallesVenta.reduce((sum, item) => {
        return sum + parseFloat(item.totalConDescuento || 0);
    }, 0);

    $("#totalCompra").val(total.toFixed(2));
}


function ActualizarTabla() {
    let tabla = $("#detalleVentaTabla");
    tabla.empty();

    detallesVenta.forEach((producto, index) => {
        tabla.append(`
            <tr>
                <td>${producto.codigoProducto}</td>
                <td>${producto.descripcion}</td>
                <td class="ocultar-en-768px"  >${producto.observacion}</td> 
                <td class="ocultar-en-768px">${producto.cantidad}</td>
                <td class="ocultar-en-768px" >${producto.forma_Pago}</td>
                  <td class="ocultar-en-768px">${producto.totalConDescuento}</td>
                  

    
                <td class="ocultar-en-768px">${producto.precioUnitario.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${index})">Eliminar</button></td>
            </tr>
        `);
    });
}

function confirmarEliminar(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            EliminarProducto(index);
        }
    });
}

function GuardarVenta() {
    if (detallesVenta.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: '¡Oops!',
            text: 'Debe agregar al menos un producto antes de guardar la venta.',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    let fecha_venta = new Date().toISOString();
    let total = detallesVenta.reduce((sum, prod) => sum + parseFloat(prod.totalConDescuento), 0);
    let usuarioID = $("#UserId").val().trim(); // Asegura que no esté vacío
    let formaPagoSeleccionada = $("#Forma_pago").val(); // 
        let clienteID = $("#ClienteID").val() || null;; // 

    if (!usuarioID) {
        alert("Error: Usuario no identificado.");
        return;
    }

    $.ajax({
        url: '../../Venta/GuardarVenta',
        type: 'POST',
        dataType: 'json',
        data: { fecha_venta: fecha_venta, total: total, usuarioID: usuarioID, Forma_pago: formaPagoSeleccionada, clienteID:clienteID},
        success: function (response) {
            if (response.success) {
                let ventaId = response.ventaId;
                GuardarDetallesVenta(ventaId);
            } else {
                alert(response.message);
            }
            $('#DetalleModal').modal('hide');
        },
        error: function () {
            alert("Error al guardar la venta");
        }
    });
    GenerarPDF()
}

function GuardarDetallesVenta(ventaId) {
    let usuarioID = $("#UserId").val().trim(); // Asegura que no esté vacío
    



    if (!usuarioID) {
        alert("Error: Usuario no identificado.");
        return;
    }
    detallesVenta.forEach(producto => {
        $.ajax({
            url: '../../Venta/GuardarDetalleVenta',
            type: 'POST',
            dataType: 'json',
            data: {
                ventaId: ventaId,
                codigoProducto: producto.codigoProducto,
                cantidad: producto.cantidad,
                precioUnitario: producto.totalConDescuento,

                usuarioID: usuarioID
            },
            success: function (response) {
                if (!response.success) {
                    alert(response.message);
                }
                ListadoDetalleVenta();

            },
            error: function () {
                alert("Error al guardar un detalle de venta");
            }

        });
    });

    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Venta y detalles guardados correctamente',
        confirmButtonText: 'Aceptar'
        
    });
    location.reload();

    detallesVenta = []; // Limpiar productos en memoria
    $("#detalleVentaTabla").empty();
    $("#DetalleModal").modal('hide'); // Cerrar modal
}
function GenerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200] // Ajustado al tamaño de un ticket térmico
    });

    let margenSuperior = 10; // Margen superior
    let margenInferior = 190; // Altura máxima antes de agregar una nueva página
    let espacioEntreCopias = 100; // Espacio entre copias
    let yInicial = margenSuperior; // Posición inicial

    function agregarTexto(texto, x, y) {
        if (y > margenInferior) {
            doc.addPage();
            y = margenSuperior;
        }
        doc.text(texto, x, y);
        return y + 5;
    }

    function agregarSeparador(y) {
        doc.setTextColor(0, 0, 0);
        y = agregarTexto(".", 40, y);
        y = agregarTexto(".", 40, y + 6.7);
        y = agregarTexto(".", 40, y + 6.7);
        y = agregarTexto(".", 40, y + 6.7);
        return y + 5; // Pequeño espacio extra después del separador
    }
    function agregarContenido(y) {
        doc.setTextColor(0, 102, 204);
        doc.setFontSize(12);
        y = agregarTexto("Bohemia Vintage", 10, y);

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        y = agregarTexto("Generado el: " + new Date().toLocaleDateString(), 10, y);
        y = agregarTexto("Dirección: Galería la nueva local 7", 10, y);
        y = agregarTexto("Teléfono: 03526 - 15557661", 10, y);

        let totalCompra = 0;
        y += 5;

        if (Array.isArray(detallesVenta) && detallesVenta.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(0, 102, 204);
            y = agregarTexto("Detalles de la Venta:", 10, y);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);

            detallesVenta.forEach((item, index) => {
                let codigo = item.codigoProducto || "N/A";
                let descripcion = item.descripcion || "Sin descripción";
                let observacion = item.observacion || "";
                let cantidad = item.cantidad || 0;
                let totalItem = parseFloat(item.totalConDescuento) || 0;
            
                totalCompra += totalItem;
            
                let totalConFormato = `$${totalItem.toFixed(2)}`;
            
                y = agregarTexto(`${index + 1}. Código: ${codigo}`, 10, y);
                y = agregarTexto(`   ${descripcion} - ${observacion}`, 10, y);
                y = agregarTexto(`   Cantidad: ${cantidad}`, 10, y);
                y = agregarTexto(`   Total: ${totalConFormato}`, 10, y + 5);
            });
            
            doc.setTextColor(0, 100, 0);
            y = agregarTexto(`Total: $${totalCompra.toFixed(2)}`, 10, y + 5);

            doc.setTextColor(255, 0, 0);
            y = agregarTexto("Se aceptan devoluciones dentro de las 48 horas", 10, y + 5);
        } else {
            y = agregarTexto("No hay detalles de venta disponibles.", 10, y);
        }

        // Agregar separador de cuatro puntos en línea vertical
        y = agregarSeparador(y);

        return y + 5;
    }

    let ySegundaCopia = agregarContenido(yInicial);

    // Verifica si la segunda copia cabe en la misma página
    if (ySegundaCopia + espacioEntreCopias > margenInferior) {
        doc.addPage();
        ySegundaCopia = margenSuperior;
    } else {
        ySegundaCopia += espacioEntreCopias;
    }

    agregarContenido(ySegundaCopia);

    // Mostrar PDF
    window.open(doc.output('bloburl'), '_blank');
}


function EliminarProducto(index) {
    detallesVenta.splice(index, 1);
    ActualizarTabla();
}

function limpiarCamposVistaTemporal() {
    $("#ProductoID").val("");
    $("#CodigoProducto").val("");
    $("#cantidad").val("");
    $("#descripcion").val("");
    $("#stockdisponible").val("");
    $("#Observacion").val("");
    $("#Observacion").val("");
    $("#precioUnitario").val("");
    $("#VentaID").val("");
    $("#totalConDescuento").val("");

}

function limpiarCampos() {
    $("#ProductoID").val("");
    $("#CodigoProducto").val("");
    $("#cantidad").val("");
    $("#descripcion").val("");
    $("#stockdisponible").val("");
    $("#Observacion").val("");
    $("#totalCompra").val("0.00");
    

    $("#precioUnitario").val("");
    $("#VentaID").val("");

}


function limpiarTabla() {
    detallesVenta = [];
    $("#detalleVentaTabla").empty();
}

function validarCantidad(input) {
    if (input.value === "0") {
        input.value = ""; // Borra el valor ingresado
        // Mostrar alerta con SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'La cantidad no puede ser 0.',
            confirmButtonText: 'Entendido'
        });
    }
}



//busqueda de cliente 

$(document).ready(function () {

    let timer = null;

    // BUSCAR CLIENTES
    $("#Nombre").on("input", function () {

        $("#ClienteID").val("");
        $("#Localidad, #Telefono, #Dni").val("");

        let texto = $(this).val().trim();

        if (texto.length < 2) {
            $("#sugerenciasClientes").hide().empty();
            return;
        }

        clearTimeout(timer);
        timer = setTimeout(() => {

            $.ajax({
                url: '/Venta/BuscarClientes',
                type: 'GET',
                data: { texto: texto },
                success: function (response) {

                    if (!response.success || !response.clientes.length) {
                        $("#sugerenciasClientes").hide();
                        return;
                    }

                    $("#sugerenciasClientes").empty().show();

                    response.clientes.forEach(function (cliente) {
                        $("#sugerenciasClientes").append(`
                            <li class="list-group-item list-group-item-action"
                                data-id="${cliente.clienteID}"
                                data-nombre="${cliente.nombre}">
                                <strong>${cliente.nombre}</strong><br>
                                DNI: ${cliente.dni ?? '-'} |
                                Tel: ${cliente.telefono ?? '-'} |
                                ${cliente.localidad ?? ''}
                            </li>
                        `);
                    });
                },
                error: function () {
                    alert("Error al buscar clientes");
                }
            });

        }, 300);
    });
    
//buscala las sugerenvias
    // SELECCIONAR CLIENTE
    $(document).on("click", "#sugerenciasClientes li", function () {

        let clienteID = $(this).data("id");
        let nombre = $(this).data("nombre");

        $("#Nombre").val(nombre);
        $("#ClienteID").val(clienteID);
        $("#sugerencias").hide();

        // TRAER DATOS COMPLETOS
        $.ajax({
            url: '/Venta/ObtenerClienteID',
            type: 'GET',
            data: { id: clienteID },
            success: function (response) {

                if (!response.success) return;

                $("#Localidad").val(response.cliente.localidad ?? '');
                $("#Telefono").val(response.cliente.telefono ?? '');
                $("#Dni").val(response.cliente.dni ?? '');
            },
            error: function () {
                alert("Error al obtener datos del cliente");
            }
        });
    });

    // OCULTAR SUGERENCIAS
    $("#Nombre").on("blur", function () {
        setTimeout(() => $("#sugerenciasClientes").hide(), 200);
    });

});
