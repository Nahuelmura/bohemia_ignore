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
        CultureInfo culturaArgentina = new CultureInfo("es-AR");
        Thread.CurrentThread.CurrentCulture = culturaArgentina;
        Thread.CurrentThread.CurrentUICulture = culturaArgentina;

        var consulta = _context.DetalleVentas
            .Include(d => d.Ventas)
            .Include(d => d.Productos)
            .AsQueryable();

        if (!string.IsNullOrEmpty(DescripcionBuscar) && DescripcionBuscar != "0")
        {
            if (Enum.TryParse(DescripcionBuscar, out Descripcion descripcionEnum))
            {
                consulta = consulta.Where(d => d.Productos.Descripcion == descripcionEnum);
            }
        }

        if (fechaDesde.HasValue && fechaHasta.HasValue)
        {
            DateTime desde = fechaDesde.Value.Date;
            DateTime hasta = fechaHasta.Value.Date.AddDays(1).AddTicks(-1);

            consulta = consulta.Where(d => d.Ventas.Fecha_Venta >= desde && d.Ventas.Fecha_Venta <= hasta);
        }

        var detalleventas = consulta.ToList();

        List<VentaVistaInforme> detalleVentasMostrar = new List<VentaVistaInforme>();

        foreach (var detalle in detalleventas)
        {
            var ventaMostrar = detalleVentasMostrar.FirstOrDefault(v => v.VentaID == detalle.VentaID);

            if (ventaMostrar == null)
            {
                bool esReversa = detalle.Ventas.VentaOriginalID != null;

                bool estaAnulada = _context.Ventas
                    .Any(v => v.VentaOriginalID == detalle.VentaID);

                ventaMostrar = new VentaVistaInforme
                {
                    VentaID = detalle.VentaID,
                    VentaOriginalID = detalle.Ventas.VentaOriginalID,
                    UsuarioID = detalle.UsuarioID,
                    EmailUsuario = detalle.UsuarioID,
                    Observacion = detalle.Productos.Observacion,

                    Fecha_Venta = detalle.Ventas.Fecha_Venta.Date,
                    Fecha_Ventas = detalle.Ventas.Fecha_Venta.ToString("dd/MM/yyyy"),
                    Forma_pagostring = detalle.Ventas.Forma_pago.ToString(),

                    EsReversa = esReversa,
                    EsAnulada = estaAnulada,

                    Total = 0,
                    GananciaTotal = 0,
                    ListadoDetalle = new List<VistadetalleVenta>()
                };

                detalleVentasMostrar.Add(ventaMostrar);
            }

            var calculoTotal = detalle.PrecioUnitario;
            var gananciaPorProducto = detalle.PrecioUnitario - (detalle.Productos.PrecioCosto * detalle.Cantidad);

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
                GananciaProducto = gananciaPorProducto
            });

            ventaMostrar.Total += calculoTotal;
            ventaMostrar.GananciaTotal += gananciaPorProducto;
        }

        detalleVentasMostrar = detalleVentasMostrar
      .OrderByDescending(v => v.VentaOriginalID ?? v.VentaID) // agrupa
      .ThenBy(v => v.EsReversa) // primero venta original, después reversa
      .ToList();

        decimal totalVentasFecha = detalleVentasMostrar.Sum(v => v.Total);
        decimal gananciaTotalFecha = detalleVentasMostrar.Sum(v => v.GananciaTotal);

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

    
