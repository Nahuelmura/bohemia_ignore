using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class MovimientoCuentaCorrienteProveedorController : Controller
{
    private readonly ILogger<MovimientoCuentaCorrienteProveedorController> _logger;
    private readonly ApplicationDbContext _context;

    public MovimientoCuentaCorrienteProveedorController(ILogger<MovimientoCuentaCorrienteProveedorController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }


    public IActionResult Index()
    {
        return View();
    }






}