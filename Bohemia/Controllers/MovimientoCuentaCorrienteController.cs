using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
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
        var movimientos = _context.MovimientosCuentaCorrientes
        .Include(m => m.Cliente)
        .OrderByDescending(m => m.MovimientoCuentaCorrienteID)
        .ToList();

        var MovimientosMostrar = movimientos.Select(m => new MovimientoCuentaCorrienteVista
        {
            MovimientoCuentaCorrienteID = m.MovimientoCuentaCorrienteID,
            ClienteID = m.ClienteID,
            ClienteNombre = m.Cliente != null ? m.Cliente.Nombre : "",
            Importe = m.Importe,
            Saldo = m.Saldo,
            Fecha = m.Fecha,
            FechaString = m.Fecha.ToString("dd/MM/yyyy"),
            TipoMovimiento = m.TipoMovimiento,
            TipoMovimientoDescripcion = m.TipoMovimiento.ToString(),
        }).ToList();

        return Json(MovimientosMostrar);
    }
}