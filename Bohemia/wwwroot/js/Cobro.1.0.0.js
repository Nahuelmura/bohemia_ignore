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
                    <td>${cobro.montoCobro}</td>
                    <td>${cobro.fechaCobro}</td>
                    <td>${cobro.formaCobro}</td>
                    <td>${cobro.nombreCliente}</td>
                    <td>${cobro.telefonoCliente}</td>
                    <td>${cobro.emailCliente}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="GuardarCobro(${cobro.cobroID})">Editar</button></td>
                    <td><button class="btn btn-danger btn-sm" onclick="eliminarCobro(${cobro.cobroID})">Eliminar</button></td>  
                </tr>`;
      });

      $("#tbody-cobro").html(contenidoTabla);
    },
    error: function (xhr) {
      console.error("Error al cargar cobros", xhr);
    },
  });
}





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


function GuardarCobro() {
  let cobro = {
    CobroID: $("#CobroID").val(),
    ClienteID: $("#ClienteID").val(),
    montoCobro: $("#monto").val(), // 👈 mismo nombre que el controller
    fechaCobro: $("#fecha").val(),
    formaCobro: $("#FormaCobro").val(),
  };

  $.ajax({
    url: "../../Cobro/GuardarCobro",
    type: "POST",
    data: cobro,
    dataType: "json",
    success: function (response) {
      console.log(response);
      ListadoCobro();
    },
    error: function () {
      alert("Error al guardar el cobro");
    },
  });
}
