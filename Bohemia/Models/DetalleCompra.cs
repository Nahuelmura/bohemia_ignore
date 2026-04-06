using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class DetalleCompra
{
    [Key]
    public int DetalleCompraID { get; set; }

    public int ProductoID { get; set; }

    public int CompraID { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public virtual Producto Productos { get; set; }

    public virtual Compra Compras { get; set; }
    


}


public class DetalleCompraVista
{

    public int ProveedorID { get; set; }
    public int DetalleCompraID { get; set; }

    public int ProductoID { get; set; }

    public int CompraID { get; set; }

//detalle venta
    public int CantidadCompra { get; set; }

    public decimal PrecioUnitarioCompra { get; set; }



    //Compra

    public string? NombreProveedor { get; set; }
    public decimal MontoCompra { get; set; }
    public string? ObservacionCompra { get; set; }
    public int FacturaNumeroCompra { get; set; }
    public DateTime FechaCompra { get; set; }
    public string? TipoCompra { get; set; }

    //producto 

    public string? CodigoProducto { get; set; }

    public decimal PrecioCostoProducto { get; set; }

    public decimal PrecioVentaProducto { get; set; }

    public DateTime FechaIngresoProducto { get; set; }







}

