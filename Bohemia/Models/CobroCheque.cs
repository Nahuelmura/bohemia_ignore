using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;


public class CobroCheque
{
    public int CobroChequeID { get; set; }
    public int CobroDiferidoID { get; set; }

    public string Banco { get; set; }
    public string NumeroCheque { get; set; }

    public DateTime FechaEmision { get; set; }
    public DateTime FechaCobro { get; set; }

    public EstadoCheque Estado { get; set; }

    public int? CobroID { get; set; }


    public Cobro Cobro { get; set; }


    public CobroDiferido CobroDiferido { get; set; }
}


public enum EstadoCheque
{
    Pendiente = 1,
    Cobrado = 2,
    Rechazado = 3
}