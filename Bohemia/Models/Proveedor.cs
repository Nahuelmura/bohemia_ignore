using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ProyectoBohemia.Models;

public class Proveedor
{
    [Key]
    public int ProveedorID { get; set; }

    public string? NombreProveedor { get; set; }

    public string? Localidad { get; set; }

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public string? Cuit { get; set; }
    
    public bool Activo { get; set; } = false;

    public virtual ICollection<Compra> Compras { get; set; }
    public DbSet<MovimientoCuentaCorriente> MovimientosCuentaCorrientes { get; set; }

    public DbSet<MovimientoCuentaCorrienteProveedor> MovimientosCuentaCorrienteProveedor { get; set; }
}

public class ProveedorVista
{
    public int ProveedorID { get; set; }
    public string? NombreProveedor { get; set; }
    public string? Localidad { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Cuit { get; set; }
    public bool Activo { get; set; }
}