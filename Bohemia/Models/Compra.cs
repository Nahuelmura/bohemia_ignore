using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class Compra
{
    [Key]
    public int CompraID { get; set; }

    public int ProveedorID { get; set; }
    public string? Usuario { get; set; }
    public decimal MontoCompra { get; set; }
    public string? Observacion { get; set; }
    public int FacturaNumero { get; set; }
    public DateTime FechaCompra { get; set; }
    public TipoCompra TipoCompra { get; set; }


    public virtual Proveedor Proveedor { get; set; }

}

public enum TipoCompra
{
    Insumo = 1,
    Mercaderia,
    Gasto
}


public class CompraVista
{
    [Key]
    public int CompraID { get; set; }

    public int ProveedorID { get; set; }
    public string? Usuario { get; set; }
    public decimal MontoCompra { get; set; }
    public string? Observacion { get; set; }
    public int FacturaNumero { get; set; }
    public DateTime FechaCompra { get; set; }
    public string? TipoCompra { get; set; }

    public string? NombreProveedor {get; set; }


    public virtual Proveedor Proveedor { get; set; }

}



public class DetalleDTO
{
    public int productoID { get; set; }
    public int cantidad { get; set; }
    public decimal precioUnitario { get; set; }
}

public class CompraDTO
{
    public int proveedorID { get; set; }
    public int facturaNumero { get; set; }
    public decimal montoCompra { get; set; }
    public string observacion { get; set; }
    public DateTime fechaCompra { get; set; }
    public int tipoCompra { get; set; }

    public List<DetalleDTO> detalles { get; set; }
}