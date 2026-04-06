window.onload = ListadoCompras;

function ListadoCompras() {
  $.ajax({
    url: "/Compra/ListadoCompras",
    type: "GET",
    dataType: "json",

    success: function (lista) {
      let contenidoTabla = ``;

      $.each(lista, function (index, compras) {
        let fecha = new Date(compras.fechaCompra).toLocaleDateString();

        contenidoTabla += `
          <!-- FILA PRINCIPAL -->
          <tr onclick="ToggleDetalle(${compras.compraID})" style="cursor:pointer;">
            <td id="icon-${compras.compraID}">➕</td>
            <td>${compras.nombreProveedor}</td>
       <td>$ ${FormatearMoneda(compras.montoCompra)}</td>
            <td>${compras.observacionCompra}</td>
            <td>${compras.facturaNumeroCompra}</td>
            <td>${fecha}</td>
            <td>${compras.tipoCompra}</td>
          </tr>

          <!-- DETALLE -->
          <tr id="detalle-${compras.compraID}" style="display:none; background:#f8f9fa;">
            <td colspan="7">
              ${GenerarDetalleProductos(compras.productos)}
            </td>
          </tr>
        `;
      });

      $("#detalleCompra").html(contenidoTabla);
    },

    error: function (xhr) {
      console.error("Error:", xhr.responseText);
    },
  });
}

//  <td>
//    <button
//      class="btn btn-success btn-sm"
//      onclick="AbrirModalEditar(${compras.compraID})"
//    >
//      ✏️
//    </button>
//    <button
//      class="btn btn-danger btn-sm"
//      onclick="EliminarCompra(${compras.compraID})"
//    >
//      🗑️
//    </button>
//  </td>;

function ToggleDetalle(compraID) {
  let fila = document.getElementById(`detalle-${compraID}`);
  let icon = document.getElementById(`icon-${compraID}`);

  if (fila.style.display === "none") {
    fila.style.display = "table-row";
    icon.textContent = "➖";
  } else {
    fila.style.display = "none";
    icon.textContent = "➕";
  }
}

