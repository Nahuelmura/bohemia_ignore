using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class VentaReversion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VentaOriginalID",
                table: "Ventas",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_VentaOriginalID",
                table: "Ventas",
                column: "VentaOriginalID");

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Ventas_VentaOriginalID",
                table: "Ventas",
                column: "VentaOriginalID",
                principalTable: "Ventas",
                principalColumn: "VentaID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Ventas_VentaOriginalID",
                table: "Ventas");

            migrationBuilder.DropIndex(
                name: "IX_Ventas_VentaOriginalID",
                table: "Ventas");

            migrationBuilder.DropColumn(
                name: "VentaOriginalID",
                table: "Ventas");
        }
    }
}
