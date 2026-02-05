window.onload = function () {
    ObtenerProductosMinimos();
    ObtenerProductosMasVendidos();
};

function ObtenerProductosMinimos() {
    $.ajax({
        url: '../../Informe/ProductosMinimos',
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            $("#tbody-productos-minimos").html(`<tr><td colspan="3" style="text-align:center;">Cargando...</td></tr>`);
        },
        success: function (response) {
            
            let contenidoTabla = response.length === 0
            
                ? `<tr><td colspan="3" style="text-align: center; font-weight: bold; color: red;">No hay productos registrados</td></tr>`
                : response.map(producto => `
                    
                    <tr>
                        <td class="ocultar-en-768px " >${producto.descripcionProducto}</td>
                          <td class="ocultar-en-768px" >${producto.observaciones}</td>
                        
                        <td>${producto.codigoProducto}</td>
                        <td >${producto.cantidadVendida}</td>
                        <td style="text-align: center;">${producto.fechaIngreso}</td>
                     
                    </tr>
                `).join("");

            $("#tbody-productos-minimos").html(contenidoTabla);
        },
        error: function (xhr, status, error) {
            console.error("Error al traer los productos menos vendidos:", error);
        }
    });
}




function ObtenerProductosMasVendidos() {
    $.ajax({
        url: '../../Informe/ProductosMasVendidos', // Llamamos al nuevo método
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            $("#tbody-productos-mas-vendidos").html(`<tr><td colspan="3" style="text-align:center;">Cargando...</td></tr>`);
        },
        success: function (response) {
            let contenidoTabla = response.length === 0
                ? `<tr><td colspan="3" style="text-align: center; font-weight: bold; color: red;">No hay productos registrados</td></tr>`
                : response.map(producto => `
                    <tr>
                        <td class="ocultar-en-768px">${producto.descripcionProducto}</td>
                        <td class="ocultar-en-768px">${producto.observaciones}</td>
                        <td>${producto.codigoProducto}</td>
                        
                        <td>${producto.cantidadVendida}</td>
                         <td style="text-align: center;" >${producto.fechaIngreso}</td>
                    </tr>
                `).join("");

            $("#tbody-productos-mas-vendidos").html(contenidoTabla);
        },
        error: function (xhr, status, error) {
            console.error("Error al traer los productos más vendidos:", error);
        }
    });
}



    // Puedes definir Utils.months así si no tienes la librería de muestras
    const Utils = {
        months: function({ count }) {
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
          return months.slice(0, count);
        }
      };
  
      const labels = Utils.months({ count: 7 });
      const data = {
        labels: labels,
        datasets: [{
          label: 'My First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      };
  
      const config = {
        type: 'bar', // o 'line', 'pie', etc.
        data: data,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
  
      const myChart = new Chart(
        document.getElementById('myChart'),
        config
      );