function GenerarDetalleProductos(productos) {
  if (!productos || productos.length === 0) {
    return "<em>Sin productos</em>";
  }

  let html = `
    <table class="table table-sm table-bordered mt-2">
      <thead class="table-light">
        <tr>
          <th class="titulo_tabla_detalle">Código</th>
          <th class="titulo_tabla_detalle">Cantidad</th>
          <th class="titulo_tabla_detalle">Precio</th>
        </tr>
      </thead>
      <tbody>
  `;

  productos.forEach((p) => {
    html += `
      <tr>
        <td>${p.codigoProducto}</td>
        <td>${p.cantidadCompra}</td>
       <td>$ ${FormatearMoneda(p.precioUnitarioCompra)}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  return html;
}

// SELECCIONAR PROVEEDOR EN FORMULARIO PRINCIPAL
$(document).on("click", "#sugerenciasProveedores li", function () {
  let proveedorID = $(this).data("id");
  let nombre = $(this).data("nombre");

  $("#nombre").val(nombre);
  $("#ProveedorID").val(proveedorID);
  $("#sugerenciasProveedores").hide();

  // TRAER DATOS COMPLETOS
  $.ajax({
    url: "/Compra/ObtenerProveedorID",
    type: "GET",
    data: { id: proveedorID },

    success: function (response) {
      if (!response.success) return;

      $("#Localidad").val(response.proveedor.localidad ?? "");
      $("#Telefono").val(response.proveedor.telefono ?? "");
      $("#Dni").val(response.proveedor.cuit ?? "");
    },

    error: function () {
      alert("Error al obtener datos del proveedor");
    },
  });
});

// SELECCIONAR PROVEEDOR EN MODAL DE EDICIÓN
$(document).on("click", "#sugerenciasProveedoresModal li", function () {
  let proveedorID = $(this).data("id");
  let nombre = $(this).data("nombre");

  $("#nombreProveedorModal").val(nombre);
  $("#ProveedorIDModal").val(proveedorID);
  $("#sugerenciasProveedoresModal").hide();
});

// BUSCAR PROVEEDOR EN MODAL DE EDICIÓN
$("#nombreProveedorModal").keyup(function () {
  let texto = $(this).val();

  $.ajax({
    url: "/Compra/BuscarProveedores",
    type: "GET",
    data: { texto: texto },

    success: function (response) {
      let html = "";

      response.proveedores.forEach((p) => {
        html += `
          <li data-id="${p.proveedorID}" data-nombre="${p.nombre}">
            ${p.nombre}
          </li>
        `;
      });

      $("#sugerenciasProveedoresModal").html(html).show();
    },
  });
});

$("#nombre").keyup(function () {
  let texto = $(this).val();

  $.ajax({
    url: "/Compra/BuscarProveedores",
    type: "GET",
    data: { texto: texto },

    success: function (response) {
      let html = "";

      response.proveedores.forEach((p) => {
        html += `
          <li data-id="${p.proveedorID}" data-nombre="${p.nombre}">
            ${p.nombre}
          </li>
        `;
      });

      $("#sugerenciasProveedores").html(html).show();
    },
  });
});

function GuardarDetalleCompra() {
  let compraID, productoID, detalleCompraID, cantidadCompra, precioUnitario;

  // 👉 SI ESTÁ EL MODAL ABIERTO (EDICIÓN)
  if (
    $("#modalEditarCompra").hasClass("show") ||
    $("#modalEditarCompra").css("display") === "block"
  ) {
    compraID = $("#CompraIDModal").val();
    proveedorID = $("#ProveedorIDModal").val();
    facturaNumero = $("#numFacturaModal").val();
    monto = $("#montoModal").val();
    observacion = $("#observacionModal").val();
    fecha = $("#fechaCompraModal").val();
    tipoCompra = $("#TipoCompraModal").val();
  } else {
    compraID = 0;
    proveedorID = $("#ProveedorID").val();
    facturaNumero = $("#numFactura").val();
    monto = $("#monto").val();
    observacion = $("#observacion").val();
    fecha = $("#fechaCompra").val();
    tipoCompra = $("#TipoCompra").val();
  }
  // 🔴 VALIDACIONES

  if (!proveedorID || proveedorID == 0) {
    Swal.fire({
      icon: "warning",
      title: "Proveedor requerido",
      text: "Seleccioná un proveedor",
    });
    return;
  }

  // MONTO
  monto = parseFloat(monto.replace(",", "."));
  if (isNaN(monto) || monto <= 0) {
    Swal.fire({
      icon: "error",
      title: "Monto inválido",
      text: "El monto debe ser mayor a 0",
    });
    return;
  }

  // FACTURA
  if (!facturaNumero || isNaN(facturaNumero) || facturaNumero <= 0) {
    Swal.fire({
      icon: "error",
      title: "Factura inválida",
      text: "Ingresá un número de factura válido",
    });
    return;
  }

  // FECHA (acá estaba mal tu validación)
  if (!fecha) {
    Swal.fire({
      icon: "warning",
      title: "Fecha requerida",
      text: "Ingresá una fecha de compra",
    });
    return;
  }

  // TIPO COMPRA (también mal validado antes)
  if (!tipoCompra || tipoCompra == 0) {
    Swal.fire({
      icon: "warning",
      title: "Tipo de compra",
      text: "Seleccioná un tipo de compra",
    });
    return;
  }

  let datos = {
    CompraID: compraID,
    ProveedorID: proveedorID,
    facturaNumero: facturaNumero,
    montoCompra: monto,
    observacion: observacion,
    fechaCompra: fecha,
    tipoCompra: tipoCompra,
  };

  // 🔄 LOADING
  Swal.fire({
    title: "Guardando...",
    text: "Por favor esperá",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  $.ajax({
    url: "../../Compra/GuardarCompra",
    type: "POST",
    dataType: "json",
    data: datos,
    success: function (response) {
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: "La compra se guardó correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log(response);
      $("#modalEditarCompra").hide();
      $(".modal-backdrop").remove();
      ListadoCompras();
    },
    error: function (xhr) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar la compra",
      });

      console.error(xhr.responseText);
    },
  });
}

let detalles = [];

function AgregarProducto() {
  LimpiarTodosLosErrores();

  let productoID = $("#ProductoID").val();
  let nombre = $("#codigo").val();
  let cantidad = $("#cantidad").val();
  let precio = $("#precioUnitario").val();

  let valido = true;

  if (!productoID) {
    MarcarError("#codigo");
    valido = false;
  }

  if (!cantidad || cantidad <= 0) {
    MarcarError("#cantidad");
    valido = false;
  }

  if (!precio || precio <= 0) {
    MarcarError("#precioUnitario");
    valido = false;
  }

  if (!valido) {
    $(".input-error:first").focus();

    // 🔥 opcional swal lindo
    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Completá los campos del producto",
    });

    return;
  }

  // ✅ SI TODO OK
  detalles.push({
    productoID,
    nombre,
    cantidad,
    precioUnitario: precio,
  });

  DibujarTabla();

  // limpiar
  $("#ProductoID").val("");
  $("#codigo").val("");
  $("#cantidad").val("");
  $("#precioUnitario").val("");
}

// 🟢 DIBUJAR TABLA
function DibujarTabla() {
  let html = "";
  let total = 0;
  detalles.forEach((item, i) => {
    let subtotal = item.cantidad * item.precioUnitario;
    total += subtotal;
    html += `
    
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
      <td>$ ${FormatearMoneda(item.precioUnitario)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="EliminarItem(${i})">
                    ❌
                </button>
            </td>
        </tr>`;
  });
$("#totalCompra").text(`$ ${FormatearMoneda(total)}`);

  $("#tablaDetalle").html(html);
}

// 🟢 ELIMINAR
function EliminarItem(i) {
  detalles.splice(i, 1);
  DibujarTabla();
}

function GuardarTodo() {
  LimpiarTodosLosErrores();
  let valido = true;

  let datos = {
    proveedorID: $("#ProveedorID").val(),
    facturaNumero: $("#numFactura").val(),
    montoCompra: $("#monto").val(),
    observacion: $("#observacion").val(),
    fechaCompra: $("#fechaCompra").val(),
    tipoCompra: $("#TipoCompra").val(),
    detalles: detalles,
  };

  // 🔴 VALIDACIONES CABECERA

  if (!datos.proveedorID) {
    MarcarError("#nombre");
    valido = false;
  }

  if (!datos.facturaNumero) {
    MarcarError("#numFactura");
    valido = false;
  }

  let monto = parseFloat(datos.montoCompra?.replace(",", "."));
  if (isNaN(monto) || monto <= 0) {
    MarcarError("#monto");
    valido = false;
  }

  if (!datos.fechaCompra) {
    MarcarError("#fechaCompra");
    valido = false;
  }

  if (!datos.tipoCompra || datos.tipoCompra == 0) {
    MarcarError("#TipoCompra");
    valido = false;
  }

  // 🔴 VALIDAR DETALLES
  if (detalles.length === 0) {
    MarcarError("#codigo");
    valido = false;
  }

  detalles.forEach((item, index) => {
    if (!item.productoID) {
      MarcarError(`#fila-producto-${index}`);
      valido = false;
    }

    if (!item.cantidad || item.cantidad <= 0) {
      MarcarError(`#fila-cantidad-${index}`);
      valido = false;
    }

    if (!item.precioUnitario || item.precioUnitario <= 0) {
      MarcarError(`#fila-precio-${index}`);
      valido = false;
    }
  });

  // 🚫 SI HAY ERRORES
  if (!valido) {
    $(".input-error:first").focus();

    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Revisá los campos marcados en rojo",
    });

    return;
  }

  // 🔄 LOADING
  Swal.fire({
    title: "Guardando...",
    text: "Por favor esperá",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // ✅ AJAX
  $.ajax({
    url: "/Compra/GuardarCompraConDetalle",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(datos),

    success: function (response) {
      Swal.close();

      // 👉 si tu backend devuelve "OK"
      if (response === "OK") {
        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "Compra guardada correctamente",
          timer: 2000,
          showConfirmButton: false,
        });

        detalles = [];
        DibujarTabla();
        LimpiarFormulario();
        LimpiarTodosLosErrores();
      } else {
        // 🔥 error controlado del backend
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response,
        });
      }
    },

    error: function (e) {
      Swal.close();

      // 🔥 error técnico
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un problema al guardar",
      });

      console.error(e.responseText);
    },
  });
}

