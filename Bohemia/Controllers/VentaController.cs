using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class VentaController : Controller
{
    private ApplicationDbContext _context;

    private readonly UserManager<IdentityUser> _userManager;

    public VentaController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;

        _userManager = userManager;
    }

    public IActionResult Index(string codigo, DateTime? fecha, Descripcion descripcion)
    {

        // Crear una lista de SelectListItem que incluya el elemento adicional
        var selectListItems = new List<SelectListItem>
        {
            new SelectListItem { Value = "0", Text = "-Seleccione Descripcion De Filtro-" }
        };

        // Obtener todas las opciones del enum
        var enumValues = Enum.GetValues(typeof(Descripcion)).Cast<Descripcion>();

        // Convertir las opciones del enum en SelectListItem
        selectListItems.AddRange(enumValues.Select(e => new SelectListItem
        {
            Value = e.GetHashCode().ToString(),
            Text = e.ToString().ToUpper(),
            Selected = e == descripcion
        }));

        // Pasar la lista de opciones al modelo de la vista
        ViewBag.descripcionbuscarventa = selectListItems.OrderBy(t => t.Text).ToList();




        var ventas = _context.Productos.AsQueryable();

        if (!string.IsNullOrEmpty(codigo))
        {
            ventas = ventas.Where(s => s.Codigo.Contains(codigo));
        }

        var filtrarVentas = ventas.ToList();
        filtrarVentas.Add(new Producto { ProductoID = 0, Codigo = "[Buscar]" });
        ViewBag.CodigoProducto = new SelectList(filtrarVentas.OrderBy(c => c.Codigo), "ProductoID", "Codigo");


        var userId = _userManager.GetUserId(User);
        ViewBag.UsuarioId = userId ?? "";


        //         // Crear una lista de SelectListItem que incluya el elemento adicional para Forma_pago
        //         var selectListItemsFormaPago = new List<SelectListItem>
        // {
        //     new SelectListItem { Value = "0", Text = "-Seleccione Forma de Pago-" }
        // };

        //         // Obtener todas las opciones del enum Forma_pago y agregarlas a la lista
        //         var enumValuesFormaPago = Enum.GetValues(typeof(Forma_pago)).Cast<Forma_pago>();

        //         selectListItemsFormaPago.AddRange(enumValuesFormaPago.Select(e => new SelectListItem
        //         {
        //             Value = ((int)e).ToString(),
        //             Text = e.ToString()
        //         }));

        //         ViewBag.Forma_pago = selectListItemsFormaPago;





        // Obtener todas las opciones del enum Forma_pago
        var enumValuesFormaPago = Enum.GetValues(typeof(Forma_pago)).Cast<Forma_pago>();

        // Crear una lista de SelectListItem con "Contado" al principio y seleccionado por defecto
        var selectListItemsFormaPago = enumValuesFormaPago
            .OrderBy(e => e == Forma_pago.Contado ? 0 : 1) //  "Contado" al principio
            .Select(e => new SelectListItem
            {
                Value = ((int)e).ToString(),
                Text = e.ToString(),
                Selected = e == Forma_pago.Contado // Seleccionar "Contado" por defecto
            }).ToList();

        ViewBag.Forma_pago = selectListItemsFormaPago;




        return View();
    }








    public JsonResult ListadoDetalleVenta(int? detalleVentaID, string codigo, DateTime? fecha, string? Descripcionbuscarventa)
    {
        var listadoDetalleVentas = _context.DetalleVentas
            .Include(v => v.Productos)
            .Include(v => v.Ventas)
            .OrderByDescending(v => v.Ventas.Fecha_Venta)
            .ToList();

        Thread.CurrentThread.CurrentCulture = new CultureInfo("es-AR");

        // Filtros existentes...
        if (!string.IsNullOrEmpty(Descripcionbuscarventa) && Descripcionbuscarventa != "0")
        {
            if (Enum.TryParse(Descripcionbuscarventa, out Descripcion descEnum))
            {
                listadoDetalleVentas = listadoDetalleVentas
                    .Where(d => d.Productos.Descripcion == descEnum)
                    .ToList();
            }
        }
        if (detalleVentaID.HasValue)
            listadoDetalleVentas = listadoDetalleVentas.Where(d => d.DetalleVentaID == detalleVentaID).ToList();
        if (!string.IsNullOrEmpty(codigo))
            listadoDetalleVentas = listadoDetalleVentas.Where(d => d.Productos.Codigo.StartsWith(codigo)).ToList();
        if (fecha.HasValue)
        {
            var fechaBuscada = fecha.Value.Date;
            listadoDetalleVentas = listadoDetalleVentas
                .Where(d => d.Ventas.Fecha_Venta.Date == fechaBuscada)
                .ToList();
        }

        var detalleMostrar = listadoDetalleVentas.Select(v =>
        {
            // 1) Determinar porcentaje de descuento
            decimal porcentaje = v.Ventas.Forma_pago switch
            {
                Forma_pago.Contado => 0.10m,
                Forma_pago.Lista_financiacion => 0.00m,
                Forma_pago.Descuento_10 => 0.10m,
                Forma_pago.Descuento_20 => 0.20m,
                Forma_pago.Descuento_30 => 0.30m,
                Forma_pago.Descuento_40 => 0.40m,
                Forma_pago.Descuento_50 => 0.50m,
                _ => 0.00m
            };

            // 2) Aplicar descuento al precio de venta
            decimal precioConDescuento = v.Productos.PrecioVenta * (1 - porcentaje);
            // 3) Recalcular total según la cantidad
            decimal totalConDescuento = v.Cantidad * precioConDescuento;

            return new DetalleVentaVista
            {
                ProductoID = v.ProductoID,
                VentaID = v.VentaID,
                DetalleVentaID = v.DetalleVentaID,

                Descripcion = v.Productos.Descripcion,
                DescripcionProducto = v.Productos.Descripcion.ToString(),
                CantidadProducto = v.Productos.Cantidad,
                PrecioCostoProducto = v.Productos.PrecioCosto,
                Observacion = v.Productos.Observacion,
                CodigoProducto = v.Productos.Codigo,

                // Aquí enviamos ya el precio de venta y total con descuento
                PrecioVentaProducto = precioConDescuento,
                Total = totalConDescuento,

                Fecha_Venta = v.Ventas.Fecha_Venta,
                Fecha_Venta_string = v.Ventas.Fecha_Venta.ToString("dd/MM/yyyy"),
                Forma_pago = v.Ventas.Forma_pago,
                Forma_pagostring = v.Ventas.Forma_pago.ToString(),

                Cantidad = v.Cantidad,
                PrecioUnitario = v.PrecioUnitario  // si lo necesitás como referencia original
            };
        })
        .ToList();

        return Json(detalleMostrar);
    }


    [HttpGet]
    public JsonResult ObtenerProductoInfo(string codigoProducto)
    {
        try
        {
            var producto = _context.Productos.FirstOrDefault(p => p.Codigo == codigoProducto && !p.Eliminado);

            if (producto == null)
            {
                return Json(new { success = false, message = "Producto no encontrado" });
            }

            return Json(new { success = true, precio = producto.PrecioVenta, observacion = producto.Observacion, descripcionProducto = producto.Descripcion.ToString(), stock = producto.Cantidad, });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Error al obtener la información del producto: " + ex.Message });
        }
    }   




    [HttpPost]
    public JsonResult GuardarVenta(DateTime? fecha_venta, decimal total, string usuarioID, Forma_pago Forma_pago, int clienteID)
    {
        try
        {
            if (string.IsNullOrEmpty(usuarioID))
            {
                return Json(new { success = false, message = "ID de usuario inválido" });
            }

            var usuario = _context.Users.FirstOrDefault(u => u.Id == usuarioID);
            if (usuario == null)
            {
                return Json(new { success = false, message = "Usuario no encontrado" });
            }

            DateTime fechaVenta = fecha_venta ?? DateTime.Now;

            var venta = new Venta
            {
                ClienteID = clienteID,
                Fecha_Venta = fechaVenta,
                Total = total,
                UsuarioID = usuario.Email, // Guardar el email del usuario en UsuarioID
                Forma_pago = Forma_pago,
            };

            _context.Ventas.Add(venta);
            _context.SaveChanges(); // Guardamos para obtener el ID de la nueva venta

            // Obtener último saldo del cliente
            decimal ultimoSaldo = _context.MovimientosCuentaCorrientes
                .Where(m => m.ClienteID == clienteID)
                .OrderByDescending(m => m.Fecha)
                .Select(m => m.Saldo)
                .FirstOrDefault();

            // Crear movimiento por venta
            var movimientoVenta = new MovimientoCuentaCorriente
            {
                ClienteID = clienteID,
                Fecha = fechaVenta,

                Importe = total, // POSITIVO
                Saldo = ultimoSaldo + total,

                TipoMovimiento = TipoMovimiento.Venta,
                ReferenciaTipo = "Venta",
                ReferenciaID = venta.VentaID
            };

            _context.MovimientosCuentaCorrientes.Add(movimientoVenta);
            _context.SaveChanges();

            return Json(new { success = true, ventaId = venta.VentaID });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Error al guardar la venta: " + ex.Message });
        }
    }



    [HttpPost]
    public JsonResult GuardarDetalleVenta(int ClienteID, int ventaId, string codigoProducto, int cantidad, decimal precioUnitario, string usuarioID)
    {
        Thread.CurrentThread.CurrentCulture = new CultureInfo("es-AR");
        try
        {
            if (string.IsNullOrEmpty(usuarioID))
            {
                return Json(new { success = false, message = "ID de usuario inválido" });
            }

            var usuario = _context.Users.FirstOrDefault(u => u.Id == usuarioID);
            if (usuario == null)
            {
                return Json(new { success = false, message = "Usuario no encontrado" });
            }
            // Buscar la venta
            var venta = _context.Ventas.Find(ventaId);
            if (venta == null)
            {
                return Json(new { success = false, message = "Venta no encontrada" });
            }

            // Buscar el producto por código
            var producto = _context.Productos.FirstOrDefault(p => p.Codigo == codigoProducto && !p.Eliminado);
            if (producto == null)
            {
                return Json(new { success = false, message = "Producto no encontrado" });
            }

            // Verificar si hay suficiente stock
            if (producto.Cantidad < cantidad)
            {
                return Json(new { success = false, message = "Stock insuficiente" });
            }

            if (cantidad == 0)
            {
                return Json(new { success = false, message = "La cantidad tiene que ser igual o mayuor a 1" });
            }



            // Restar la cantidad del stock
            producto.Cantidad -= cantidad;

            // Crear el detalle de venta con el ProductoID obtenido
            var detalleVenta = new DetalleVenta
            {
                VentaID = ventaId,
                ProductoID = producto.ProductoID,
                Cantidad = cantidad,
                PrecioUnitario = precioUnitario / 100,
               
                UsuarioID = usuario.Email, // Guardar el email del usuario en UsuarioID


            };

            _context.DetalleVentas.Add(detalleVenta);
            _context.SaveChanges();

            return Json(new { success = true, message = "Detalle de venta guardado exitosamente" });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Error al guardar el detalle de venta: " + ex.Message });
        }
    }



