using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class CompraController : Controller
{
    private readonly ILogger<CompraController> _logger;
    private ApplicationDbContext _context;

    public CompraController(ILogger<CompraController> logger, ApplicationDbContext context)
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
        var enumValues = Enum.GetValues(typeof(TipoCompra)).Cast<TipoCompra>();

        // Convertir las opciones del enum en SelectListItem
        selectListItems.AddRange(enumValues.Select(e => new SelectListItem
        {
            Value = e.GetHashCode().ToString(),
            Text = e.ToString().ToUpper()
        }));

        // Pasar la lista de opciones al modelo de la vista
        ViewBag.TipoCompra = selectListItems.OrderBy(t => t.Text).ToList();
        ViewBag.TipoCompraModal = selectListItems.OrderBy(t => t.Text).ToList();

        ViewBag.descripcionModal = selectListItems.OrderBy(t => t.Text).ToList();



        return View();
    }

    [HttpGet]
    public JsonResult ListadoCompras(int compraID)
    {
        var detalles = _context.DetalleCompras
      .Include(d => d.Compras)
          .ThenInclude(c => c.Proveedor)
      .Include(d => d.Productos)
      .ToList();



        // 🔥 FILTRO (manteniendo tu lógica)
        if (compraID > 0)
        {
            detalles = detalles
                .Where(c => c.CompraID == compraID)
                .ToList();
        }



        var comprasAgrupadas = detalles
       .GroupBy(c => new
       {
           c.CompraID,
           NombreProveedor = c.Compras.Proveedor != null ? c.Compras.Proveedor.NombreProveedor : "Sin proveedor",
           c.Compras.MontoCompra,
           c.Compras.Observacion,
           c.Compras.FacturaNumero,
           c.Compras.FechaCompra,
           TipoCompra = c.Compras.TipoCompra.ToString()
       })
       .Select(g => new
       {
           compraID = g.Key.CompraID,
           nombreProveedor = g.Key.NombreProveedor,
           montoCompra = g.Key.MontoCompra,
           observacionCompra = g.Key.Observacion,
           facturaNumeroCompra = g.Key.FacturaNumero,
           fechaCompra = g.Key.FechaCompra,
           tipoCompra = g.Key.TipoCompra,

           productos = g.Select(p => new
           {
               codigoProducto = p.Productos != null ? p.Productos.Codigo : "",
               precioCostoProducto = p.Productos != null ? p.Productos.PrecioCosto : 0,
               precioVentaProducto = p.Productos != null ? p.Productos.PrecioVenta : 0,
               fechaIngresoProducto = p.Productos.FechaIngreso,
               cantidadCompra = p.Cantidad,
               precioUnitarioCompra = p.PrecioUnitario
           }).ToList()
       })
       .ToList();

        return Json(comprasAgrupadas);
    }



    [HttpPost]
    public JsonResult GuardarCompraConDetalle([FromBody] CompraDTO data)
    {
        using (var transaction = _context.Database.BeginTransaction())
        {
            try
            {
                // 🟢 GUARDAR COMPRA
                var compra = new Compra
                {
                    ProveedorID = data.proveedorID,
                    FacturaNumero = data.facturaNumero,
                    MontoCompra = data.montoCompra,
                    Observacion = data.observacion,
                    FechaCompra = data.fechaCompra,
                    TipoCompra = (TipoCompra)data.tipoCompra
                };

                _context.Compras.Add(compra);
                _context.SaveChanges();

                // 🟢 GUARDAR TODOS LOS DETALLES 🔥
                foreach (var item in data.detalles)
                {
                    var detalle = new DetalleCompra
                    {
                        CompraID = compra.CompraID,
                        ProductoID = item.productoID,
                        Cantidad = item.cantidad,
                        PrecioUnitario = item.precioUnitario
                    };

                    _context.DetalleCompras.Add(detalle);
                }

                _context.SaveChanges();

                transaction.Commit();

                return Json("OK");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Json("ERROR: " + ex.Message);
            }
        }
    }





    [HttpPost]
    public JsonResult GuardarCompra(int ProveedorID, int CompraID, int facturaNumero, decimal montoCompra, string observacion, DateTime fechaCompra, TipoCompra tipoCompra)
    {


        string resultado = "";




        if (CompraID == 0)
        {
            var existeCompra = _context.Compras.Where(e => e.FacturaNumero == facturaNumero).Count();
            if (existeCompra == 0)
            {
                var NuevaCompra = new Compra
                {
                    FacturaNumero = facturaNumero,
                    MontoCompra = montoCompra,
                    Observacion = observacion,
                    FechaCompra = fechaCompra,
                    TipoCompra = tipoCompra,
                    ProveedorID = ProveedorID,



                };
                _context.Add(NuevaCompra);
                _context.SaveChanges();
                resultado = "Compra guardada";
            }
            else
            {
                resultado = "Compra  existente";
            }
        }
        else
        {
            var editarCompra = _context.Compras.Where(e => e.CompraID == CompraID).SingleOrDefault();
            if (editarCompra != null)
            {
                var existeCompra = _context.Compras.Where(e => e.FacturaNumero == facturaNumero && e.CompraID != CompraID).Count();
                if (existeCompra == 0)
                {
                    editarCompra.ProveedorID = ProveedorID;
                    editarCompra.FacturaNumero = facturaNumero;
                    editarCompra.MontoCompra = montoCompra;
                    editarCompra.Observacion = observacion;
                    editarCompra.FechaCompra = fechaCompra;
                    editarCompra.TipoCompra = tipoCompra;



                    _context.SaveChanges();
                    resultado = "Compra editada exitosamente";
                }
                else
                {
                    resultado = "Compra existente";
                }
            }
        }

        return Json(resultado);
    }



    public JsonResult GuardarDetalleCompra(int productoID, int compraID, int detalleCompraID, int cantidad, decimal precioUnitario)
    {


        string resultado = "";




        if (detalleCompraID == 0)
        {

            {
                var NuevoDetalleCompra = new DetalleCompra
                {
                    ProductoID = productoID,
                    CompraID = compraID,
                    Cantidad = cantidad,
                    PrecioUnitario = precioUnitario,

                };
                _context.Add(NuevoDetalleCompra);
                _context.SaveChanges();
                resultado = " Detalle Compra guardada";
            }
            
                
            
            
            {
                resultado = " detalle Compra existente";
            }
        }
        else
        {
            var editarDetalleCompra = _context.DetalleCompras.Where(e => e.DetalleCompraID == detalleCompraID).SingleOrDefault();
            if (editarDetalleCompra != null)
            {
                var existeDetalleCompra = _context.DetalleCompras.Where(e => e.Cantidad == cantidad && e.DetalleCompraID != detalleCompraID).Count();
                if (existeDetalleCompra == 0)
                {
                    editarDetalleCompra.ProductoID = productoID;
                    editarDetalleCompra.CompraID = compraID;
                    editarDetalleCompra.Cantidad = cantidad;
                    editarDetalleCompra.PrecioUnitario = precioUnitario;




                    _context.SaveChanges();
                    resultado = " detalle Compra editada exitosamente";
                }
                else
                {
                    resultado = " detalle Compra existente";
                }
            }
        }

        return Json(resultado);
    }












    [HttpGet]
    public JsonResult BuscarProveedores(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return Json(new { success = true, proveedores = new List<object>() });
        }

        var proveedores = _context.Proveedores
            .Where(p =>

                p.NombreProveedor != null &&
                p.NombreProveedor.Contains(texto)
            )
            .Select(p => new
            {
                proveedorID = p.ProveedorID,
                nombre = p.NombreProveedor,



            })
            .Take(10)
            .ToList();

        return Json(new { success = true, proveedores });
    }



    [HttpGet]
    public JsonResult ObtenerProveedorID(int id)
    {
        var proveedor = _context.Proveedores
            .Where(p => p.ProveedorID == id)
            .Select(p => new
            {
                proveedorID = p.ProveedorID,
                nombre = p.NombreProveedor,

            })
            .FirstOrDefault();

        if (proveedor == null)
        {
            return Json(new { success = false, message = "Proveedor no encontrado" });
        }

        return Json(new { success = true, proveedor });
    }








    [HttpGet]
    public JsonResult BuscarProductos(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return Json(new { success = true, productos = new List<object>() });
        }

        texto = texto.Trim().ToLower();

        var productos = _context.Productos
            .Where(p => p.Codigo != null && p.Codigo.ToLower().Contains(texto))
            .Select(p => new
            {
                productoID = p.ProductoID,
                codigo = p.Codigo,
                observacion = p.Observacion
            })
            .Take(10)
            .ToList();

        return Json(new { success = true, productos });
    }


    [HttpGet]
    public JsonResult ObtenerProductoID(int id)
    {
        var producto = _context.Productos
            .Where(p => p.ProductoID == id)
            .Select(p => new
            {
                productoID = p.ProductoID,
                codigo = p.Codigo,
                observacion = p.Observacion
                // 👉 agregá más campos si querés
                // precio = p.Precio
            })
            .FirstOrDefault();

        if (producto == null)
        {
            return Json(new { success = false, message = "Producto no encontrado" });
        }

        return Json(new { success = true, producto });
    }
    

    }