// 🟢 LIMPIAR
function LimpiarFormulario() {
  $("#ProveedorID").val("");
  $("#nombre").val("");
  $("#monto").val("");
  $("#observacion").val("");
  $("#numFactura").val("");
  $("#fechaCompra").val("");
}

function AbrirModalEditar(compraID) {
  $.ajax({
    url: "/Compra/ListadoCompras",
    type: "GET",
    data: { compraID },
    dataType: "json",
    success: function (response) {
      let compra = response[0]; // 🔥 CLAVE

      // ✔ IDs correctos del modal
      $("#CompraIDModal").val(compra.compraID);
      $("#ProveedorIDModal").val(compra.proveedorID);
      $("#nombreProveedorModal").val(compra.nombreProveedor);

      // ✔ Datos de compra
      $("#montoModal").val(compra.montoCompra);
      $("#observacionModal").val(compra.observacion);
      $("#numFacturaModal").val(compra.facturaNumero);
      // ✔ Fecha formateada
      $("#fechaCompraModal").val(compra.fechaCompra.split("T")[0]);
      // ✔ Dropdown correcto
      if (compra.tipoCompra != null) {
        $("#TipoCompraModal").val(compra.tipoCompra.toString());
      }
      const modal = new bootstrap.Modal(
        document.getElementById("modalEditarCompra"),
      );
      modal.show();
    },
    error: function () {
      alert("Error al cargar la compra");
    },
  });
}

