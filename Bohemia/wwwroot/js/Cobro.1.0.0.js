window.onload = ListadoCobro;
function ListadoCobro() {
  $.ajax({
    url: "/Cobro/ListadoCobro",
    type: "POST",
    dataType: "json",
    success: function (ListadoCobro) {
      let contenidoTabla = "";

      $.each(ListadoCobro.cobros, function (index, cobro) {
        contenidoTabla += `
                <tr>
                    <td>${cobro.montoCobroTexto}</td>
                    <td class="ocultar-en-768px">${cobro.fechaCobroTexto}</td>
                    <td class="ocultar-en-768px" >${cobro.formaCobro}</td>
                    <td>${cobro.nombreCliente}</td>
                    <td>${cobro.telefonoCliente}</td>
                    <td class="ocultar-en-768px" >${cobro.emailCliente}</td>

                </tr>`;
      });

      $("#tbody-cobro").html(contenidoTabla);
    },
    error: function (xhr) {
      console.error("Error al cargar cobros", xhr);
    },
  });
}

                    // <td><button class="btn btn-primary btn-sm" onclick="GuardarCobro(${cobro.cobroID})">Editar</button></td>
                    // <td><button class="btn btn-danger btn-sm" onclick="eliminarCobro(${cobro.cobroID})">Eliminar</button></td>  

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
    timer = setTimeout(function () {
      $.ajax({
        url: "/Cobro/BuscarClientes",
        type: "GET",
        data: { texto: texto },
        success: function (response) {
          if (!response.success || response.clientes.length === 0) {
            $("#sugerenciasClientes").hide();
            return;
          }

          let lista = $("#sugerenciasClientes");
          lista.empty().show();

          response.clientes.forEach(function (cliente) {
            lista.append(`
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

  // SELECCIONAR CLIENTE
  $(document).on("click", "#sugerenciasClientes li", function () {
    let clienteID = $(this).data("id");
    let nombre = $(this).data("nombre");

    $("#Nombre").val(nombre);
    $("#ClienteID").val(clienteID);
    $("#sugerenciasClientes").hide();

    $.ajax({
      url: "/Cobro/ObtenerClienteID",
      type: "GET",
      data: { id: clienteID },
      success: function (response) {
        if (!response.success) return;

        $("#Localidad").val(response.cliente.localidad ?? "");
        $("#Telefono").val(response.cliente.telefono ?? "");
        $("#Dni").val(response.cliente.dni ?? "");

        // Abrir accordion automáticamente
        $("#datosCliente").collapse("show");
      },
      error: function () {
        alert("Error al obtener datos del cliente");
      },
    });
  });

  // OCULTAR SUGERENCIAS
  $("#Nombre").on("blur", function () {
    setTimeout(() => {
      $("#sugerenciasClientes").hide();
    }, 200);
  });
});


//validacion de fecha no superiror al actual
$(document).ready(function () {
  let hoy = new Date().toISOString().split("T")[0];
  $("#fecha").attr("max", hoy);
});

function GuardarCobro() {
  let montoTexto = $("#monto").val().trim();
  let fechaTexto = $("#fecha").val();

  // 🔴 VALIDAR MONTO
  if (montoTexto === "") {
    Swal.fire({
      icon: "warning",
      title: "Monto requerido",
      text: "Debe ingresar un monto",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // 🔧 Normalizar monto (último separador = decimal)
  let montoNormalizado = montoTexto;
  let lastDot = montoNormalizado.lastIndexOf(".");
  let lastComma = montoNormalizado.lastIndexOf(",");

  if (lastDot > lastComma) {
    montoNormalizado =
      montoNormalizado.substring(0, lastDot).replace(/[.,]/g, "") +
      "." +
      montoNormalizado.substring(lastDot + 1);
  } else if (lastComma > lastDot) {
    montoNormalizado =
      montoNormalizado.substring(0, lastComma).replace(/[.,]/g, "") +
      "." +
      montoNormalizado.substring(lastComma + 1);
  } else {
    montoNormalizado = montoNormalizado.replace(/[.,]/g, "");
  }

  let montoNumero = parseFloat(montoNormalizado);

  if (isNaN(montoNumero) || montoNumero <= 0) {
    Swal.fire({
      icon: "error",
      title: "Monto inválido",
      text: "El monto debe ser mayor a cero",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // 🔴 VALIDAR FECHA
  if (!fechaTexto) {
    Swal.fire({
      icon: "warning",
      title: "Fecha requerida",
      text: "Debe ingresar una fecha",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  let fechaIngresada = new Date(fechaTexto);
  let hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaIngresada > hoy) {
    Swal.fire({
      icon: "error",
      title: "Fecha inválida",
      text: "La fecha no puede ser posterior al día de hoy",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // 📤 OBJETO A ENVIAR
  let cobro = {
    CobroID: $("#CobroID").val(),
    ClienteID: $("#ClienteID").val(),
    montoCobro: montoTexto,
    fechaCobro: fechaTexto,
    formaCobro: $("#FormaCobro").val(),
  };

  // ⏳ LOADING
  Swal.fire({
    title: "Guardando cobro...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  $.ajax({
    url: "../../Cobro/GuardarCobro",
    type: "POST",
    data: cobro,
    dataType: "json",
    success: function (response) {
      Swal.fire({
        icon: "success",
        title: "Cobro guardado con éxito",
        text: response,
        confirmButtonText: "Aceptar",
      });

      ListadoCobro();
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar el cobro",
        confirmButtonText: "Aceptar",
      });
    },
  });
}