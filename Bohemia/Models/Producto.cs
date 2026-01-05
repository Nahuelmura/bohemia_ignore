using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class Producto
{
    [Key]
    public int ProductoID { get; set; }
    public string? Codigo { get; set; }
    public Descripcion Descripcion { get; set; }

    public string? Observacion { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioCosto { get; set; }

    public decimal PrecioVenta { get; set; }

    public DateTime FechaIngreso { get; set; }

    public bool Eliminado { get; set; }
    public virtual ICollection<DetalleVenta> DetalleVentas { get; set; }
    //   public ICollection<Cliente> Clientes { get; set; }

}
public class ProductoVista
{

    public int ProductoID { get; set; }
    public string? Codigo { get; set; }
    public Descripcion Descripcion { get; set; }

    public string? Observacion { get; set; }
    public string? Descripcionstring { get; set; }

    public int Cantidad { get; set; }
    public decimal PrecioCosto { get; set; }


    public decimal PrecioVenta { get; set; }

    public int CantidadProducto { get; set; }

    public decimal TotalPrecioCosto { get; set; }



    public bool Eliminado { get; set; }


}


public class ProductoVistaInforme
{

    public int ProductoID { get; set; }
    public string? Codigo { get; set; }
    public Descripcion Descripcion { get; set; }


    public string? Descripcionstring { get; set; }

    public int Cantidad { get; set; }
    public decimal PrecioCosto { get; set; }

    public bool Eliminado { get; set; }

    public ICollection<DetalleVenta> DetalleVentas { get; set; }


}




public enum Descripcion
{

    // Acesorios
    Acesorios_Varios = 1,

    Accesorios_Medias,
    Accesorios_Gorros,
    Accesorios_Relojes,
    Accesorios_Riñoneras,
    Accesorios_Bandoleras,
    Accesorios_Cintos,
    Accesorios_Billeteras,
    Accesorios_Pulseras_Collares,
    Accesorios_Calzoncillos,
    Accesorios_Perfumes,
    Accesorios_Gorras,
    Accesorios_Mochilas,

    // Zapatillas,
    Zapatillas,
    // Remeras,
    Remeras,

    // Camisas,

    Camisa_manga_larga_lisa,
    Camisa_manga_larga_estampada_rayada,
    Camisa_manga_larga_lino,
    Camisa_manga_larga_cuadriculada,
    Camisa_manga_corta_lisa,
    Camisa_manga_corta_estampada_rayada,
    Camisa_manga_corta_lino,
    Camisa_manga_corta_cuadriculada,
    Camisa_manga_corta_tejida,


    // Pantalones
    Jeans_cargo,
    Jeans_mom,
    Jeans_chupín,
    Pantalón_corte_chino,
    Jeans_clásicos,
    Jeans_Baggy,
    Pantalón_largo_de_lino,
    Pantalón_largo_gabardina_chupín,
    Pantalón_largo_de_algodón,

    // Camperas
    Campera_de_cuero,
    Campera_de_jeans,
    Campera_de_gabardina,
    Campera_inflable,
    Campera_de_algodón,


    // Bermudas
    Bermuda_de_lino,
    Bermuda_jeans_mom,
    Bermuda_cargo,
    Bermuda_chupín,
    Bermuda_corte_chino,
    Bermuda_de_lona,
    Mayas,

    // Buzos
    Buzo,
    // Sweter
    Sweter,

    //pullover
    pullover




}