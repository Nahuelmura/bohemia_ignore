using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class TablaCobros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cobros",
                columns: table => new
                {
                    CobroID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteID = table.Column<int>(type: "int", nullable: false),
                    MontoCobro = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaCobro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FormaCobro = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cobros", x => x.CobroID);
                    table.ForeignKey(
                        name: "FK_Cobros_Clientes_ClienteID",
                        column: x => x.ClienteID,
                        principalTable: "Clientes",
                        principalColumn: "ClienteID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cobros_ClienteID",
                table: "Cobros",
                column: "ClienteID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cobros");
        }
    }
}
