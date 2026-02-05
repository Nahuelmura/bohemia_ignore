public class CuentaCorrienteClienteVista
{
    public int ClienteID { get; set; }
    public string ClienteNombre { get; set; } = "";
    public decimal SaldoActual { get; set; }
    public decimal Pendiente { get; set; }
    public decimal Saldo { get; set; }
    public DateTime? UltimoMovimiento { get; set; }
}