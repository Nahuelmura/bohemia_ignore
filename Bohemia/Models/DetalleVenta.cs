using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class DetalleVenta
{
    [Key]
    public int DetalleVentaID { get; set; }
    public int VentaID { get; set; }
    public int ProductoID { get; set; }
    // public int PersonaID { get; set; }

    public string? UsuarioID { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }

 
    public virtual Producto Productos { get; set; }
    public virtual Venta Ventas { get; set; }
}




public class DetalleVentaVista
{
    public int DetalleVentaID { get; set; }
    public int VentaID { get; set; }
    public int ProductoID { get; set; }

    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public virtual Producto Productos { get; set; }
    public virtual Venta Ventas { get; set; }


    public string? CodigoProducto { get; set; }

    public string? Observacion { get; set; }


    public Descripcion Descripcion { get; set; }

    public int CantidadProducto { get; set; }
    public decimal PrecioCostoProducto { get; set; }

        public decimal PrecioVentaProducto { get; set; }

    public string? DescripcionProducto { get; set; }


    public DateTime Fecha_Venta { get; set; }

    public string? Fecha_Venta_string { get; set; }
    public decimal Total { get; set; }

    public Forma_pago Forma_pago { get; set; }

    public string? Forma_pagostring { get; set; }

}



public class VistadetalleVenta
{

    public int VentaID { get; set; }
    public int DetalleVentaID { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public virtual Producto Productos { get; set; }
    public virtual Venta Ventas { get; set; }
    public string? CodigoProducto { get; set; }
    public Descripcion Descripcion { get; set; }
    public int CantidadProducto { get; set; }
    public decimal PrecioCostoProducto { get; set; }
    public decimal PrecioVentaProducto { get; set; }
    public string? DescripcionProducto { get; set; }
    public decimal? TotalVenta { get; set; }


    public decimal? GananciaProducto { get; set; }



    public string? UsuarioID { get; set; }

    public string? EmailUsuario { get; set; }

    public Forma_pago Forma_pago { get; set; }

    public string? Forma_pagostring { get; set; }




}
