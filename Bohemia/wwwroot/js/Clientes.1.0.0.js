window.onload = ListadoClientes;



function ListadoClientes() {
    $.ajax({
        url: '../../Cliente/ListadoClientes',
        type: 'POST',
        dataType: 'json',
        success: function (listadoClientes) {

            let clientes = listadoClientes.clientes;
            let contenidoTabla = ``;

            $.each(clientes, function (index, cliente) {



                let claseEliminado = cliente.eliminado ? 'table-danger' : '';


                let nombre = cliente.eliminado
                    ? `<del>${mostrarValor(cliente.nombre)}</del>`
                    : mostrarValor(cliente.nombre);

                let localidad = cliente.eliminado
                    ? `<del>${mostrarValor(cliente.localidad)}</del>`
                    : mostrarValor(cliente.localidad);

                let telefono = cliente.eliminado
                    ? `<del>${mostrarValor(cliente.telefono)}</del>`
                    : mostrarValor(cliente.telefono);

                let email = cliente.eliminado
                    ? `<del>${mostrarValor(cliente.email)}</del>`
                    : mostrarValor(cliente.email);

                let dni = cliente.eliminado
                    ? `<del>${mostrarValor(cliente.dni_cuil)}</del>`
                    : mostrarValor(cliente.dni_cuil);

                let botonEstado = `
                    <button type="button"
                        class="btn ${cliente.eliminado ? 'btn-outline-success' : 'btn-outline-danger'}"
                        onclick="DesactivarCliente(${cliente.clienteID}, ${cliente.eliminado ? 0 : 1})">
                        <i class="fa-solid fa-ban ${cliente.eliminado ? 'fa-check-circle' : 'fa-trash-can'}"></i>
                    </button>`;


                let botonEliminar = `
                        <button type="button" class="btn btn-danger" onclick="EliminarCliente(${cliente.clienteID})">
                            <i class="fa-solid fa-trash"></i> 
                        </button>`;

LimpiarFormularioAlta();
                contenidoTabla += `
                    <tr class="${claseEliminado}">
                        <td>${nombre}</td>
                        <td>${localidad}</td>
                        <td>${telefono}</td>
                        <td>${email}</td>
                        <td>${dni}</td>
                        <td>
                            <button type="button" class="btn btn-outline-success me-2"
                                onclick="AbrirModalEditar(${cliente.clienteID})">
                                <i class="fa-solid fa-file-pen"></i>
                            </button>
                        </td>
                        <td>
                            ${botonEstado}
                            
                        </td>
                        <td>${botonEliminar}</td>
                    </tr>`;
            });

            document.getElementById("detalleCliente").innerHTML = contenidoTabla;
        },
        error: function () {
            alert("Error al cargar los clientes.");
        }
    });
}


function mostrarValor(valor) {
    return (valor === null || valor === undefined || valor === "" || valor == 0)
        ? "Sin asignar"
        : valor;
}


function GuardarCliente() {

    let clienteID = $("#ClienteID").val();
    let nombre, localidad, telefono, email, dni_cuil;

    if ($("#modalEditarCliente").hasClass("show")) {
        nombre = $("#nombreEditar").val().trim();
        localidad = $("#localidadEditar").val().trim();
        telefono = $("#telefonoEditar").val();
        email = $("#emailEditar").val().trim();
        dni_cuil = $("#dniEditar").val().trim();
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
        url: '../../Cliente/GuardarCliente',
        type: 'POST',
        dataType: 'json',
        data: {
            ClienteID: clienteID,
            nombre: nombre,
            localidad: localidad,
            telefono: telefono,
            email: email,
            dni_cuil: dni_cuil
        },
          success: function (resultado) {

            if (resultado === "Cliente guardado" || resultado === "cliente editado exitosamente") {
                Swal.fire(
                    "Éxito",
                    resultado,
                    "success"
                );
                $("#modalEditarCliente").modal("hide");
                ListadoClientes();
                LimpiarFormularioAlta();
            } else {
                Swal.fire(
                    "Atención",
                    resultado,
                    "warning"
                );
            }
        },
        error: function () {
            Swal.fire(
                "Error",
                "No se pudo guardar el cliente.",
                "error"
            );
        }
    });
}



function AbrirModalEditar(clienteID) {

        $.ajax({
            url: '../../Cliente/ListadoClientes',
            type: 'POST',
            dataType: 'json',
            data: { clienteID: clienteID },
            success: function (response) {

                let cliente = response.clientes[0];


                $("#ClienteID").val(cliente.clienteID);

                $("#nombreEditar").val(cliente.nombre);
                $("#localidadEditar").val(cliente.localidad);
                $("#telefonoEditar").val(cliente.telefono);
                $("#emailEditar").val(cliente.email);
                $("#dniEditar").val(cliente.dni_cuil);

                $("#modalEditarCliente").modal("show");
            }
        });
    }


function LimpiarFormularioAlta() {
            $("#nombre").val('');
            $("#localidad").val('');
            $("#telefono").val('');
            $("#email").val('');
            $("#dni").val('');
        }


function DesactivarCliente(clienteID, accion) {

            Swal.fire({
                title: '¿Estás seguro?',
                text: accion === 1 ? 'El cliente será desactivado.' : 'El cliente será activado.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {

                if (result.isConfirmed) {

                    $.ajax({
                        url: '../../Cliente/DesactivarCliente',
                        type: 'POST',
                        data: { clienteID: clienteID, accion: accion },
                        dataType: 'json',
                        success: function (respuesta) {
                            if (respuesta.success) {
                                ListadoClientes();
                                Swal.fire('Éxito!', 'Estado actualizado.', 'success');
                            }
                        }
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
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: '../../Cliente/EliminarCliente',
                        type: 'POST',
                        data: { clienteID: clienteID },
                        dataType: 'json',
                        success: function (respuesta) {
                            if (respuesta.success) {
                                Swal.fire({
                                    title: "¡Eliminado!",
                                    text: "El cliente ha sido eliminado correctamente.",
                                    icon: "success",
                                    timer: 2000,
                                    showConfirmButton: false
                                });

                                ListadoClientes(); // Recargar la lista después de eliminar
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