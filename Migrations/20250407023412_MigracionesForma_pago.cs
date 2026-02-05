using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class MigracionesForma_pago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Forma_pago",
                table: "Ventas",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Forma_pago",
                table: "Ventas");
        }
    }
}
