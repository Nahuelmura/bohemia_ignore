using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cobrosDiferidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CobrosDiferidos",
                columns: table => new
                {
                    CobroDiferidoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteID = table.Column<int>(type: "int", nullable: false),
                    MontoTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaAlta = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Finalizado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CobrosDiferidos", x => x.CobroDiferidoID);
                });

            migrationBuilder.CreateTable(
                name: "CobrosCheques",
                columns: table => new
                {
                    CobroChequeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CobroDiferidoID = table.Column<int>(type: "int", nullable: false),
                    Banco = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumeroCheque = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCobro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    CobroID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CobrosCheques", x => x.CobroChequeID);
                    table.ForeignKey(
                        name: "FK_CobrosCheques_CobrosDiferidos_CobroDiferidoID",
                        column: x => x.CobroDiferidoID,
                        principalTable: "CobrosDiferidos",
                        principalColumn: "CobroDiferidoID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CobrosCheques_Cobros_CobroID",
                        column: x => x.CobroID,
                        principalTable: "Cobros",
                        principalColumn: "CobroID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CobrosCuotas",
                columns: table => new
                {
                    CobroCuotaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CobroDiferidoID = table.Column<int>(type: "int", nullable: false),
                    NumeroCuota = table.Column<int>(type: "int", nullable: false),
                    MontoCuota = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Pagada = table.Column<bool>(type: "bit", nullable: false),
                    CobroID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CobrosCuotas", x => x.CobroCuotaID);
                    table.ForeignKey(
                        name: "FK_CobrosCuotas_CobrosDiferidos_CobroDiferidoID",
                        column: x => x.CobroDiferidoID,
                        principalTable: "CobrosDiferidos",
                        principalColumn: "CobroDiferidoID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CobrosCuotas_Cobros_CobroID",
                        column: x => x.CobroID,
                        principalTable: "Cobros",
                        principalColumn: "CobroID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCheques_CobroDiferidoID",
                table: "CobrosCheques",
                column: "CobroDiferidoID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCheques_CobroID",
                table: "CobrosCheques",
                column: "CobroID");

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCuotas_CobroDiferidoID",
                table: "CobrosCuotas",
                column: "CobroDiferidoID");

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCuotas_CobroID",
                table: "CobrosCuotas",
                column: "CobroID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CobrosCheques");

            migrationBuilder.DropTable(
                name: "CobrosCuotas");

            migrationBuilder.DropTable(
                name: "CobrosDiferidos");
        }
    }
}
