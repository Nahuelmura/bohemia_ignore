using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;


public class CobroCuota
{
    public int CobroCuotaID { get; set; }
    public int CobroDiferidoID { get; set; }

    public int NumeroCuota { get; set; }
    public decimal MontoCuota { get; set; }
    public DateTime FechaVencimiento { get; set; }

    public bool Pagada { get; set; }
    public int? CobroID { get; set; }
    
    public Cobro Cobro { get; set; }
    public CobroDiferido CobroDiferido { get; set; }
}