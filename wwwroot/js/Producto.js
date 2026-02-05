window.onload = ListadoProducto();

$(document).ready(function () {
    $("#txtBuscarCodigo").on("keyup", function () {
        var codigo = $(this).val();
        ListadoProducto(codigo);
    });
});

$(document).ready(function () {
    $("#txtBuscarDescripcion").on("keyup", function () {
        let observacion = $(this).val();
        ListadoProducto("", observacion); // Enviamos vacío en código y solo observación
    });
});



    function ListadoProducto(codigo,observacion) {
        $.ajax({
            url: '../../Productos/ListadoProducto',
            data: { codigo: codigo ,
                observacion: observacion
             },
            type: 'GET',
            dataType: 'json',
            success: function (listadoProducto) {
                let productos = listadoProducto.productos; // Ahora accedemos correctamente a la lista

                productos.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
            
                $("#totalProductos").text("Total de productos registrados: " + productos.length);
            
                var totalPrecioCosto = parseFloat(listadoProducto.totalPrecioCosto) || 0;
                $("#totalPrecioCosto").text("Total de Precios Costo: $" + totalPrecioCosto.toFixed(2));


                let totalCantidadProductos = listadoProducto.totalCantidadProductos || 0;
                $("#totalCantidadProductos").text("Cantidad total de productos: " + totalCantidadProductos)  .addClass("Textobohemia");
            
                limpiarCampos();
                let contenidoTabla = ``;
            
                $.each(productos, function (index, producto) { // Usamos 'productos' en lugar de 'listadoProducto'
                    let claseEliminado = producto.eliminado ? 'table-danger' : '';
                    let descripcion = producto.eliminado ? `<del>${producto.descripcionstring}</del>` : producto.descripcionstring;
                    let cantidad = producto.eliminado ? `<del>${producto.cantidad}</del>` : producto.cantidad;
                    let precio = producto.eliminado ? `<del>${producto.precioCostoFormato}</del>` : producto.precioCostoFormato;
                    let precioVenta = producto.eliminado ? `<del>${producto.precioVentaFormato}</del>` : producto.precioVentaFormato;
                    let observacion = producto.observacion ? producto.observacion : "NO DEFINIDO";
                    observacion = producto.eliminado ? `<del>${observacion}</del>` : observacion;
            
                    let botonEstado = `
                        <button type="button" class="btn ${producto.eliminado ? 'btn-outline-success' : 'btn-outline-danger'}" 
                            onclick="DesactivarProducto(${producto.productoID}, ${producto.eliminado ? 0 : 1})">
                            <i class="fa-solid fa-ban ${producto.eliminado ? 'fa-check-circle' : 'fa-trash-can'}"></i> 
                        </button>`;
            
                    let botonEliminar = `
                        <button type="button" class="btn btn-danger" onclick="EliminarProducto(${producto.productoID})">
                            <i class="fa-solid fa-trash"></i> 
                        </button>`;
            
                    contenidoTabla += `
                        <tr class="${claseEliminado}">
                            <td>${producto.codigo}</td>
                            <td class="ocultar-en-768px">${descripcion}</td>
                            <td class="ocultar-en-768px">${observacion}</td>
                            <td>${cantidad}</td>
                            <td> $ ${precio}</td>
                               <td> $ ${precioVenta}</td>
                            <td>
                                <button type="button" class="btn btn-outline-success me-2" onclick="AbrirModalEditar(${producto.productoID})">
                                    <i class="fa-solid fa-file-pen"></i>
                                </button>
                            </td>
                            <td class="ocultar-en-768px">${botonEstado}</td>
                            <td>${botonEliminar}</td>
                        </tr>`;
                });
            
                document.getElementById("tbody-producto").innerHTML = contenidoTabla;
            },
            error: function (xhr, status) {
                alert('Disculpe, existió un problema al cargar los productos.');
            }
        });
    }


// Función para eliminar un producto permanentemente

function EliminarProducto(productoID) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará el producto permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../Productos/EliminarProducto',
                type: 'POST',
                data: { productoID: productoID },
                dataType: 'json',
                success: function (respuesta) {
                    if (respuesta.success) {
                        Swal.fire({
                            title: "¡Eliminado!",
                            text: "El producto ha sido eliminado correctamente.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });

                        ListadoProducto(); // Recargar la lista después de eliminar
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: "No se pudo eliminar el producto.",
                            icon: "error"
                        });
                    }
                },
                error: function () {
                    Swal.fire({
                        title: "Error",
                        text: "Ocurrió un problema al eliminar el producto.",
                        icon: "error"
                    });
                }
            });
        }
    });
}


function DesactivarProducto(productoID, accion) {
    // Mostrar un mensaje de confirmación antes de realizar el cambio
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'El estado de este producto se actualizará.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, realiza la actualización
            $.ajax({
                url: '../../Productos/DesactivarProducto',
                type: 'POST',
                data: { productoID: productoID, accion: accion },
                dataType: 'json',
                success: function (respuesta) {
                    if (respuesta.success) {
                        ListadoProducto(); // Recargar la lista después de cambiar el estado
                        Swal.fire(
                            'Éxito!',
                            'El estado del producto ha sido actualizado.',
                            'success'
                        );
                    } else {
                        Swal.fire(
                            'Error!',
                            'No se pudo actualizar el estado del producto.',
                            'error'
                        );
                    }
                },
                error: function () {
                    Swal.fire(
                        'Error!',
                        'Ocurrió un problema al actualizar el estado del producto.',
                        'error'
                    );
                }
            });
        }
    });
}



document.getElementById("cantidad").addEventListener("input", function (event) {
    // Elimina cualquier carácter que no sea un número
    this.value = this.value.replace(/\D/g, '');
});


