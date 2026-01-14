using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class Cobro
{
    [Key]
    public int CobroID { get; set; }
    public int ClienteID { get; set; }
    public decimal MontoCobro { get; set; }
    public DateTime FechaCobro { get; set; }

    public FormaCobro FormaCobro { get; set; }
    public virtual Cliente Cliente { get; set; }


}

public enum FormaCobro
{
    Efectivo = 1,
    Transferencia = 2,
    TarjetaCredito = 3,
    TarjetaDebito = 4,
    Cheque = 5,
    MercadoPago = 6
}


public class CobroVista
{


    public int CobroID { get; set; }
    public int ClienteID { get; set; }
    public decimal MontoCobro { get; set; }
    public DateTime FechaCobro { get; set; }

    public string? FormaCobro { get; set; }
    public string?  NombreCliente { get; set; }
    public string? LocalidadCliente { get; set; }

    public string? TelefonoCliente { get; set; }

    public string? EmailCliente { get; set; }

    public string? Dni_cuilCliente { get; set; }
}