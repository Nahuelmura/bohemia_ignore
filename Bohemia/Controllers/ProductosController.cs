using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class ProductosController : Controller
{
    private readonly ILogger<ProductosController> _logger;
    private readonly ApplicationDbContext _context;

    public ProductosController(ILogger<ProductosController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }
[Authorize(Roles = "ADMINISTRADOR")]
    public IActionResult Index(string codigo)
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
        ViewBag.Descripcion = selectListItems.OrderBy(t => t.Text).ToList();

          ViewBag.descripcionModal = selectListItems.OrderBy(t => t.Text).ToList();
          
          
          var productos = _context.Productos.AsQueryable();

    if (!string.IsNullOrEmpty(codigo))
    {
        productos = productos.Where(p => p.Codigo.Contains(codigo));
    }

    var listaProductos = productos.ToList();
    listaProductos.Add(new Producto { ProductoID = 0, Codigo = "[ Buscar]" });

    ViewBag.CodigoBuscarID = new SelectList(listaProductos.OrderBy(c => c.Codigo), "ProductoID", "Codigo");
        return View();
    }



    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }


public JsonResult ListadoProducto(int productoID, string codigo, string observacion)
{
    var productos = _context.Productos.AsQueryable();

    if (productoID > 0)
    {
        productos = productos.Where(p => p.ProductoID == productoID);
    }

    if (!string.IsNullOrEmpty(codigo))
    {
        productos = productos.Where(p => p.Codigo.StartsWith(codigo));
    }


        if (!string.IsNullOrEmpty(observacion))
    {
        productos = productos.Where(p => p.Observacion.StartsWith(observacion));
    }




    
    int totalProductosRegistrados = productos.Count();

    int totalCantidadProductos = productos.Sum(p => p.Cantidad);

    decimal totalPrecioCosto = productos.Sum(p => p.PrecioCosto  * p.Cantidad);

    
    var productoMostrar = productos.Select(p => new ProductoVista
    
    {
        
        ProductoID = p.ProductoID,
        Codigo = p.Codigo,
        Descripcion = p.Descripcion,
        Observacion = p.Observacion.ToUpper(),
        Descripcionstring = p.Descripcion.ToString().ToUpper(),
        Cantidad = p.Cantidad,
        PrecioCosto = p.PrecioCosto,
        PrecioVenta = p.PrecioVenta,
        CantidadProducto = totalProductosRegistrados,
        Eliminado = p.Eliminado,
    }).ToList();

return Json(new { 
    productos = productoMostrar, 
    totalPrecioCosto, 
    totalCantidadProductos // Agregamos la cantidad total de productos 
});
}












    public JsonResult GuardarProducto(int productoID, string codigo, Descripcion descripcion, int cantidad, decimal precio, string observacion,decimal precioVenta, DateTime fechaIngreso)
    {
        string resultado = "";

        if (precio  > precioVenta)
        {
            return Json ("El precio de costo no puede ser mayor al precio de venta");
        }
        


Thread.CurrentThread.CurrentCulture = new CultureInfo("es-AR");
   string numeroString = "50.66";
        if(!string.IsNullOrEmpty(numeroString)){
            numeroString = numeroString.Replace(".", ",");
        }
       
        if (!String.IsNullOrEmpty(codigo))
        {

            codigo = codigo.ToUpper();
            // observacion = observacion.ToUpper();

            if (productoID == 0)
            {
                var existeProducto = _context.Productos.Where(e => e.Codigo == codigo).Count();
                if (existeProducto == 0)
                {
                    var NuevoProducto = new Producto
                    {
                        Codigo = codigo,
                        Descripcion = descripcion,
                        Cantidad = cantidad,
                        PrecioCosto = precio,
                        Observacion = observacion,
                        PrecioVenta = precioVenta,
                      FechaIngreso = DateTime.Now


                    };
                    _context.Add(NuevoProducto);
                    _context.SaveChanges();
                    resultado = "Producto guardado exitosamente";
                }
                else
                {
                    resultado = "Sistema existente";
                }
            }
            else
            {
                var editarProducto = _context.Productos.Where(e => e.ProductoID == productoID).SingleOrDefault();
                if (editarProducto != null)
                {
                    var existeProducto = _context.Productos.Where(e => e.Codigo == codigo && e.ProductoID != productoID).Count();
                    if (existeProducto == 0)
                    {
                        editarProducto.Codigo = codigo;
                        editarProducto.Descripcion = descripcion;
                        editarProducto.Cantidad = cantidad;
                        editarProducto.PrecioCosto = precio;
                        editarProducto.PrecioVenta = precioVenta;
                        editarProducto.Observacion = observacion;
                        editarProducto.FechaIngreso = DateTime.Now;



                        _context.SaveChanges();
                        resultado = "Producto editado exitosamente";
                    }
                    else
                    {
                        resultado = "Producto existente";
                    }
                }
            }
        }
        else
        {
            resultado = "Debe ingresar un Codigo";
        }


        return Json(resultado);
    }

public JsonResult DesactivarProducto(int productoID, int accion)
{
    var producto = _context.Productos.Find(productoID);

    if (producto == null)
    {
        return Json(new { success = false, message = "Producto no encontrado." });
    }

    producto.Eliminado = (accion == 1);
    _context.SaveChanges();

    return Json(new { success = true });
}

public JsonResult EliminarProducto(int productoID)
{
    var eliminarProducto = _context.Productos.Find(productoID);

    if (eliminarProducto == null)
    {
        return Json(new { success = false, message = "Producto no encontrado." });
    }

    try
    {
        _context.Productos.Remove(eliminarProducto);
        _context.SaveChanges();
        return Json(new { success = true });
    }
    catch (Exception ex)
    {
        return Json(new { success = false, message = "Error al eliminar el producto: " + ex.Message });
    }
}



[HttpGet]
public JsonResult BuscarDescripciones(string term)
{
    var descripciones = Enum.GetValues(typeof(Descripcion))
                            .Cast<Descripcion>()
                            .Select(e => e.ToString().ToUpper())
                            .Where(d => d.Contains(term.ToUpper())) // Filtra según el término ingresado
                            .ToList();

    return Json(descripciones);
}
}

