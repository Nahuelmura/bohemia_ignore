using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

public class CobroDiferido
{
    public int CobroDiferidoID { get; set; }

    public int ClienteID { get; set; }

    public decimal MontoTotal { get; set; }
    public DateTime FechaAlta { get; set; }

    public bool Finalizado { get; set; }

    public Cliente Cliente { get; set; } 

     public ICollection<CobroCuota> Cuotas { get; set; }
    public CobroCheque Cheque { get; set; }
}

