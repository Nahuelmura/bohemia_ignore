using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class Cliente
{
    [Key]
    public int ClienteID { get; set; }

    // public int ProductoID { get; set; }

    // public int VentaID { get; set; }

    public string? Nombre { get; set; }

    public string? Localidad { get; set; }

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public string? Dni_cuil { get; set; }

     public bool Eliminado { get; set; }







}



public class ClienteVista
{
    public int ClienteID { get; set; }


    public string? Nombre { get; set; }

    public string? Localidad { get; set; }

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public string? Dni_cuil { get; set; }


    
     public bool Eliminado { get; set; }

//     public string? ProductoDescripcion { get; set; }
//     public string? ProductoCodigo { get; set; }

//     public decimal ProductoPrecioVenta { get; set; }


//    public decimal VentaTotal { get; set; }

   public Forma_pago VentaForma_pago { get; set; } 

    public virtual ICollection<Venta> Ventas { get; set; }



}