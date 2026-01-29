
window.onload = function () {
  ListadoClientes("");
};

$("#txtBuscarCliente").on("keyup", function () {
  let nombre = $(this).val();
  ListadoClientes(nombre);
});

function ListadoClientes(nombre) {
  $.ajax({
    url: "../../Cliente/ListadoClientes",
    data: { nombre: nombre },
    type: "POST",
    dataType: "json",
    success: function (listadoClientes) {
      let clientes = listadoClientes.clientes;
      let contenidoTabla = "";

      $.each(clientes, function (index, cliente) {
        let claseEliminado = cliente.eliminado ? "table-danger" : "";

        let nombre = cliente.eliminado
          ? `<del>${mostrarValor(cliente.nombre)}</del>`
          : mostrarValor(cliente.nombre);

        let localidad = cliente.eliminado
          ? `<del>${mostrarValor(cliente.localidad)}</del>`
          : mostrarValor(cliente.localidad);

        let telefono = cliente.eliminado
          ? `<del>${mostrarValor(cliente.telefono)}</del>`
          : mostrarValor(cliente.telefono);

        let email = mostrarValor(cliente.email);
        let dni = mostrarValor(cliente.dni_cuil);

        let botonEstado = `
          <button class="btn btn-sm ${
            cliente.eliminado ? "btn-outline-danger" : "btn-outline-success"
          }"
          onclick="DesactivarCliente(${cliente.clienteID}, ${
            cliente.eliminado ? 0 : 1
          })">
            <i class="fa-solid ${
              cliente.eliminado ? "fa-trash-can" : "fa-check-circle"
            }"></i>
          </button>`;

        contenidoTabla += `
          <tr class="${claseEliminado}">
            <td>${nombre}</td>
            <td class="ocultar-en-768px">${localidad}</td>
            <td>${telefono}</td>

            <td class="mostrar-en-768px">
              <button class="btn btn-sm btn-outline-primary"
                onclick="toggleDetalle(${cliente.clienteID})">
                Ver más
              </button>
            </td>

            <td class="ocultar-en-768px">${email}</td>
            <td class="ocultar-en-768px">${dni}</td>

            <td>
              <button class="btn btn-outline-success btn-sm"
                onclick="AbrirModalEditar(${cliente.clienteID})">
                <i class="fa-solid fa-file-pen"></i>
              </button>
            </td>

            <td class="ocultar-en-768px">${botonEstado}</td>
          </tr>

          <tr id="detalle-${cliente.clienteID}" class="detalle-responsive d-none">
            <td colspan="8">
              <div class="detalle-box">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>DNI/CUIT:</strong> ${dni}</p>
              </div>
            </td>
          </tr>
        `;
      });

      $("#detalleCliente").html(contenidoTabla);
    },
    error: function () {
      alert("Error al cargar los clientes");
    },
  });
}

function toggleDetalle(id) {
  $("#detalle-" + id).toggleClass("d-none");
}







function mostrarValor(valor) {
  return valor === null || valor === undefined || valor === "" || valor == 0
    ? "Sin asignar"
    : valor;
}


//  boton eliminar  </td>
//                         <td class="ocultar-en-768px">${botonEliminar}</td>

function GuardarCliente() {
  let clienteID = $("#ClienteIDModal").val(); 
  let nombre, localidad, telefono, email, dni_cuil;

  if ($("#modalEditarCliente").hasClass("show")) {
    nombre = $("#nombreModal").val().trim();
    localidad = $("#localidadModal").val().trim();
    telefono = $("#telefonoModal").val();
    email = $("#emailModal").val().trim();
    dni_cuil = $("#dnicuitModal").val().trim();
  } else {
    clienteID = 0;
    nombre = $("#nombre").val().trim();
    localidad = $("#localidad").val().trim();
    telefono = $("#telefono").val();
    email = $("#email").val().trim();
    dni_cuil = $("#dni").val().trim();
  }

  // Validaciones antes de enviar la solicitud
  if (!nombre) {
    Swal.fire({
      icon: "warning",
      title: "Nombre requerido",
      text: "Debe ingresar un Nombre.",
    });
    return;
  }

  if (!dni_cuil) {
    Swal.fire({
      icon: "warning",
      title: "dni_cuil requerido",
      text: "Debe ingresar un dni_cuil.",
    });
    return;
  }

  if (!telefono) {
    Swal.fire({
      icon: "warning",
      title: "telefono requerido",
      text: "Debe ingresar un dni_cuil.",
    });
    return;
  }

  $.ajax({
    url: "../../Cliente/GuardarCliente",
    type: "POST",
    dataType: "json",
    data: {
      ClienteID: clienteID,
      nombre: nombre,
      localidad: localidad,
      telefono: telefono,
      email: email,
      dni_cuil: dni_cuil,
    },
    success: function (resultado) {
      if (
        resultado === "Cliente guardado" ||
        resultado === "cliente editado exitosamente"
      ) {
        Swal.fire("Éxito", resultado, "success");
        $("#modalEditarCliente").modal("hide");
        ListadoClientes();
        LimpiarFormularioAlta();
      } else {
        Swal.fire("Atención", resultado, "warning");
      }
    },
    error: function () {
      Swal.fire("Error", "No se pudo guardar el cliente.", "error");
    },
  });
}

function AbrirModalEditar(clienteID) {
  $.ajax({
    url: "../../Cliente/ListadoClientes",
    type: "POST",
    dataType: "json",
    data: { clienteID },
    success: function (response) {
      let cliente = response.clientes[0];

      $("#ClienteIDModal").val(cliente.clienteID);
      $("#nombreModal").val(cliente.nombre);
      $("#localidadModal").val(cliente.localidad);
      $("#telefonoModal").val(cliente.telefono);
      $("#emailModal").val(cliente.email);
      $("#dnicuitModal").val(cliente.dni_cuil);

      const modal = new bootstrap.Modal(
        document.getElementById("modalEditarCliente"),
      );
      modal.show();
    },
  });
}

function LimpiarFormularioAlta() {
  $("#nombre").val("");
  $("#localidad").val("");
  $("#telefono").val("");
  $("#email").val("");
  $("#dni").val("");
}

function DesactivarCliente(clienteID, accion) {
  Swal.fire({
    title: "¿Estás seguro?",
    text:
      accion === 1
        ? "El cliente será desactivado."
        : "El cliente será activado.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "../../Cliente/DesactivarCliente",
        type: "POST",
        data: { clienteID: clienteID, accion: accion },
        dataType: "json",
        success: function (respuesta) {
          if (respuesta.success) {
            ListadoClientes();
            Swal.fire("Éxito!", "Estado actualizado.", "success");
          }
        },
      });
    }
  });
}

// Función para eliminar un producto permanentemente

function EliminarCliente(clienteID) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará el cliente permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "../../Cliente/EliminarCliente",
        type: "POST",
        data: { clienteID: clienteID },
        dataType: "json",
        success: function (respuesta) {
          if (respuesta.success) {
            Swal.fire({
              title: "¡Eliminado!",
              text: "El cliente ha sido eliminado correctamente.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });

            ListadoClientes(); // Recargar la lista después de eliminar
          } else {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el producto.",
              icon: "error",
            });
          }
        },
        error: function () {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un problema al eliminar el producto.",
            icon: "error",
          });
        },
      });
    }
  });
}
