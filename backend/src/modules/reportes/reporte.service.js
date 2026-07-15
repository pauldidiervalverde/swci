import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export async function generarReporteDiario(
  fechaInicioStr,
  fechaFinStr,
  tiendaId,
) {
  let inicio;
  let fin;

  // Si el string ya incluye la 'T', significa que el frontend mandó el bloque UTC exacto
  if (fechaInicioStr.includes("T")) {
    inicio = new Date(fechaInicioStr);
    fin = new Date(fechaFinStr);
  } else {
    // Si mandan solo '2026-07-09', aplicamos el fallback manual de todo el día en UTC plano
    inicio = new Date(`${fechaInicioStr}T00:00:00.000Z`);
    fin = new Date(`${fechaFinStr}T23:59:59.999Z`);
  }

  // 1. Ejecutar consultas concurrentes a la Base de Datos
  const [ventas, movimientosStock] = await Promise.all([
    // Consulta A: Cabeceras y detalles de ventas comerciales
    prisma.venta.findMany({
      where: {
        tiendaId: tiendaId,
        fecha: { gte: inicio, lte: fin },
      },
      include: {
        tipoPago: true,
        cliente: {
          select: { nombre: true, telefono: true },
        },
        ingresos: true,
        detalles: {
          include: {
            producto: {
              include: { marca: true },
            },
          },
        },
      },
      orderBy: { fecha: "asc" },
    }),

    // Consulta B: Movimientos de inventario asociados a productos de la tienda en ese rango
    prisma.movimientoInventario.findMany({
      where: {
        fecha: { gte: inicio, lte: fin },
        producto: { tiendaId: tiendaId }, // Filtrado indirecto por la sucursal del producto
      },
      include: {
        tipoMovimiento: true, // Trae los datos como "nombre", "naturaleza"
      },
    }),
  ]);

  // 2. Acumuladores de finanzas y ventas
  let granTotalVendido = new Prisma.Decimal(0);
  let totalDescuentos = new Prisma.Decimal(0);
  let cantidadVentasActivas = 0;
  let cantidadVentasAnuladas = 0;

  const mapaTiposPago = {};
  const mapaVentasPorDia = {};
  const mapaProductosMasVendidos = {};
  const mapaMarcasMasVendidas = {};

  // 3. Procesamiento del bloque comercial (Ventas)
  for (const v of ventas) {
    if (!v.estado) {
      cantidadVentasAnuladas++;
      continue; // Las anuladas se listan pero quedan fuera de los indicadores financieros
    }

    cantidadVentasActivas++;
    granTotalVendido = granTotalVendido.plus(v.total);

    // Agrupación por Tipo de Pago (Torta)
    const tipoPagoNombre = v.tipoPago.nombre;
    mapaTiposPago[tipoPagoNombre] = (
      mapaTiposPago[tipoPagoNombre] || new Prisma.Decimal(0)
    ).plus(v.total);

    // Agrupación Evolutiva por Día (Líneas o Barras de tendencia)
    const diaClave = v.fecha.toISOString().split("T")[0];
    mapaVentasPorDia[diaClave] = (
      mapaVentasPorDia[diaClave] || new Prisma.Decimal(0)
    ).plus(v.total);

    // Procesar los artículos vendidos en el detalle
    for (const d of v.detalles) {
      totalDescuentos = totalDescuentos.plus(d.descuento.mul(d.cantidad));

      // Top Productos
      const prodDesc = d.producto.descripcion;
      if (!mapaProductosMasVendidos[prodDesc]) {
        mapaProductosMasVendidos[prodDesc] = {
          cantidad: 0,
          total: new Prisma.Decimal(0),
        };
      }
      mapaProductosMasVendidos[prodDesc].cantidad += d.cantidad;
      mapaProductosMasVendidos[prodDesc].total = mapaProductosMasVendidos[
        prodDesc
      ].total.plus(d.subtotal);

      // Top Marcas (¡Añadido!)
      const marcaNombre = d.producto.marca?.nombre || "Sin Marca";
      if (!mapaMarcasMasVendidas[marcaNombre]) {
        mapaMarcasMasVendidas[marcaNombre] = {
          cantidad: 0,
          total: new Prisma.Decimal(0),
        };
      }
      mapaMarcasMasVendidas[marcaNombre].cantidad += d.cantidad;
      mapaMarcasMasVendidas[marcaNombre].total = mapaMarcasMasVendidas[
        marcaNombre
      ].total.plus(d.subtotal);
    }
  }

  // 4. Procesamiento de Salidas de Stock No Comerciales
  // Clasificamos basándonos en tu Seed de base de datos
  const auditoriaStockFisico = {
    unidadesVendidas: 0,
    unidadesPorAjusteCambio: 0,
    unidadesPorPromocion: 0,
    unidadesPorRegalo: 0,
    unidadesPorIntercambio: 0,
  };

  for (const mov of movimientosStock) {
    const nombreTipo = mov.tipoMovimiento?.nombre;

    switch (nombreTipo) {
      case "VENTA":
        auditoriaStockFisico.unidadesVendidas += mov.cantidad;
        break;
      case "AJUSTE":
        auditoriaStockFisico.unidadesPorAjusteCambio += mov.cantidad;
        break;
      case "PROMOCION":
        auditoriaStockFisico.unidadesPorPromocion += mov.cantidad;
        break;
      case "REGALO":
        auditoriaStockFisico.unidadesPorRegalo += mov.cantidad;
        break;
      case "INTERCAMBIO":
        auditoriaStockFisico.unidadesPorIntercambio += mov.cantidad;
        break;
      default:
        break;
    }
  }

  // 5. Estructurar colecciones limpias para el Frontend
  const totalesPorTipoPago = Object.entries(mapaTiposPago).map(
    ([tipo, total]) => ({
      tipo,
      total: Number(total),
    }),
  );

  const ventasPorDia = Object.entries(mapaVentasPorDia).map(
    ([fecha, total]) => ({
      fecha,
      total: Number(total),
    }),
  );

  const topProductos = Object.entries(mapaProductosMasVendidos)
    .map(([nombre, info]) => ({
      nombre,
      cantidad: info.cantidad,
      totalRecaudado: Number(info.total),
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const topMarcas = Object.entries(mapaMarcasMasVendidas)
    .map(([marca, info]) => ({
      marca,
      cantidad: info.cantidad,
      totalRecaudado: Number(info.total),
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return {
    metadatos: {
      fechaInicio: fechaInicioStr,
      fechaFin: fechaFinStr,
      tiendaId,
    },
    resumenMonetario: {
      granTotalVendido: Number(granTotalVendido),
      totalDescuentosAplicados: Number(totalDescuentos),
      cantidadVentasActivas,
      cantidadVentasAnuladas,
    },
    resumenSalidasInventario: auditoriaStockFisico, // Datos masivos de control de almacén
    graficos: {
      totalesPorTipoPago,
      ventasPorDia,
      topProductos,
      topMarcas,
    },
    ventas, // Listado crudo completo con relaciones
  };
}
