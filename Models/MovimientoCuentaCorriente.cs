using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class MovimientoCuentaCorriente

{
    [Key]
    public int MovimientoCuentaCorrienteID { get; set; }
    public int ClienteID { get; set; }
    
    public DateTime Fecha { get; set; }
    public decimal Importe { get; set; }
    public TipoMovimiento TipoMovimiento { get; set; }
    public decimal Saldo { get; set; }
    public string? ReferenciaTipo { get; set; } // "Venta" / "Cobro"
    public int? ReferenciaID { get; set; }      // VentaID o CobroID
    public Cliente? Cliente { get; set; }

}

public enum TipoMovimiento
{
    Venta = 1,
    Cobro = 2,
    Ajuste = 3,
    Devolucion = 4,
    NotaCredito = 5,
    NotaDebito = 6
}


public class MovimientoCuentaCorrienteVista
{
    public int MovimientoCuentaCorrienteID { get; set; }
    public int ClienteID { get; set; }
    public DateTime Fecha { get; set; }
    public string? FechaString { get; set; }

    public decimal Importe { get; set; }
    public TipoMovimiento TipoMovimiento { get; set; }
    public decimal Saldo { get; set; }
    public string? ReferenciaTipo { get; set; }
    public int? ReferenciaID { get; set; }
    public string? ClienteNombre { get; set; }
    public string? TipoMovimientoDescripcion { get; set; }
}