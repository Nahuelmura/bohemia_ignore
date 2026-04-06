using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProyectoBohemia.Migrations;
using ProyectoBohemia.Models;

namespace ProyectoBohemia.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // public DbSet<Persona> Personas { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<Venta> Ventas { get; set; }
    public DbSet<DetalleVenta> DetalleVentas { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Proveedor> Proveedores { get; set; }

    public DbSet<Cobro> Cobros { get; set; }
    public DbSet<CobroDiferido> CobrosDiferidos { get; set; }
    public DbSet<CobroCuota> CobrosCuotas { get; set; }
    public DbSet<CobroCheque> CobrosCheques { get; set; }
    public DbSet<MovimientoCuentaCorriente> MovimientosCuentaCorrientes { get; set; }

    public DbSet<MovimientoCuentaCorrienteProveedor> MovimientosCuentaCorrienteProveedor { get; set; }

    public DbSet<Compra> Compras { get; set; }

    public DbSet<DetalleCompra> DetalleCompras { get; set; }




    // public DbSet<DigitalizarFactura> GetDigitalizarFacturas { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configuración de decimales para Venta
        builder.Entity<Venta>(entity =>
        {
            entity.Property(e => e.Total)
                .HasColumnType("decimal(18,2)");
        });

        // Configuración de decimales para DetalleVenta
        builder.Entity<DetalleVenta>(entity =>
        {
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(18,2)");
        });
    }
}
