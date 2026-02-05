using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class clientesCambiosTelefono : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas");

            migrationBuilder.AlterColumn<int>(
                name: "ClienteID",
                table: "Ventas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<bool>(
                name: "Eliminado",
                table: "Clientes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas");

            migrationBuilder.DropColumn(
                name: "Eliminado",
                table: "Clientes");

            migrationBuilder.AlterColumn<int>(
                name: "ClienteID",
                table: "Ventas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Telefono",
                table: "Clientes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
