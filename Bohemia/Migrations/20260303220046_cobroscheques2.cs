using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cobroscheques2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClienteID",
                table: "CobrosCuotas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClienteID",
                table: "CobrosCheques",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CobrosDiferidos_ClienteID",
                table: "CobrosDiferidos",
                column: "ClienteID");

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCuotas_ClienteID",
                table: "CobrosCuotas",
                column: "ClienteID");

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCheques_ClienteID",
                table: "CobrosCheques",
                column: "ClienteID");

            migrationBuilder.AddForeignKey(
                name: "FK_CobrosCheques_Clientes_ClienteID",
                table: "CobrosCheques",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID");

            migrationBuilder.AddForeignKey(
                name: "FK_CobrosCuotas_Clientes_ClienteID",
                table: "CobrosCuotas",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID");

            migrationBuilder.AddForeignKey(
                name: "FK_CobrosDiferidos_Clientes_ClienteID",
                table: "CobrosDiferidos",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CobrosCheques_Clientes_ClienteID",
                table: "CobrosCheques");

            migrationBuilder.DropForeignKey(
                name: "FK_CobrosCuotas_Clientes_ClienteID",
                table: "CobrosCuotas");

            migrationBuilder.DropForeignKey(
                name: "FK_CobrosDiferidos_Clientes_ClienteID",
                table: "CobrosDiferidos");

            migrationBuilder.DropIndex(
                name: "IX_CobrosDiferidos_ClienteID",
                table: "CobrosDiferidos");

            migrationBuilder.DropIndex(
                name: "IX_CobrosCuotas_ClienteID",
                table: "CobrosCuotas");

            migrationBuilder.DropIndex(
                name: "IX_CobrosCheques_ClienteID",
                table: "CobrosCheques");

            migrationBuilder.DropColumn(
                name: "ClienteID",
                table: "CobrosCuotas");

            migrationBuilder.DropColumn(
                name: "ClienteID",
                table: "CobrosCheques");
        }
    }
}