// busqueda de cliente en venta 

//Controllador de cliente en venta 

[HttpGet]
public JsonResult BuscarClientes(string texto)
{
    if (string.IsNullOrWhiteSpace(texto))
    {
        return Json(new { success = true, clientes = new List<object>() });
    }

    var clientes = _context.Clientes
        .Where(c =>
            !c.Eliminado &&
            c.Nombre != null &&
            c.Nombre.Contains(texto)
        )
        .Select(c => new
        {
            clienteID = c.ClienteID,
            nombre = c.Nombre,
            localidad = c.Localidad,
            telefono = c.Telefono,
            dni = c.Dni_cuil
        })
        .Take(10)
        .ToList();

    return Json(new { success = true, clientes });
}



[HttpGet]
public JsonResult ObtenerClienteID(int id)
{
    var cliente = _context.Clientes
        .Where(c => c.ClienteID == id && !c.Eliminado)
        .Select(c => new
        {
            clienteID = c.ClienteID,
            nombre = c.Nombre,
            localidad = c.Localidad,
            telefono = c.Telefono,
            dni = c.Dni_cuil
        })
        .FirstOrDefault();

    if (cliente == null)
    {
        return Json(new { success = false, message = "Cliente no encontrado" });
    }

    return Json(new { success = true, cliente });
}



}