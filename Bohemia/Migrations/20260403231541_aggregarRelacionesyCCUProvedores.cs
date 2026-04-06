using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class aggregarRelacionesyCCUProvedores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovimientosCuentaCorrienteProveedor",
                columns: table => new
                {
                    MovimientoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProveedorID = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Importe = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TipoMovimiento = table.Column<int>(type: "int", nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReferenciaTipo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReferenciaID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCuentaCorrienteProveedor", x => x.MovimientoID);
                    table.ForeignKey(
                        name: "FK_MovimientosCuentaCorrienteProveedor_Proveedores_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Proveedores",
                        principalColumn: "ProveedorID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCuentaCorrienteProveedor_ProveedorID",
                table: "MovimientosCuentaCorrienteProveedor",
                column: "ProveedorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimientosCuentaCorrienteProveedor");
        }
    }
}
