using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class CambiosTablaProductos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Descripcion",
                table: "Productos",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Eliminado",
                table: "Productos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Eliminado",
                table: "Productos");

            migrationBuilder.AlterColumn<string>(
                name: "Descripcion",
                table: "Productos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
