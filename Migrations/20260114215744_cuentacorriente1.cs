using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cuentacorriente1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReferenciaID",
                table: "MovimientosCuentaCorrientes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferenciaTipo",
                table: "MovimientosCuentaCorrientes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReferenciaID",
                table: "MovimientosCuentaCorrientes");

            migrationBuilder.DropColumn(
                name: "ReferenciaTipo",
                table: "MovimientosCuentaCorrientes");
        }
    }
}
