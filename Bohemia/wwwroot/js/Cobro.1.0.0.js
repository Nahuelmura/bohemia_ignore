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
                </tr>`;
      });

      $("#tbody-cobro").html(contenidoTabla);
    },
    error: function (xhr) {
      console.error("Error al cargar cobros", xhr);
    },
  });
}
