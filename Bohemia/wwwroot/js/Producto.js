window.onload = ListadoProducto();

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar todos los inputs por clase
    document.querySelectorAll(".cantidad-input").forEach(i => formatearCantidad(i));
    document.querySelectorAll(".precio-input").forEach(i => formatearPrecio(i));
    
    // Inicialización específica si es necesario (ya cubierta por las clases arriba)
});

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
                        <button type="button" class="btn ${producto.eliminado ? 'btn-outline-danger'  : 'btn-outline-success'}" 
                            onclick="DesactivarProducto(${producto.productoID}, ${producto.eliminado ? 0 : 1})">
                            <i class="fa-solid fa-ban ${producto.eliminado ? 'fa-trash-can' : 'fa-check-circle'}"></i> 
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
                        </tr>`;
                });
            
                document.getElementById("tbody-producto").innerHTML = contenidoTabla;
            },
            error: function (xhr, status) {
                alert('Disculpe, existió un problema al cargar los productos.');
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



// Eliminado bloque redundante de inicialización







function GuardarProducto() {
    let productoID = $("#ProductoID").val();
    let observacion = $("#observacion").val();
    let precioVenta = $("#precioVenta").val();
    let codigo, cantidad, descripcion, precio;observacion; precioVenta;

    // Si el modal está abierto, usar los valores del modal
    if ($("#modalEditarProducto").hasClass("show")) {
        codigo = $("#codigoModal").val().trim();
        cantidad = limpiarNumeroSQL($("#cantidadModal").val(), true); // true = retorna número
        descripcion = $("#descripcion").val().trim();
        precio = limpiarNumeroSQL($("#precioModal").val(), true);
        precioVenta = limpiarNumeroSQL($("#precioVentaModal").val(), true);
        observacion = $("#observacionModal").val().trim();
    } else {
        // Si no, usar los valores del formulario principal
        codigo = $("#codigo").val().trim();
        cantidad = limpiarNumeroSQL($("#cantidad").val(), true);
        descripcion = $("#Descripcion").val().trim();
        precio = limpiarNumeroSQL($("#precio").val(), true);
        precioVenta = limpiarNumeroSQL($("#precioVenta").val(), true);
        observacion = $("#observacion").val().trim();
    }

    // Validaciones antes de enviar la solicitud (usando números reales)
    if (!codigo) {
        Swal.fire({
            icon: "warning",
            title: "Código requerido",
            text: "Debe ingresar un código."
        });
        return;
    }

    if (!descripcion || descripcion === "0") {
        Swal.fire({
            icon: "warning",
            title: "Descripción requerida",
            text: "Debe ingresar una descripción."
        });
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Precio costo inválido",
            text: "El precio de costo debe ser mayor a 0."
        });
        return;
    }

    if (isNaN(precioVenta) || precioVenta <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Precio venta inválido",
            text: "El precio de venta debe ser mayor a 0."
        });
        return;
    }

    if (precio > precioVenta) {
        Swal.fire({
            icon: "warning",
            title: "Precio inválido",
            text: "El precio de costo no puede ser mayor al de venta."
        });
        return;
    }

    // Preparar datos para el servidor (como strings en formato AR para el binding)
    let datosParaEnviar = {
        productoID: productoID,
        codigo: codigo,
        cantidad: Math.floor(cantidad),
        precio: precio.toString().replace(".", ","),
        descripcion: descripcion,
        observacion: observacion,
        precioVenta: precioVenta.toString().replace(".", ",")
    };

    $.ajax({
        url: '../../Productos/GuardarProducto',
        type: 'POST',
        dataType: 'json',
        data: datosParaEnviar,
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
            document.getElementById("descripcion").value = Producto.descripcion;
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

function cerrarModal() {
    $('#modalEditarProducto').modal('hide');
}  


/* ================================
   CANTIDAD (solo enteros)
================================ */
function formatearCantidad(input) {
    if (!input) return;

    input.addEventListener("input", e => {
        let cursorPosition = e.target.selectionStart;
        let oldLength = e.target.value.length;

        // Solo números
        let valor = e.target.value.replace(/\D/g, "");

        if (!valor) {
            e.target.value = "";
            return;
        }

        // Formatear con separador de miles
        let formateado = Number(valor).toLocaleString("es-AR");
        e.target.value = formateado;

        // Ajustar cursor
        let newLength = e.target.value.length;
        cursorPosition = cursorPosition + (newLength - oldLength);
        e.target.setSelectionRange(cursorPosition, cursorPosition);
    });

    // Asegurar que al perder el foco esté limpio si está vacío
    input.addEventListener("blur", e => {
        if (e.target.value === "0") e.target.value = "";
    });
}


// formatearMoneda eliminado por redundancia con formatearPrecio



/* ================================
   PRECIO (moneda)
================================ */
// function formatearPrecio(input) {
//     if (!input) return;

//     input.addEventListener("input", e => {
//         let cursorPosition = e.target.selectionStart;
//         let oldLength = e.target.value.length;

//         // Solo números (centavos)
//         let numeros = e.target.value.replace(/\D/g, "");

//         if (!numeros || numeros === "0") {
//             e.target.value = "$ 0,00";
//             e.target.setSelectionRange(5, 5);
//             return;
//         }

//         // Siempre 2 decimales, rellenar con ceros a la izquierda si es necesario
//         numeros = numeros.replace(/^0+/, ""); // quitar ceros a la izquierda
//         if (numeros.length < 3) numeros = numeros.padStart(3, "0");

//         let entero = numeros.slice(0, -2);
//         let decimal = numeros.slice(-2);

//         // Formatear la parte entera con separadores de miles
//         entero = Number(entero).toLocaleString("es-AR");

//         let resultado = `$ ${entero},${decimal}`;
//         e.target.value = resultado;

//         // Ajustar cursor para que no salte al final si se edita en el medio
//         let newLength = e.target.value.length;
//         cursorPosition = cursorPosition + (newLength - oldLength);
//         e.target.setSelectionRange(cursorPosition, cursorPosition);
//     });

//     input.addEventListener("focus", e => {
//         if (!e.target.value || e.target.value === "$ 0,00") {
//             e.target.value = "$ 0,00";
//             // Posicionar el cursor después del "$ 0,"
//             setTimeout(() => e.target.setSelectionRange(5, 5), 0);
//         }
//     });

//     input.addEventListener("click", e => {
//         // Si el valor es el inicial, poner el cursor al final
//         if (e.target.value === "$ 0,00") {
//             e.target.setSelectionRange(5, 5);
//         }
//     });
// }





function formatearPrecio(input) {
  if (!input) return;

  let tieneComa = false;

  input.addEventListener("keydown", (e) => {
    const key = e.key;

    // Navegación y borrado
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)
    ) {
      return;
    }

    // Coma → activar centavos
    if (key === "," || key === ".") {
      if (tieneComa) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      tieneComa = true;
      input.value += ",";
      return;
    }

    // Solo números
    if (!/^[0-9]$/.test(key)) {
      e.preventDefault();
      return;
    }

    // Limitar centavos a 2
    if (tieneComa) {
      const dec = input.value.split(",")[1] || "";
      if (dec.length >= 2) {
        e.preventDefault();
      }
    }
  });

  input.addEventListener("input", () => {
    tieneComa = input.value.includes(",");
  });

  input.addEventListener("blur", () => {
    let valor = input.value.replace("$", "").trim();
    if (!valor) {
      input.value = "$ 0,00";
      return;
    }

    let [entero, decimal = ""] = valor.split(",");

    entero = entero.replace(/\D/g, "");
    decimal = decimal.replace(/\D/g, "").padEnd(2, "0").slice(0, 2);

    let numero = parseFloat(entero + "." + decimal);

    input.value = numero.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  input.addEventListener("focus", () => {
    if (input.value === "$ 0,00") {
      input.value = "";
      tieneComa = false;
    }
  });
}

function limpiarNumeroSQL(valor, retornarNumero = true) {
    if (!valor) return 0;

    // Eliminar $, espacios y puntos (separador de miles en AR)
    const limpio = valor
        .replace(/\$/g, "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", "."); // Convertir coma decimal en punto para JS

    if (retornarNumero) {
        return parseFloat(limpio) || 0;
    }
    return limpio; // Retorna string con punto
}







// Función para eliminar un producto permanentemente

// function EliminarProducto(productoID) {
//     Swal.fire({
//         title: "¿Estás seguro?",
//         text: "Esta acción eliminará el producto permanentemente.",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#d33",
//         cancelButtonColor: "#3085d6",
//         confirmButtonText: "Sí, eliminar",
//         cancelButtonText: "Cancelar"
//     }).then((result) => {
//         if (result.isConfirmed) {
//             $.ajax({
//                 url: '../../Productos/EliminarProducto',
//                 type: 'POST',
//                 data: { productoID: productoID },
//                 dataType: 'json',
//                 success: function (respuesta) {
//                     if (respuesta.success) {
//                         Swal.fire({
//                             title: "¡Eliminado!",
//                             text: "El producto ha sido eliminado correctamente.",
//                             icon: "success",
//                             timer: 2000,
//                             showConfirmButton: false
//                         });

//                         ListadoProducto(); // Recargar la lista después de eliminar
//                     } else {
//                         Swal.fire({
//                             title: "Error",
//                             text: "No se pudo eliminar el producto.",
//                             icon: "error"
//                         });
//                     }
//                 },
//                 error: function () {
//                     Swal.fire({
//                         title: "Error",
//                         text: "Ocurrió un problema al eliminar el producto.",
//                         icon: "error"
//                     });
//                 }
//             });
//         }
//     });
// }