function LimpiarFormularioAlta() {
  $("#nombre").val("");
  $("#monto").val("");
  $("#observacion").val("");
  $("#numFactura").val("");
  $("#fechaCompra").val("");
  $("#TipoCompra").val("");
}

$(document).ready(function () {
  // 🔍 BUSCAR PRODUCTOS
  $("#codigo").on("keyup", function () {
    let texto = $(this).val();

    if (texto.length < 2) {
      $("#sugerenciasProducto").hide();
      return;
    }

    $.ajax({
      url: "/Compra/BuscarProductos",
      type: "GET",
      data: { texto: texto },

      success: function (response) {
        let lista = $("#sugerenciasProducto");
        lista.empty();

        if (!response.success || response.productos.length === 0) {
          lista.hide();
          return;
        }

        response.productos.forEach(function (item) {
          lista.append(`
            <li class="list-group-item list-group-item-action"
                data-id="${item.productoID}"
                data-codigo="${item.codigo}"
                data-observacion="${item.observacion || ""}">
                
                <strong>${item.codigo}</strong> 
                <small class="text-muted">(${item.observacion || ""})</small>
            </li>
          `);
        });

        lista.show();
      },

      error: function () {
        alert("Error al buscar productos");
      },
    });
  });

  // 🖱️ SELECCIONAR PRODUCTO
  $(document).on("click", "#sugerenciasProducto li", function () {
    let ProductoID = $(this).data("id");
    let codigo = $(this).data("codigo");
    let observacion = $(this).data("observacion");

    $("#codigo").val(codigo);
    $("#ProductoID").val(ProductoID);

    // 👇 MOSTRAR AL LADO
    $("#obsProducto").text(observacion);

    $("#sugerenciasProducto").hide();
  });

  // ❌ OCULTAR LISTA
  $(document).click(function (e) {
    if (!$(e.target).closest("#codigo").length) {
      $("#sugerenciasProducto").hide();
    }
  });
});

function MarcarError(selector) {
  $(selector).addClass("input-error").removeClass("input-ok");
}

function LimpiarError(selector) {
  $(selector).removeClass("input-error").addClass("input-ok");
}

function LimpiarTodosLosErrores() {
  $("input, select, textarea").removeClass("input-error input-ok");
}

function ActualizarCantidad(index, valor) {
  detalles[index].cantidad = parseFloat(valor);
}

function ActualizarPrecio(index, valor) {
  detalles[index].precioUnitario = parseFloat(valor);
}

function FormatearMoneda(valor) {
  return parseFloat(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}