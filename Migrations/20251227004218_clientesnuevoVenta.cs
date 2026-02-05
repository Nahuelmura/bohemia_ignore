using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class clientesnuevoVenta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClienteID",
                table: "Ventas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    ClienteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Localidad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefono = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dni_cuil = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.ClienteID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_ClienteID",
                table: "Ventas",
                column: "ClienteID");

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas",
                column: "ClienteID",
                principalTable: "Clientes",
                principalColumn: "ClienteID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Clientes_ClienteID",
                table: "Ventas");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropIndex(
                name: "IX_Ventas_ClienteID",
                table: "Ventas");

            migrationBuilder.DropColumn(
                name: "ClienteID",
                table: "Ventas");
        }
    }
}