document.getElementById("precio").addEventListener("input", function (event) {
    // Permite números, puntos y comas
    this.value = this.value.replace(/[^0-9.,]/g, '');
});

document.getElementById("precioVenta").addEventListener("input", function (event) {
    // Permite números, puntos y comas
    this.value = this.value.replace(/[^0-9.,]/g, '');
});






function GuardarProducto() {
    let productoID = $("#ProductoID").val();
    let observacion = $("#observacion").val();
    let precioVenta = $("#precioVenta").val();
    let codigo, cantidad, descripcion, precio;observacion; precioVenta;

    // Si el modal está abierto, usar los valores del modal
    if ($("#modalEditarProducto").hasClass("show")) {
        codigo = $("#codigoModal").val().trim();
        cantidad = parseInt($("#cantidadModal").val());
        descripcion = $("#descripcionModal").val().trim();
        precio = parseFloat($("#precioModal").val());
        precioVenta = parseFloat($("#precioVentaModal").val());
        observacion = $("#observacionModal").val().trim(); 
    } else {
        // Si no, usar los valores del formulario principal
        codigo = $("#codigo").val().trim();
        cantidad = parseInt($("#cantidad").val());
        descripcion = $("#Descripcion").val().trim();
        precio = ($("#precio").val());
    }

    // Validaciones antes de enviar la solicitud
    if (!codigo) {
        Swal.fire({
            icon: "warning",
            title: "Código requerido",
            text: "Debe ingresar un código.",
            footer: '<a href="#">¿Por qué necesito un código?</a>'
        });
        return;
    }

  


    if (!descripcion) {
        Swal.fire({
            icon: "warning",
            title: "Descripción requerida",
            text: "Debe ingresar una descripción.",
            footer: '<a href="#">¿Por qué la descripción es obligatoria?</a>'
        });
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Precio inválido",
            text: "El precio debe ser un número mayor a 0.",
            footer: '<a href="#">¿Cómo definir un precio válido?</a>'
        });
        return;
    }

    $.ajax({
        url: '../../Productos/GuardarProducto',
        type: 'POST',
        dataType: 'json',
        data: { productoID: productoID, codigo: codigo, cantidad: cantidad, precio: precio, descripcion: descripcion, observacion: observacion, precioVenta : precioVenta },
        success: function (resultado) {
            Swal.fire({
                icon: resultado.includes("exitosamente") ? "success" : "error",
                title: resultado.includes("exitosamente") ? "¡Éxito!" : "Oops...",
                text: resultado,
                footer: resultado.includes("exitosamente") ? "" : '<a href="#">¿Por qué tengo este problema?</a>'
            }).then(() => {
                if (resultado.includes("exitosamente")) {
                    $("#modalEditarProducto").modal("hide"); // Cerrar el modal después de guardar
                    ListadoProducto(); // Actualizar la lista de productos
                    limpiarCampos();
                }
            });
        },
        error: function (xhr, status) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Algo salió mal al guardar el producto.",
                footer: '<a href="#">¿Por qué tengo este problema?</a>'
            });
        }
    });
}


function AbrirModalEditar(productoID) {


    $.ajax({
        url: '../../Productos/ListadoProducto',
        data: { productoID: productoID },
        type: 'POST',
        dataType: 'json',
        success: function (response) {
            console.log("Respuesta del servidor:", response);

            // Acceder a la lista de productos dentro del objeto devuelto
            let listadoProducto = response.productos;

        

            let Producto = listadoProducto[0];

            document.getElementById("ProductoID").value = Producto.productoID;
            document.getElementById("codigoModal").value = Producto.codigo;
            document.getElementById("descripcionModal").value = Producto.descripcion;
            document.getElementById("cantidadModal").value = Producto.cantidad;
            document.getElementById("precioModal").value = Producto.precioCosto;
            document.getElementById("precioVentaModal").value = Producto.precioVenta;
            document.getElementById("observacionModal").value = Producto.observacion;
           



            
            $('#modalEditarProducto').modal('show');
        },
        error: function (xhr, status) {
            alert('Disculpe, existió un problema');
        }
    });
}


// Alerta de Codigo  "cuidado con los espacios"
document.getElementById("codigo").addEventListener("focus", function () {
    document.getElementById("alertaCodigo").classList.remove("d-none");
  });

  document.getElementById("codigo").addEventListener("blur", function () {
    document.getElementById("alertaCodigo").classList.add("d-none");
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


  document.getElementById("codigo").addEventListener("input", function () {
    // Elimina espacios al inicio mientras escribe
    this.value = this.value.replace(/^\s+/g, "");
  });

// 
function limpiarCampos() {
    $("#ProductoID").val("0");
    $("#codigo").val("");
    $("#cantidad").val("");
    $("#Descripcion").prop('selectedIndex', 0); // Para limpiar el select
    $("#observacion").val(""); 
    $("#precio").val("");
    $("#precioVenta").val("");

    // Si existe el modal, limpiar sus campos también
    if ($("#modalEditarProducto").length) {
        $("#codigoModal").val("");
        $("#cantidadModal").val("");
        $("#descripcionModal").val("");
        $("#precioModal").val("");
        $("#precioVentaModal").val("");
        $("#observacionModal").val("");
    }
}

 
// buscador de productos, es otra estructura diferente a selec2 
let descripcionChoices;

$('#modalEditarProducto').on('shown.bs.modal', function () {

    if (descripcionChoices) {
        descripcionChoices.destroy();
    }

    descripcionChoices = new Choices('#descripcionModal', {
        searchEnabled: true,
        shouldSort: false,
        itemSelectText: '',
    });

});