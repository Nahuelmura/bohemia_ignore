using System.ComponentModel.DataAnnotations;
using System.Globalization;


namespace ProyectoBohemia.Models;



public class Venta

{
   [Key]
   public int VentaID { get; set; }

    public int? ClienteID { get; set; }
   //    public int PersonaID { get; set; }
   public DateTime Fecha_Venta { get; set; }
   public decimal Total { get; set; }

   public Forma_pago Forma_pago { get; set; } // es la forma con el que el local cobra la

   public string? UsuarioID { get; set; }
   public ICollection<DetalleVenta> DetalleVentas { get; set; }

       public virtual Cliente Cliente { get; set; }
   //  public ICollection<Cliente> Clientes { get; set; }

}


public enum Forma_pago
{
   Contado = 1,

   Lista_financiacion,

   Descuento_10,
   Descuento_20,
   Descuento_30,
   Descuento_40,
   Descuento_50,




}

public class VentaVistaInforme

{

   public int VentaID { get; set; }
   public DateTime Fecha_Venta { get; set; }  // Mantener la fecha original

   public string Fecha_Ventas { get; set; }
   public string Fecha_VentaStr => Fecha_Venta.ToString("dd/MM/yyyy HH:mm", new CultureInfo("es-AR"));
   public decimal Total { get; set; }
   public decimal GananciaTotal { get; set; }

   public int NumeroVenta { get; set; }


   public string? UsuarioID { get; set; }

   public string? EmailUsuario { get; set; }

   public string? Observacion { get; set; }

   public string? Codigo { get; set; }

   public Forma_pago Forma_pago { get; set; }

   public  string? Forma_pagostring { get; set; }

   public List<VistadetalleVenta> ListadoDetalle { get; set; }



}