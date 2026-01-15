using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class MovimientoCuentaCorrienteController : Controller
{
    private readonly ILogger<MovimientoCuentaCorrienteController> _logger;
    private readonly ApplicationDbContext _context;

    public MovimientoCuentaCorrienteController(ILogger<MovimientoCuentaCorrienteController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }
    // [Authorize(Roles = "ADMINISTRADOR")]

    public IActionResult Index()
    {
        return View();
    }

    public JsonResult ListadoMovimientosCuentaCorriente()
    {
        var movimientos = _context.MovimientosCuentaCorrientes.ToList();

        // if (movimientos > 0)
        // {
        //     movimientos = movimientos
        //         .Where(m => m.CuentaCorrienteID == cuentaCorrienteID);
        // }

        var MovimientosMostrar = movimientos.Select(m => new MovimientoCuentaCorriente
        {
            MovimientoCuentaCorrienteID = m.MovimientoCuentaCorrienteID,
            ClienteID = m.ClienteID,
            Importe = m.Importe,
            Saldo = m.Saldo,
            Fecha = m.Fecha,
            TipoMovimiento = m.TipoMovimiento,
        }).ToList();

        return Json(MovimientosMostrar);
    }
}