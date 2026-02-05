using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class CambiosTablaProductosPreciosVenta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrecioVenta",
                table: "Productos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioVenta",
                table: "Productos");
        }
    }
}
