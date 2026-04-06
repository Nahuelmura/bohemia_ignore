using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class MovimientoCuentaCorrienteProveedor
{
    [Key]
    public int MovimientoID { get; set; }

    public int ProveedorID { get; set; }

    public DateTime Fecha { get; set; }

    public decimal Importe { get; set; }

    public TipoMovimientoProveedor TipoMovimiento { get; set; }

    public decimal Saldo { get; set; }

    public string? ReferenciaTipo { get; set; } // "Compra", "Pago", "NotaCredito", etc.
    public int? ReferenciaID { get; set; }      // ID del documento relacionado

    public virtual Proveedor? Proveedor { get; set; }
}

public enum TipoMovimientoProveedor
{
    Compra = 1,        //  Aumenta deuda
    Pago = 2,          // Disminuye deuda
    NotaCredito = 3,   //  Disminuye deuda
    NotaDebito = 4,    //  Aumenta deuda
    Ajuste = 5         //  según caso
}


public class MovimientoCuentaCorrienteProveedorViewModel
{
    public int MovimientoID { get; set; }
    public int ProveedorID { get; set; }
    public string ProveedorNombre { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Importe { get; set; }
    public TipoMovimientoProveedor TipoMovimiento { get; set; }
    public decimal Saldo { get; set; }
    public string? ReferenciaTipo { get; set; }
    public int? ReferenciaID { get; set; }
}