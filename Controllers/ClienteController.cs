using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class ClienteController : Controller
{
    private readonly ILogger<ClienteController> _logger;
    private ApplicationDbContext _context;

    public ClienteController(
        ILogger<ClienteController> logger,
        ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult Index()
    {
        return View();
    }




    public JsonResult ListadoClientes(int clienteID, string nombre)
    {
        var clientes = _context.Clientes.AsQueryable();

        if (!string.IsNullOrEmpty(nombre))
        {
            clientes = clientes.Where(c => c.Nombre.StartsWith(nombre));
        }

        if (clienteID > 0)
        {
            clientes = clientes
                .Where(c => c.ClienteID == clienteID);
        }
        var clienteMostrar = clientes.OrderBy(c => c.Eliminado).ThenBy(C => C.Nombre) .Select(c => new ClienteVista
        {
            ClienteID = c.ClienteID,

            Nombre = c.Nombre,
            Localidad = c.Localidad,
            Telefono = c.Telefono,
            Email = c.Email,
            Dni_cuil = c.Dni_cuil,

          Eliminado = c.Eliminado,

            // ProductoDescripcion = c.Productos.Descripcion.ToString(),
            // ProductoCodigo = c.Productos.Codigo,
            // ProductoPrecioVenta = c.Productos.PrecioVenta,


            // VentaForma_pago = c.Ventas.Forma_pago,
            // VentaTotal = c.Ventas.Total,



        }).ToList();

        return Json(new
        { 
            clientes = clienteMostrar
        });
    }







    public JsonResult GuardarCliente(int clienteID, string nombre, string localidad, string telefono, string email, string dni_cuil)
    {
        string resultado = "";






        if (!String.IsNullOrEmpty(nombre))
        {

            nombre = nombre.ToUpper();

           var existeDni = _context.Clientes.Any(c => c.Dni_cuil == dni_cuil && c.ClienteID != clienteID);

           if (existeDni )
            {
                return Json ("El Dni o cuil ya existen");
            }




            if (clienteID == 0)
            {
                var existeCliente = _context.Clientes.Where(e => e.Nombre == nombre).Count();
                if (existeCliente == 0)
                {
                    var NuevoCliente = new Cliente
                    {
                        Nombre = nombre,
                        Localidad = localidad,
                        Telefono = telefono,
                        Email = email,
                        Dni_cuil = dni_cuil,



                    };
                    _context.Add(NuevoCliente);
                    _context.SaveChanges();
                    resultado = "Cliente guardado";
                }
                else
                {
                    resultado = "Cliente  existente";
                }
            }
            else
            {
                var editarCliente = _context.Clientes.Where(e => e.ClienteID == clienteID).SingleOrDefault();
                if (editarCliente != null)
                {
                    var existeCliente = _context.Clientes.Where(e => e.Nombre == nombre && e.ClienteID != clienteID).Count();
                    if (existeCliente == 0)
                    {
                        editarCliente.Nombre = nombre;
                        editarCliente.Localidad = localidad;
                        editarCliente.Telefono = telefono;
                        editarCliente.Email = email;
                        editarCliente.Dni_cuil = dni_cuil;



                        _context.SaveChanges();
                        resultado = "cliente editado exitosamente";
                    }
                    else
                    {
                        resultado = "cliente existente";
                    }
                }
            }
        }
        else
        {
            resultado = "Debe ingresar un nombre";
        }


        return Json(resultado);
    }





public JsonResult DesactivarCliente(int clienteID, int accion)
{
    var cliente = _context.Clientes.Find(clienteID);

    if (cliente == null)
    {
        return Json(new { success = false });
    }

    cliente.Eliminado = (accion == 1);
    _context.SaveChanges();

    return Json(new { success = true });
}





public JsonResult EliminarCliente(int clienteID)
{
    var eliminarClientes = _context.Clientes.Find(clienteID);

    if (eliminarClientes == null)
    {
        return Json(new { success = false, message = "Producto no encontrado." });
    }

    try
    {
        _context.Clientes.Remove(eliminarClientes);
        _context.SaveChanges();
        return Json(new { success = true });
    }
    catch (Exception ex)
    {
        return Json(new { success = false, message = "Error al eliminar el producto: " + ex.Message });
    }
}


}