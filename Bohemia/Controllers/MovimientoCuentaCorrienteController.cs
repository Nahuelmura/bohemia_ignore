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

    public JsonResult ListadoCuentaCorrienteClientes()
    {
        var data = _context.MovimientosCuentaCorrientes
            .Include(m => m.Cliente)
            .GroupBy(m => new { m.ClienteID, m.Cliente.Nombre })
            .Select(g => new CuentaCorrienteClienteVista
            {
                ClienteID = g.Key.ClienteID,
                
                ClienteNombre = g.Key.Nombre,
                SaldoActual = g
                            .OrderByDescending(x => x.MovimientoCuentaCorrienteID)
                            .Select(x => x.Saldo)
                            .FirstOrDefault(),
                Pendiente = g.Where(x => x.TipoMovimiento == TipoMovimiento.Venta)
                            .Sum(x => x.Importe)
                            - g.Where(x => x.TipoMovimiento == TipoMovimiento.Cobro)
                            .Sum(x => x.Importe),
                UltimoMovimiento = g.Max(x => x.Fecha)

            })
            .ToList();

        return Json(data);
    }



    public JsonResult ListadoPorCliente(int clienteID)
{
    var movimientos = _context.MovimientosCuentaCorrientes
        .Where(m => m.ClienteID == clienteID)
        .OrderByDescending(m => m.Fecha)
        .Select(m => new
        {
            m.Fecha,
            m.Importe,
            m.TipoMovimiento,
            m.ReferenciaTipo,
            m.ReferenciaID,
            m.Saldo
        })
        .ToList();

    return Json(movimientos);
}


public JsonResult ObtenerSaldoTotal()
{
    var saldoTotal = _context.MovimientosCuentaCorrientes
        .GroupBy(m => m.ClienteID)
        .Select(g => g
            .OrderByDescending(x => x.Fecha)
            .Select(x => x.Saldo)
            .FirstOrDefault()
        )
        .Sum();

    return Json(saldoTotal);
}


public JsonResult ObtenerTotalPendiente()
{
    var totalPendiente = _context.MovimientosCuentaCorrientes
        .Where(m => m.TipoMovimiento == TipoMovimiento.Venta
                 || m.TipoMovimiento == TipoMovimiento.Cobro)
        .Sum(m => m.TipoMovimiento == TipoMovimiento.Venta ? m.Importe : -m.Importe);

    return Json(totalPendiente);
}

    
}