using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class CobroController : Controller
{
    private readonly ILogger<CobroController> _logger;
    private readonly ApplicationDbContext _context;

    public CobroController(ILogger<CobroController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }
    // [Authorize(Roles = "ADMINISTRADOR")]

    public IActionResult Index()
    {
        // Crear una lista de SelectListItem que incluya el elemento adicional
        var selectListItems = new List<SelectListItem>
        {
            new SelectListItem { Value = "0", Text = "[SELECCIONE LA FORMA DE COBRO]" }
        };

        // Obtener todas las opciones del enum
        var enumValues = Enum.GetValues(typeof(FormaCobro)).Cast<FormaCobro>();

        // Convertir las opciones del enum en SelectListItem
        selectListItems.AddRange(enumValues.Select(e => new SelectListItem
        {
            Value = e.GetHashCode().ToString(),
            Text = e.ToString().ToUpper()
        }));
        ViewBag.FormaCobro = selectListItems;
        return View();
    }

    public JsonResult ListadoCobro(int cobroID)
    {
        var cobros = _context.Cobros.AsQueryable();

        // if (cobros > 0)
        // {
        //     cobros = cobros
        //         .Where(c => c.ClienteID == clienteID);
        // }
        var CobrosMostrar = cobros.Select(c => new CobroVista
        {
            CobroID = c.CobroID,

            MontoCobro = c.MontoCobro,
            FechaCobro = c.FechaCobro,
            FormaCobro = c.FormaCobro.ToString(),

            ClienteID = c.ClienteID,
            NombreCliente = c.Cliente.Nombre,
            LocalidadCliente = c.Cliente.Localidad,
            TelefonoCliente = c.Cliente.Telefono,
            EmailCliente = c.Cliente.Email,
            Dni_cuilCliente = c.Cliente.Dni_cuil







        }).ToList();

        return Json(new
        {
            cobros = CobrosMostrar
        });
    }






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




