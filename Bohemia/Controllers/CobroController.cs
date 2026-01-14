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


}
