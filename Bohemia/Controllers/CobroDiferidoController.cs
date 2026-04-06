using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;


public class CobroDiferidoController : Controller
{
    private readonly ILogger<CobroDiferidoController> _logger;
    private readonly ApplicationDbContext _context;

    public CobroDiferidoController(ILogger<CobroDiferidoController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

        public IActionResult Index()
    {
        return View();
    }

[HttpGet]
public JsonResult ListadoCobroCheques(DateTime? fechaDesde, DateTime? fechaHasta, 
                                       string? cliente, string? estado)
{
    var query = _context.CobrosCheques
        .Include(c => c.CobroDiferido)
            .ThenInclude(cd => cd.Cliente)
        .AsNoTracking()
        .AsQueryable();

    if (fechaDesde.HasValue)
        query = query.Where(c => c.FechaCobro >= fechaDesde.Value);

    if (fechaHasta.HasValue)
        query = query.Where(c => c.FechaCobro <= fechaHasta.Value);

    if (!string.IsNullOrWhiteSpace(cliente))
        query = query.Where(c => c.CobroDiferido.Cliente.Nombre.Contains(cliente));

    if (!string.IsNullOrWhiteSpace(estado))
    {
        if (estado == "Vencido")
        {
            // Cheques pendientes cuya fecha de cobro ya pasó
            query = query.Where(c => c.Estado == EstadoCheque.Pendiente 
                                  && c.FechaCobro < DateTime.Today);
        }
        else if (Enum.TryParse<EstadoCheque>(estado, out var estadoEnum))
        {
            query = query.Where(c => c.Estado == estadoEnum);
        }
    }

    var resultado = query
        .OrderBy(c =>
            c.Estado == EstadoCheque.Pendiente ? 1 :
            c.Estado == EstadoCheque.Rechazado ? 2 : 3)
        .ThenBy(c => c.FechaCobro)
        .Select(c => new
        {
            cobroChequeID  = c.CobroChequeID,
            cliente        = c.CobroDiferido.Cliente.Nombre,
            montoTotal     = c.CobroDiferido.MontoTotal,
            banco          = c.Banco,
            numeroCheque   = c.NumeroCheque,
            fechaEmision   = c.FechaEmision.ToString("dd/MM/yyyy"),
            fechaCobro     = c.FechaCobro,
            estado         = c.Estado.ToString()
        })
        .ToList();

    return Json(resultado);
}

[HttpGet]
public JsonResult ListadoCobroCuotas(DateTime? fechaDesde, DateTime? fechaHasta,
                                      string? cliente, bool? pagada)
{
    var query = _context.CobrosCuotas
        .Include(c => c.CobroDiferido)
            .ThenInclude(cd => cd.Cliente)
        .AsNoTracking()
        .AsQueryable();

    if (fechaDesde.HasValue)
        query = query.Where(c => c.FechaVencimiento >= fechaDesde.Value);

    if (fechaHasta.HasValue)
        query = query.Where(c => c.FechaVencimiento <= fechaHasta.Value);

    if (!string.IsNullOrWhiteSpace(cliente))
        query = query.Where(c => c.CobroDiferido.Cliente.Nombre.Contains(cliente));

    if (pagada.HasValue)
        query = query.Where(c => c.Pagada == pagada.Value);

    var resultado = query
        .OrderBy(c => c.Pagada ? 2 : 1)
        .ThenBy(c => c.FechaVencimiento)
        .Select(c => new
        {
            c.CobroCuotaID,
            cliente        = c.CobroDiferido.Cliente.Nombre,
            c.NumeroCuota,
            c.MontoCuota,
            fechaVencimiento = c.FechaVencimiento,
            c.Pagada
        })
        .ToList();

    return Json(resultado);
}

    [HttpPost]
    public IActionResult MarcarCobrado(int id)
    {
        var cuota = _context.CobrosCuotas
            .Include(c => c.CobroDiferido)
            .FirstOrDefault(c => c.CobroCuotaID == id);

        if (cuota == null)
            return NotFound();

        if (cuota.Pagada)
            return BadRequest("La cuota ya está pagada.");

        // 🔹 1. Crear el cobro
        var cobro = new Cobro
        {
            ClienteID = cuota.CobroDiferido.ClienteID,
            FechaCobro = DateTime.Now,
            MontoCobro = cuota.MontoCuota,
            FormaCobro = FormaCobro.Pago_en_Cuota // O puedes agregar lógica para determinar la forma de cobro,
        };

        _context.Cobros.Add(cobro);

        // 🔹 2. Marcar cuota como pagada
        cuota.Pagada = true;

        _context.SaveChanges();



        
                    var movimientoCobro = new MovimientoCuentaCorriente
                {
                    ClienteID = cuota.CobroDiferido.ClienteID,
                    Fecha = DateTime.Now,
                    Importe = cuota.MontoCuota,
                    Saldo = _context.MovimientosCuentaCorrientes
                        .Where(m => m.ClienteID == cuota.CobroDiferido.ClienteID)
                        .OrderByDescending(m => m.Fecha)
                        .Select(m => m.Saldo)
                        .FirstOrDefault() - cuota.MontoCuota,
                    TipoMovimiento = TipoMovimiento.Cobro,
                    ReferenciaTipo = "Cobro",
                    ReferenciaID = cobro.CobroID
                };

                _context.MovimientosCuentaCorrientes.Add(movimientoCobro);
                _context.SaveChanges();

        return Ok();
    }



    [HttpPost]
    public IActionResult MarcarCobradoCheque(int id)
    {
        var cobroCheque = _context.CobrosCheques
            .Include(c => c.CobroDiferido)
            .FirstOrDefault(c => c.CobroChequeID == id);

        if (cobroCheque == null)
            return NotFound();

        if (cobroCheque.Estado == EstadoCheque.Cobrado)
            return BadRequest("Ya está cobrado.");

        // 🔹 Cambiar estado
        cobroCheque.Estado = EstadoCheque.Cobrado;

        // 🔹 Crear registro real de cobro
        var cobro = new Cobro
        {
            ClienteID = cobroCheque.CobroDiferido.ClienteID,
            FechaCobro = DateTime.Now,
            MontoCobro = cobroCheque.CobroDiferido.MontoTotal,
            FormaCobro = FormaCobro.Cheque,
        };

        _context.Cobros.Add(cobro);

        _context.SaveChanges();


                    var movimientoCobro = new MovimientoCuentaCorriente
                {
                    ClienteID = cobroCheque.CobroDiferido.ClienteID,
                    Fecha = DateTime.Now,
                    Importe = cobroCheque.CobroDiferido.MontoTotal,
                    Saldo = _context.MovimientosCuentaCorrientes
                        .Where(m => m.ClienteID == cobroCheque.CobroDiferido.ClienteID)
                        .OrderByDescending(m => m.Fecha)
                        .Select(m => m.Saldo)
                        .FirstOrDefault() - cobroCheque.CobroDiferido.MontoTotal,
                    TipoMovimiento = TipoMovimiento.Cobro,
                    ReferenciaTipo = "Cobro",
                    ReferenciaID = cobro.CobroID
                };

                _context.MovimientosCuentaCorrientes.Add(movimientoCobro);
                _context.SaveChanges();

        return Ok();
    }



    [HttpPost]
    public IActionResult MarcarRechazado(int id)
    {
        var cobroCheque = _context.CobrosCheques
            .FirstOrDefault(c => c.CobroChequeID == id);

        if (cobroCheque == null)
            return NotFound();

        if (cobroCheque.Estado == EstadoCheque.Rechazado)
            return BadRequest("Ya está rechazado.");

        cobroCheque.Estado = EstadoCheque.Rechazado;

        _context.SaveChanges();

        return Ok();
    }
    
}
    