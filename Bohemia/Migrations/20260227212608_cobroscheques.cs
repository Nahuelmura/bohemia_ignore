using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class cobroscheques : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CobroID",
                table: "CobrosCheques",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CobrosCheques_CobroID",
                table: "CobrosCheques",
                column: "CobroID");

            migrationBuilder.AddForeignKey(
                name: "FK_CobrosCheques_Cobros_CobroID",
                table: "CobrosCheques",
                column: "CobroID",
                principalTable: "Cobros",
                principalColumn: "CobroID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
