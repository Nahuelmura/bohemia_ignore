using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class InformeController : Controller
{
    private readonly ILogger<InformeController> _logger;
    private readonly ApplicationDbContext _context;

    public InformeController(ILogger<InformeController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult Index()
    {


        // Crear una lista de SelectListItem que incluya el elemento adicional
        var selectListItems = new List<SelectListItem>
        {
            new SelectListItem { Value = "0", Text = "[SELECCIONE...]" }
        };

        // Obtener todas las opciones del enum
        var enumValues = Enum.GetValues(typeof(Descripcion)).Cast<Descripcion>();

        // Convertir las opciones del enum en SelectListItem
        selectListItems.AddRange(enumValues.Select(e => new SelectListItem
        {
            Value = e.GetHashCode().ToString(),
            Text = e.ToString().ToUpper()
        }));

        // Pasar la lista de opciones al modelo de la vista
        ViewBag.DescripcionBuscar = selectListItems.OrderBy(t => t.Text).ToList();




        return View();
    }




    public JsonResult TraerDetalleVentas(string? DescripcionBuscar, DateTime? fechaDesde, DateTime? fechaHasta)
    {
        List<VentaVistaInforme> detalleVentasMostrar = new List<VentaVistaInforme>();
        


        decimal totalVentasFecha = 0; // Variable para almacenar el total de ventas por fecha
        decimal gananciaTotalFecha = 0;
        var detalleventas = _context.DetalleVentas
            .Include(d => d.Ventas)
            .Include(d => d.Productos)
            .ToList();

        CultureInfo culturaArgentina = new CultureInfo("es-AR");
        Thread.CurrentThread.CurrentCulture = culturaArgentina;
        Thread.CurrentThread.CurrentUICulture = culturaArgentina;

        if (!string.IsNullOrEmpty(DescripcionBuscar) && DescripcionBuscar != "0")
        {
            if (Enum.TryParse(DescripcionBuscar, out Descripcion descripcionEnum))
            {
                detalleventas = detalleventas
                            .Where(d => d.Productos.Descripcion == descripcionEnum)
                            .ToList();
            }

        }

        if (fechaDesde.HasValue && fechaHasta.HasValue)
        {
            DateTime desde = fechaDesde.Value.Date; // Establece la hora en 00:00:00
            DateTime hasta = fechaHasta.Value.Date.AddDays(1).AddTicks(-1); // Fin del día 23:59:59

            detalleventas = detalleventas
                .Where(d => d.Ventas.Fecha_Venta >= desde && d.Ventas.Fecha_Venta <= hasta)
                .ToList();

            totalVentasFecha = detalleventas.Sum(d => d.PrecioUnitario );
gananciaTotalFecha = detalleventas.Sum(d => d.PrecioUnitario - (d.Productos.PrecioCosto * d.Cantidad));
        }
        


        foreach (var detalle in detalleventas)
        {
            var ventaMostrar = detalleVentasMostrar.FirstOrDefault(v => v.VentaID == detalle.VentaID);

            if (ventaMostrar == null)
            {
                ventaMostrar = new VentaVistaInforme
                {
                    VentaID = detalle.VentaID,
                    UsuarioID = detalle.UsuarioID,
                    EmailUsuario = detalle.UsuarioID,
                    Observacion = detalle.Productos.Observacion,

                    Fecha_Venta = detalle.Ventas.Fecha_Venta.Date,
                    Fecha_Ventas = detalle.Ventas.Fecha_Venta.ToString("dd/MM/yyyy"),
                    Forma_pagostring = detalle.Ventas.Forma_pago.ToString(),
                 
                    Total = 0, // Inicializar total en 0 total de la venta dia 
                    GananciaTotal = 0,
                    ListadoDetalle = new List<VistadetalleVenta>()
                };

                detalleVentasMostrar.Add(ventaMostrar);
              
            }
            // Calcular el total de la venta
         var calculoTotal = detalle.PrecioUnitario;

            // Calcular la ganancia (precio de venta - precio de costo)
            var gananciaPorProducto = detalle.PrecioUnitario - detalle.Productos.PrecioCosto * detalle.Cantidad;  // ver con juan


            ventaMostrar.ListadoDetalle.Add(new VistadetalleVenta
            {

                DetalleVentaID = detalle.DetalleVentaID,
                Cantidad = detalle.Cantidad,
                PrecioUnitario = detalle.PrecioUnitario,
                CodigoProducto = detalle.Productos?.Codigo,
                DescripcionProducto = detalle.Productos.Descripcion.ToString(),
                CantidadProducto = detalle.Cantidad,
                PrecioCostoProducto = detalle.Productos?.PrecioCosto ?? 0,
                PrecioVentaProducto = detalle.Productos.PrecioVenta,
                TotalVenta = calculoTotal,
                GananciaProducto = gananciaPorProducto, // Asigna la ganancia de cada producto
                // UsuarioID = detalle.UsuarioID,
                // EmailUsuario = detalle.UsuarioID,



            });



            // Sumar al total de la venta esto es el resultado que da en "total de la venta"
            ventaMostrar.Total += calculoTotal;

            // Sumar la ganancia total
            ventaMostrar.GananciaTotal += gananciaPorProducto;


            //Suma del total feneral del dia 
            // totalVentasFecha += calculoTotal;
            //  gananciaTotalFecha += gananciaPorProducto;
        }

        detalleVentasMostrar = detalleVentasMostrar
              .OrderByDescending(v => v.Fecha_Venta)
              .ToList();


        return Json(new
        {
            detalleVentasMostrar,
            totalVentasFecha,
            gananciaTotalFecha

        });
    }


















    public IActionResult IndexPro()
    {



          return View();
    }

public JsonResult ProductosMinimos()
{
    var productosNoVendidos = _context.Productos
        .Where(p => !_context.DetalleVentas.Any(dv => dv.ProductoID == p.ProductoID))
        .Select(p => new
        {
            ProductoID = p.ProductoID,
            NombreProducto = p.Descripcion,
            DescripcionProducto = p.Descripcion.ToString(),
            CodigoProducto = p.Codigo,
            FechaIngreso = p.FechaIngreso != null ? p.FechaIngreso.ToString("dd-MM-yyyy") : "SIN FECHA",
            CantidadVendida = 0,
            Observaciones = string.IsNullOrEmpty(p.Observacion) ? "NO DEFINIDO" : p.Observacion
        })
        .ToList();

    var productosMenosVendidos = _context.DetalleVentas
        .Include(dv => dv.Productos)
        .GroupBy(dv => dv.ProductoID)
        .Select(g => new
        {
            ProductoID = g.Key,
            NombreProducto = g.First().Productos.Descripcion,
            DescripcionProducto = g.First().Productos.Descripcion.ToString(),
            CodigoProducto = g.First().Productos.Codigo,
            FechaIngreso = g.First().Productos.FechaIngreso != null ? g.First().Productos.FechaIngreso.ToString("dd-MM-yyyy") : "SIN FECHA",
            CantidadVendida = g.Sum(dv => dv.Cantidad),
            Observaciones = string.IsNullOrEmpty(g.First().Productos.Observacion) ? "NO DEFINIDO" : g.First().Productos.Observacion
        })
        .OrderBy(p => p.CantidadVendida)
        .Take(5)
        .ToList();

    var resultado = productosNoVendidos.Concat(productosMenosVendidos).Take(5).ToList();

    return Json(resultado);
}





public JsonResult ProductosMasVendidos()
{
    var productosMasVendidos = _context.DetalleVentas
        .Include(dv => dv.Productos)
        .GroupBy(dv => dv.ProductoID)
        .Select(g => new
        {
            ProductoID = g.Key,
            NombreProducto = g.First().Productos.Descripcion,
          Observaciones = g.First().Productos.Observacion ?? "NO DEFINIDO",
            DescripcionProducto = g.First().Productos.Descripcion.ToString(),
            CodigoProducto = g.First().Productos.Codigo,
 CantidadVendida = g.Sum(dv => dv.Cantidad), // Suma la cantidad total vendida
  FechaIngreso = g.First().Productos.FechaIngreso != null ? g.First().Productos.FechaIngreso.ToString("dd-MM-yyyy") : "SIN FECHA",



        })
        .OrderByDescending(p => p.CantidadVendida) // Ordena de mayor a menor (más vendidos primero)
        .Take(10) // Solo los 5 más vendidos
        .ToList();

    return Json(productosMasVendidos);
}



}

    
