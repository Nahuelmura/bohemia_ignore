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
            // Saldo = m.Saldo,
            Fecha = m.Fecha,
            FechaString = m.Fecha.ToString("dd/MM/yyyy"),
            TipoMovimiento = m.TipoMovimiento,
            TipoMovimientoDescripcion = m.TipoMovimiento.ToString(),
        }).ToList();

        return Json(MovimientosMostrar);
    }

    public JsonResult ListadoCuentaCorrienteClientes(string nombre)
    {
        var query = _context.MovimientosCuentaCorrientes
            .Include(m => m.Cliente)
            .AsQueryable();

        // FILTRO POR NOMBRE
        if (!string.IsNullOrEmpty(nombre))
        {
            query = query.Where(m => m.Cliente.Nombre.Contains(nombre));
        }

        var data = query
            .GroupBy(m => new { m.ClienteID, m.Cliente.Nombre })
            .Select(g => new CuentaCorrienteClienteVista
            {
                ClienteID = g.Key.ClienteID,
                ClienteNombre = g.Key.Nombre,
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

        })
        .ToList();

    return Json(movimientos);
}



    public JsonResult SumaSaldo(int clienteID)
    {
        var saldo = _context.MovimientosCuentaCorrientes
            .Where(m => m.ClienteID == clienteID
                     && (m.TipoMovimiento == TipoMovimiento.Venta
                     || m.TipoMovimiento == TipoMovimiento.Cobro)) // 👈
            .Sum(m => m.TipoMovimiento == TipoMovimiento.Venta ? m.Importe : -m.Importe);

        return Json(new { saldo = saldo });
    }


    public JsonResult ObtenerSaldoTotal()
    {
        var saldo = _context.MovimientosCuentaCorrientes
            .Where(m => m.TipoMovimiento == TipoMovimiento.Venta
                     || m.TipoMovimiento == TipoMovimiento.Cobro) // 👈 mismo filtro que Pendiente
            .Sum(m => m.TipoMovimiento == TipoMovimiento.Venta ? m.Importe : -m.Importe);

        return Json(new { saldo = saldo });
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