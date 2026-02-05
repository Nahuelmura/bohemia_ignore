using System.ComponentModel.DataAnnotations;

namespace ProyectoBohemia.Models;

    public class Persona
    {
        [Key]
        public int PersonaID { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Telefono { get; set; }
        public string? Domicilio { get; set; }
        public string? Localidad { get; set; }
        public string? Dni {get; set; }
        public int Mail { get; set; }
        public Ocupacion Roll {get; set;}

        

        
    }

    public enum Ocupacion
    {
        VENDEDOR = 1,
        CLIENTE,
    }
