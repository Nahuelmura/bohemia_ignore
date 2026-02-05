using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Data;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Controllers;

public class ProveedorController : Controller
{
    private readonly ILogger<ProveedorController> _logger;
    private ApplicationDbContext _context;

    public ProveedorController(
        ILogger<ProveedorController> logger,
        ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult Index()
    {
        return View();
    }

        public JsonResult ListadoProveedores(string nombre)
        {
            var proveedores = _context.Proveedores.AsQueryable();

                    if (!string.IsNullOrEmpty(nombre))
        {
            proveedores = proveedores.Where(c => c.NombreProveedor.StartsWith(nombre));
        }


    var proveedorMostrar = proveedores.Select(p => new ProveedorVista
            {
                ProveedorID = p.ProveedorID,
            
                NombreProveedor = p.NombreProveedor,
                Localidad = p.Localidad,
                Telefono = p.Telefono,
                Email = p.Email,
                Cuit = p.Cuit,
                Activo = p.Activo,
    
            }).ToList();
    
            return Json(new
            {
                proveedores = proveedorMostrar
            });
        }


        public JsonResult ObtenerProveedorPorID(int proveedorID)
    {
        var proveedor = _context.Proveedores
            .FirstOrDefault(p => p.ProveedorID == proveedorID);
        if (proveedor == null)
        {
            return Json(new
            {
                success = false,
                message = "Proveedor no encontrado."
            });
        }

        return Json(new
        {
            success = true,
            proveedor = new ProveedorVista
            {
                ProveedorID = proveedor.ProveedorID,
                NombreProveedor = proveedor.NombreProveedor,
                Localidad = proveedor.Localidad,
                Telefono = proveedor.Telefono,
                Email = proveedor.Email,
                Cuit = proveedor.Cuit,
                Activo = proveedor.Activo,
            }
        });

    }

    

    public JsonResult GuardarProveedor(Proveedor proveedor)
{
    // 🔎 Validar EMAIL duplicado
    bool emailExiste = _context.Proveedores.Any(p =>
        p.Email == proveedor.Email &&
        p.ProveedorID != proveedor.ProveedorID
    );

    if (emailExiste)
    {
        return Json(new
        {
            success = false,
            message = "El email ya está registrado en otro proveedor."
        });
    }

    // 🔎 Validar CUIT duplicado
    bool cuitExiste = _context.Proveedores.Any(p =>
        p.Cuit == proveedor.Cuit &&
        p.ProveedorID != proveedor.ProveedorID
    );

    if (cuitExiste)
    {
        return Json(new
        {
            success = false,
            message = "El CUIT ya está registrado en otro proveedor."
        });
    }

    // Alta
    if (proveedor.ProveedorID == 0)
    {
        proveedor.Activo = true;
        _context.Proveedores.Add(proveedor);
    }
    // Edición
    else
    {
        _context.Proveedores.Update(proveedor);
    }

    _context.SaveChanges();

    return Json(new
    {
        success = true,
        message = "Proveedor guardado correctamente."
    });
}



    public JsonResult DesactivarProveedor(int proveedorID, int estado)
    {
        var proveedor = _context.Proveedores.Find(proveedorID);
        if (proveedor == null)
        {
            return Json(new
            {
                success = false,
                message = "Proveedor no encontrado."
            });
        }

        proveedor.Activo = !proveedor.Activo;
        _context.SaveChanges();

            return Json(new
    {
        success = true,
        estadoActual = proveedor.Activo,
        message = proveedor.Activo
            ? "Proveedor activado correctamente."
            : "Proveedor desactivado correctamente."
    });
    }
}