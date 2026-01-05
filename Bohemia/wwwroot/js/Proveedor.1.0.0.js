window.onload = ListadoProveedores();

function GuardarProveedor() {
  let proveedorID, nombre, localidad, telefono, email, cuit;

  // Si el modal está abierto → EDITAR
  if ($("#modalEditarProveedor").hasClass("show")) {
    proveedorID = $("#ProveedorIDModal").val();
    nombre = $("#nombreModal").val().trim();
    localidad = $("#localidadModal").val().trim();
    telefono = $("#telefonoModal").val().trim();
    email = $("#emailModal").val().trim();
    cuit = $("#dnicuitModal").val().trim();
  }
  // Si no → ALTA
  else {
    proveedorID = $("#ProveedorID").val();
    nombre = $("#nombre").val().trim();
    localidad = $("#localidad").val().trim();
    telefono = $("#telefono").val().trim();
    email = $("#email").val().trim();
    cuit = $("#cuit").val().trim();
  }

  // VALIDACIONES
  if (!nombre) {
    Swal.fire({
      icon: "warning",
      title: "Nombre requerido",
      text: "Debe ingresar el nombre del proveedor.",
    });
    return;
  }

  if (!localidad) {
    Swal.fire({
      icon: "warning",
      title: "Localidad requerida",
      text: "Debe ingresar la localidad.",
    });
    return;
  }

  if (!localidad) {
    Swal.fire({
      icon: "warning",
      title: "Localidad requerida",
      text: "Debe ingresar la localidad.",
    });
    return;
  }
  if (!email) {
    Swal.fire({
      icon: "warning",
      title: "Email requerido",
      text: "Debe ingresar el email.",
    });
    return;
  }
  if (!cuit) {
    Swal.fire({
      icon: "warning",
      title: "DNT/CUIT requerido",
      text: "Debe ingresar el DNT/CUIT.",
    });
    return;
  }

  let proveedor = {
    ProveedorID: proveedorID,
    NombreProveedor: nombre,
    Localidad: localidad,
    Telefono: telefono,
    Email: email,
    Cuit: cuit,
  };

  // CONFIRMACIÓN
  Swal.fire({
    title: "¿Desea guardar el proveedor?",
    text:
      proveedorID == 0
        ? "Se registrará un nuevo proveedor."
        : "Se actualizarán los datos del proveedor.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;

    $.ajax({
      url: "../../Proveedor/GuardarProveedor",
      type: "POST",
      dataType: "json",
      data: proveedor,
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Proveedor guardado correctamente.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("modalEditarProveedor")
            );

            if (modal) {
              modal.hide();
            }

            ListadoProveedores();
            limpiarFormularioProveedor();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al guardar el proveedor.",
        });
      },
    });
  });
}

function ListadoProveedores() {
  $.ajax({
    url: "../../Proveedor/ListadoProveedores",
    type: "GET",
    dataType: "json",
    success: function (listadoProveedores) {
      let contenidoTabla = ``;

      $.each(listadoProveedores.proveedores, function (index, proveedor) {
        let botonEstado = `
                        <button type="button" class="btn ${
                          proveedor.activo
                            ? "btn-outline-success"
                            : "btn-outline-danger"
                        }" 
                            onclick="DesactivarProveedor(${
                              proveedor.proveedorID
                            }, ${proveedor.activo ? 0 : 1})">
                            <i class="fa-solid fa-ban ${
                              proveedor.activo
                                ? "fa-check-circle"
                                : "fa-trash-can"
                            }"></i> 
                        </button>`;

        contenidoTabla += `
          <tr>
            <td>${proveedor.nombreProveedor}</td>
            <td>${proveedor.localidad}</td>
            <td>${proveedor.telefono}</td>
            <td>${proveedor.email}</td>
            <td>${proveedor.cuit}</td>
            <td>
              <button class="btn btn-outline-success btn-sm"
                onclick="AbrirModalEditarProveedor(${proveedor.proveedorID})">
                <i class="fa-solid fa-file-pen"></i>
              </button>
            </td>
             <td class="ocultar-en-768px">${botonEstado}</td>
          </tr>
        `;
      });

      document.getElementById("listadoProveedores").innerHTML = contenidoTabla;
    },
    error: function () {
      alert("Error al cargar el listado de proveedores");
    },
  });
}

function DesactivarProveedor(proveedorID, nuevoEstado) {
  let accionTexto = nuevoEstado === 0 ? "desactivar" : "activar";

  let mensajeConfirmacion =
    nuevoEstado === 0
      ? "El proveedor quedará deshabilitado."
      : "El proveedor volverá a estar activo.";

  Swal.fire({
    title: `¿Desea ${accionTexto} el proveedor?`,
    text: mensajeConfirmacion,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;

    $.ajax({
      url: "../../Proveedor/DesactivarProveedor",
      type: "POST",
      dataType: "json",
      data: { proveedorID: proveedorID, nuevoEstado: nuevoEstado },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "¡Listo!",
            text:
              nuevoEstado === 0
                ? "Proveedor desactivado correctamente."
                : "Proveedor activado correctamente.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            ListadoProveedores();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al actualizar el estado del proveedor.",
        });
      },
    });
  });
}

function AbrirModalEditarProveedor(proveedorID) {
  $.ajax({
    url: "../../Proveedor/ObtenerProveedorPorID",
    type: "GET",
    dataType: "json",
    data: { proveedorID: proveedorID },
    success: function (response) {
      let proveedor = response.proveedor;

      $("#ProveedorIDModal").val(proveedor.proveedorID);
      $("#nombreModal").val(proveedor.nombreProveedor);
      $("#localidadModal").val(proveedor.localidad);
      $("#telefonoModal").val(proveedor.telefono);
      $("#emailModal").val(proveedor.email);
      $("#dnicuitModal").val(proveedor.cuit);

      let modal = new bootstrap.Modal(
        document.getElementById("modalEditarProveedor")
      );
      modal.show();
    },
    error: function () {
      alert("Error al obtener los datos del proveedor");
    },
  });
}

function limpiarFormularioProveedor() {
  $("#ProveedorID").val(0);
  $("#ProveedorIDModal").val(0);

  $("#nombre, #localidad, #telefono, #email, #cuit").val("");
  $(
    "#nombreModal, #localidadModal, #telefonoModal, #emailModal, #dnicuitModal"
  ).val("");
}
