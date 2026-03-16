window.onload = ListadoDetalleVenta();

$(document).ready(function () {
  $("#buscarventa, #fechabuscarventa, #descripcionbuscarventa").on(
    "keyup change",
    function () {
      ListadoDetalleVenta();
    },
  );
});

function ListadoDetalleVenta() {
  var codigobuscarVenta = $("#buscarventa").val();
  var fechabuscarventa = $("#fechabuscarventa").val();
  let descripcionbuscarventa = $("#descripcionbuscarventa").val();

  $.ajax({
    url: "../../Venta/ListadoDetalleVenta",
    data: {
      codigo: codigobuscarVenta,
      fecha: fechabuscarventa,
      Descripcionbuscarventa: descripcionbuscarventa || "0",
    },
    type: "POST",
    dataType: "json",

    success: function (listadoVentas) {
      let contenidoTabla = ``;

      $.each(listadoVentas, function (index, ventas) {
        let claseCantidad =
          ventas.cantidad < 0 ? 'style="color: red; font-weight: bold;"' : "";
        let claseTotal =
          ventas.total < 0 ? 'style="color: red; font-weight: bold;"' : "";

        let observacion =
          ventas.observacion === null ||
          ventas.observacion === undefined ||
          ventas.observacion.trim() === ""
            ? "No definido"
            : ventas.observacion;

        // CAMBIO 1: Formatear precioUnitario y total con formato argentino (xx.xxx,xx)
        contenidoTabla += `
                    <tr>
                        <td>${ventas.codigoProducto}</td>
                        <td  class="ocultar-en-768px">${ventas.descripcionProducto}</td>
                        <td>${observacion}</td>
                        <td class="ocultar-en-768px">${ventas.fecha_Venta_string}</td>
                        <td>${formatearPrecioAR(ventas.precioUnitario)}</td>
                         <td  class="ocultar-en-768px"> ${claseCantidad}${ventas.cantidad}</td>
                        <td ${claseTotal} class="ocultar-en-768px">${formatearPrecioAR(ventas.total)}</td>
                          <td class="ocultar-en-768px">${ventas.forma_pagostring}</td>
                     
                    </tr>
                `;
      });

      document.getElementById("tbody-Carga_Venta").innerHTML = contenidoTabla;
    },
    error: function (xhr, status) {
      console.error("Error al cargar los datos de venta.");
    },
  });
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
$("#DetalleModal").on("hidden.bs.modal", function () {
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
      return 0.1;
    case 2: // financiacion
      return 0.0;
    case 4:
      return 0.2; // Descuento_20
    case 5:
      return 0.3;
    case 6:
      return 0.4;
    case 7:
      return 0.5;
    default:
      return 0.0;
  }
}

function actualizarTotalConDescuento() {
  let cantidad = parseInt($("#cantidad").val(), 10) || 0;
  // Parsear el precio quitando puntos de miles y cambiando coma por punto
  let precioRaw = $("#precioUnitario").val().replace(/\./g, "").replace(",", ".");
  let precio = parseFloat(precioRaw) || 0;
  let formaVal = $("#Forma_pago").val();

  let porcentaje = obtenerPorcentajeDescuentoPorValor(formaVal);
  let totalFinal = cantidad * precio * (1 - porcentaje);

  // Formatear con formato argentino (xx.xxx,xx)
  $("#totalConDescuento").val(totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
    var myToastModal = document.getElementById("myToastModal");
    if (myToastModal) {
      new bootstrap.Toast(myToastModal).show();
    }
  }, delayModal);

  setTimeout(function () {
    var myToastOutside = document.getElementById("myToastOutside");
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
        url: "../../Venta/ObtenerProductoInfo",
        type: "GET",
        dataType: "json",
        data: { codigoProducto: codigo },
        success: function (response) {
          if (response.success) {
            // Formatear el precio con formato argentino (xx.xxx,xx)
            let precioFormateado = response.precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            $("#precioUnitario").val(precioFormateado);
            $("#stockdisponible").val(response.stock); // Asignar stock disponible
            $("#descripcion").val(response.descripcionProducto);
            $("#Observacion").val(response.observacion);
          } else {
            $("#precioUnitario").val(""); // Limpiar si no existe
            $("#stockdisponible").val(""); // Limpiar si no existe
            $("#descripcion").val("");
            $("#Observacion").val("");
            alert(response.message);
          }
        },
        error: function () {
          alert("Error al obtener la información del producto");
        },
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
  // Parsear el precio quitando puntos de miles y cambiando coma por punto
  let precioRaw = $("#precioUnitario").val().replace(/\./g, "").replace(",", ".");
  let precioUnitario = parseFloat(precioRaw);
  let descripcion = $("#descripcion").val();
  let observacion = $("#Observacion").val() || "No definido"; // Si es null o vacío, asigna "No definido"
  let stockDisponible = parseInt($("#stockdisponible").val());
  let forma_Pago = $("#Forma_pago option:selected").text();
  // Parsear el total quitando puntos de miles y cambiando coma por punto
  let totalRaw = $("#totalConDescuento").val().replace(/\./g, "").replace(",", ".");
let totalConDescuento = parseFloat(
  cantidad *
    precioUnitario *
    (1 - obtenerPorcentajeDescuentoPorValor($("#Forma_pago").val())),
);

  if (!codigoProducto || isNaN(cantidad) || isNaN(precioUnitario)) {
    alert("Ingrese datos válidos");
    return;
  }

  if (cantidad > stockDisponible) {
    Swal.fire({
      icon: "warning",
      title: "Stock insuficiente",
      text: `Tienes ${stockDisponible} unidades disponibles.`,
    });
    return;
  }

  // Agregar producto a la memoria
  detallesVenta.push({
    codigoProducto: codigoProducto,
    cantidad: cantidad,
    observacion: observacion,
    precioUnitario: Math.round(precioUnitario * 100) / 100,
    descripcion: descripcion,
    forma_Pago: forma_Pago,
    totalConDescuento: Math.round(parseFloat(totalRaw) * 100) / 100,
  });
  console.log(forma_Pago);
  // Actualizar la tabla después de agregar el producto
  ActualizarTabla();

  ActualizarTotalCompra();

  limpiarCamposVistaTemporal();
}

function ActualizarTotalCompra() {
  // Sumar directamente los valores de totalConDescuento
  let total = detallesVenta.reduce((sum, item) => {
    return sum + parseFloat(item.totalConDescuento || 0);
  }, 0);

  // Formatear con formato argentino (xx.xxx,xx)
  $("#totalCompra").val(total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

// CAMBIO 2: Formatear totalConDescuento y precioUnitario con formato argentino (xx.xxx,xx)
function ActualizarTabla() {
  let tabla = $("#detalleVentaTabla");
  tabla.empty();

  detallesVenta.forEach((producto, index) => {
    // Convertir a número para formatear correctamente
    let totalDescuento = parseFloat(producto.totalConDescuento) || 0;
    let precioUnit = parseFloat(producto.precioUnitario) || 0;
    
    tabla.append(`
            <tr>
                <td>${producto.codigoProducto}</td>
                <td>${producto.descripcion}</td>
                <td class="ocultar-en-768px"  >${producto.observacion}</td>
                <td class="ocultar-en-768px">${producto.cantidad}</td>
                <td class="ocultar-en-768px" >${producto.forma_Pago}</td>
                  <td class="ocultar-en-768px">${formatearPrecioAR(totalDescuento)}</td>
                  

    
                <td class="ocultar-en-768px">${formatearPrecioAR(precioUnit)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${index})">Eliminar</button></td>
            </tr>
        `);
  });
}

function confirmarEliminar(index) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      EliminarProducto(index);
    }
  });
}
function GuardarVenta() {
  if (detallesVenta.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "¡Oops!",
      text: "Debe agregar al menos un producto antes de guardar la venta.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  let fecha_venta = new Date().toISOString();
  let total =
    Math.round(
      detallesVenta.reduce(
        (sum, prod) => sum + parseFloat(prod.totalConDescuento),
        0,
      ) * 100,
    ) / 100;
  let usuarioID = $("#UserId").val().trim();
  let formaPagoSeleccionada = parseInt($("#Forma_pago").val()); // 👈 parseInt para que llegue como número
  let clienteID = parseInt($("#ClienteID").val()) || 0;

  if (!usuarioID) {
    alert("Error: Usuario no identificado.");
    return;
  }

  $.ajax({
    url: "../../Venta/GuardarVenta",
    type: "POST",
    contentType: "application/json", // 👈
    dataType: "json",
    data: JSON.stringify({
      // 👈
      fecha_venta: fecha_venta,
      total: total, // llega como 628.20 ✓
      usuarioID: usuarioID,
      forma_pago: formaPagoSeleccionada,
      clienteID: clienteID,
    }),
    success: function (response) {
      if (response.success) {
        let ventaId = response.ventaId;
        GuardarDetallesVenta(ventaId);
      } else {
        alert(response.message);
      }
    },
    error: function () {
      alert("Error al guardar la venta");
    },
  });
  GenerarPDF();
}
function GuardarDetallesVenta(ventaId) {
  let usuarioID = $("#UserId").val().trim();

  if (!usuarioID) {
    alert("Error: Usuario no identificado.");
    return;
  }

  let promesas = detallesVenta.map((producto) => {
    return $.ajax({
      url: "../../Venta/GuardarDetalleVenta",
      type: "POST",
      contentType: "application/json", // 👈
      dataType: "json",
      data: JSON.stringify({
        // 👈
        ventaId: ventaId,
        codigoProducto: producto.codigoProducto,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario, // llega como 628.20 ✓
        usuarioID: usuarioID,
      }),
      error: function () {
        alert("Error al guardar un detalle de venta");
      },
    });
  });

  // Esperar que TODOS los detalles se guarden antes de mostrar éxito
  Promise.all(promesas).then(() => {
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Venta y detalles guardados correctamente",
      confirmButtonText: "Aceptar",
    }).then(() => {
      location.reload();
    });

    detallesVenta = [];
    $("#detalleVentaTabla").empty();
    $("#DetalleModal").modal("hide");
  });
}
function GenerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // Ajustado al tamaño de un ticket térmico
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

      // CAMBIO 3: Formatear precios en PDF con formato argentino (xx.xxx,xx)
      detallesVenta.forEach((item, index) => {
        let codigo = item.codigoProducto || "N/A";
        let descripcion = item.descripcion || "Sin descripción";
        let observacion = item.observacion || "";
        let cantidad = item.cantidad || 0;
        let totalItem = parseFloat(item.totalConDescuento) || 0;

        totalCompra += totalItem;

        // Formato argentino: punto para miles, coma para decimales
        let totalConFormato = `$ ${totalItem.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        y = agregarTexto(`${index + 1}. Código: ${codigo}`, 10, y);
        y = agregarTexto(`   ${descripcion} - ${observacion}`, 10, y);
        y = agregarTexto(`   Cantidad: ${cantidad}`, 10, y);
        y = agregarTexto(`   Total: ${totalConFormato}`, 10, y + 5);
      });

      doc.setTextColor(0, 100, 0);
      // Formato argentino para el total general
      y = agregarTexto(`Total: $ ${totalCompra.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10, y + 5);

      doc.setTextColor(255, 0, 0);
      y = agregarTexto(
        "Se aceptan devoluciones dentro de las 48 horas",
        10,
        y + 5,
      );
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
  window.open(doc.output("bloburl"), "_blank");
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
      icon: "error",
      title: "Oops...",
      text: "La cantidad no puede ser 0.",
      confirmButtonText: "Entendido",
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
        url: "/Venta/BuscarClientes",
        type: "GET",
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
                                DNI: ${cliente.dni ?? "-"} |
                                Tel: ${cliente.telefono ?? "-"} |
                                ${cliente.localidad ?? ""}
                            </li>
                        `);
          });
        },
        error: function () {
          alert("Error al buscar clientes");
        },
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
      url: "/Venta/ObtenerClienteID",
      type: "GET",
      data: { id: clienteID },
      success: function (response) {
        if (!response.success) return;

        $("#Localidad").val(response.cliente.localidad ?? "");
        $("#Telefono").val(response.cliente.telefono ?? "");
        $("#Dni").val(response.cliente.dni ?? "");
      },
      error: function () {
        alert("Error al obtener datos del cliente");
      },
    });
  });

  // OCULTAR SUGERENCIAS
  $("#Nombre").on("blur", function () {
    setTimeout(() => $("#sugerenciasClientes").hide(), 200);
  });
});

function confirmarRevertir(ventaId) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción anulará la venta y devolverá el stock.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, revertir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      revertirVenta(ventaId);
    }
  });
}

function revertirVenta(ventaId) {
  $.ajax({
    url: "../../Venta/RevertirVenta",
    type: "POST",
    data: { ventaId: ventaId },
    success: function (resp) {
      if (resp.ok) {
        Swal.fire("¡Éxito!", resp.mensaje, "success");
        ListadoDetalleVenta();
      } else {
        Swal.fire("Error", resp.mensaje, "error");
      }
    },
    error: function () {
      Swal.fire("Error", "Error interno del servidor", "error");
    },
  });
}

// $(document).on("click", ".btn-revertir-venta", function () {
//   const ventaId = $(this).data("id");

//   if (!confirm("¿Seguro que querés revertir esta venta?")) return;

//   $.ajax({
//     url: "../../Venta/RevertirVenta",
//     type: "POST",
//     data: { ventaId: ventaId },
//     success: function (resp) {
//       if (resp.ok) {
//         alert("Venta revertida correctamente");
//         ListadoDetalleVenta(); // refresca la tabla
//       } else {
//         alert(resp.mensaje || "No se pudo revertir la venta");
//       }
//     },
//     error: function () {
//       alert("Error al revertir la venta");
//     },
//   });
// });
