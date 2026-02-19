window.onload = function () {
    ObtenerProductosMinimos();
    ObtenerProductosMasVendidos();
    cargarVentas();
    cargarVentaspro();
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
        url: '../../Informe/ProductosMasVendidos',
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


let chartMensual = null;
let chartDiario = null;
let chartpro = null;

function cargarVentas() {
    $.ajax({
        url: '../../Informe/VentasMensuales',
        type: 'GET',
        dataType: 'json',
        success: function (response) {

            // 🔁 Si ya existe, destruir
            if (chartMensual) {
                chartMensual.destroy();
            }

            chartMensual = new Chart(
                document.getElementById('chartMensual'),
                {
                    type: 'bar',
                    data: {
                        labels: response.labels,
                        datasets: [{
                            label: 'Ventas mensuales',
                            data: response.data,
                            backgroundColor: '#4e73df'
                        }]
                    },
                    options: {
                        onClick: (evt, elements) => {
                            if (!elements.length) return;

                            const index = elements[0].index;
                            const mes = response.meta[index].mes;
                            const año = response.meta[index].año;

                            cargarVentasDiarias(mes, año);
                        }
                    }
                }
            );
        }
    });
}


function cargarVentasDiarias(mes, año) {

    $.get('/Informe/VentasDiarias', { mes, año }, function (response) {

        // 🔁 Destruir gráfico anterior
        if (chartDiario) {
            chartDiario.destroy();
        }

        chartDiario = new Chart(
            document.getElementById('chartDiario'),
            {
                type: 'bar',
                data: {
                    labels: response.labels,
                    datasets: [{
                        label: `Ventas diarias`,
                        data: response.data,
                        backgroundColor: '#1cc88a'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
    });
}


   function cargarVentaspro() {
        $.ajax({
            url: '../../Informe/VentasMensuales',
            type: 'GET',
            dataType: 'json',
            success: function (response) {

                const canvas = document.getElementById('chartpro');
                const ctx = canvas.getContext('2d');

                // 🔁 Destruir si ya existe
                if (chartpro) {
                    chartpro.destroy();
                }

                // 🎨 Gradiente
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
                gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

                chartpro = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: response.labels,
                        datasets: [{
                            label: 'Ventas últimos 12 meses',
                            data: response.data,
                            borderColor: '#2563eb',
                            backgroundColor: gradient,
                            borderWidth: 3,

                            // 🔵 PUNTOS
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#2563eb',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7,

                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1f2937',
                                padding: 12,
                                callbacks: {
                                    label: function (context) {
                                        return '$ ' + context.parsed.y.toLocaleString('es-AR');
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value) {
                                        return new Intl.NumberFormat('es-AR', {
                                            style: 'currency',
                                            currency: 'ARS',
                                            maximumFractionDigits: 0
                                        }).format(value);
}
                                }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                });
            }
        });
    }


