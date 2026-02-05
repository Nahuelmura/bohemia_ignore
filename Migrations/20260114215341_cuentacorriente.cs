using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cuentacorriente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovimientosCuentaCorrientes",
                columns: table => new
                {
                    MovimientoCuentaCorrienteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteID = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Importe = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TipoMovimiento = table.Column<int>(type: "int", nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCuentaCorrientes", x => x.MovimientoCuentaCorrienteID);
                    table.ForeignKey(
                        name: "FK_MovimientosCuentaCorrientes_Clientes_ClienteID",
                        column: x => x.ClienteID,
                        principalTable: "Clientes",
                        principalColumn: "ClienteID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCuentaCorrientes_ClienteID",
                table: "MovimientosCuentaCorrientes",
                column: "ClienteID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimientosCuentaCorrientes");
        }
    }
}
