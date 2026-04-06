using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cobroscheques1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CobroID",
                table: "CobrosCheques",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCheques_CobroID",
                table: "CobrosCheques",
                column: "CobroID");

            migrationBuilder.AddForeignKey(
                name: "FK_CobrosCheques_Cobros_CobroID",
                table: "CobrosCheques",
                column: "CobroID",
                principalTable: "Cobros",
                principalColumn: "CobroID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CobrosCheques_Cobros_CobroID",
                table: "CobrosCheques");

            migrationBuilder.DropIndex(
                name: "IX_CobrosCheques_CobroID",
                table: "CobrosCheques");

            migrationBuilder.DropColumn(
                name: "CobroID",
                table: "CobrosCheques");
        }
    }
}
