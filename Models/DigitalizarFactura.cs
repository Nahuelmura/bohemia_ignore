using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class DigitalizarFactura
{
    [Key]
    public int DigitalizarFacturaID { get; set; }
    public DateTime FechadeIngreso { get; set; }
    public DateTime FechadeFactura { get; set; }
    public string? Numerodefactura { get; set; }
    public decimal? Precios { get; set; }
    public int ProveedorID { get; set; }
    public string? ProductoID { get; set; }

}