using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBohemia.Migrations
{
    /// <inheritdoc />
    public partial class compradetallecompra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProveedorID",
                table: "MovimientosCuentaCorrientes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Compras",
                columns: table => new
                {
                    CompraID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProveedorID = table.Column<int>(type: "int", nullable: false),
                    Usuario = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MontoCompra = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FacturaNumero = table.Column<int>(type: "int", nullable: false),
                    FechaCompra = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoCompra = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compras", x => x.CompraID);
                    table.ForeignKey(
                        name: "FK_Compras_Proveedores_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Proveedores",
                        principalColumn: "ProveedorID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetalleCompras",
                columns: table => new
                {
                    DetalleCompraID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductoID = table.Column<int>(type: "int", nullable: false),
                    CompraID = table.Column<int>(type: "int", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetalleCompras", x => x.DetalleCompraID);
                    table.ForeignKey(
                        name: "FK_DetalleCompras_Compras_CompraID",
                        column: x => x.CompraID,
                        principalTable: "Compras",
                        principalColumn: "CompraID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DetalleCompras_Productos_ProductoID",
                        column: x => x.ProductoID,
                        principalTable: "Productos",
                        principalColumn: "ProductoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCuentaCorrientes_ProveedorID",
                table: "MovimientosCuentaCorrientes",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_Compras_ProveedorID",
                table: "Compras",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_DetalleCompras_CompraID",
                table: "DetalleCompras",
                column: "CompraID");

            migrationBuilder.CreateIndex(
                name: "IX_DetalleCompras_ProductoID",
                table: "DetalleCompras",
                column: "ProductoID");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCuentaCorrientes_Proveedores_ProveedorID",
                table: "MovimientosCuentaCorrientes",
                column: "ProveedorID",
                principalTable: "Proveedores",
                principalColumn: "ProveedorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCuentaCorrientes_Proveedores_ProveedorID",
                table: "MovimientosCuentaCorrientes");

            migrationBuilder.DropTable(
                name: "DetalleCompras");

            migrationBuilder.DropTable(
                name: "Compras");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCuentaCorrientes_ProveedorID",
                table: "MovimientosCuentaCorrientes");

            migrationBuilder.DropColumn(
                name: "ProveedorID",
                table: "MovimientosCuentaCorrientes");
        }
    }
}
