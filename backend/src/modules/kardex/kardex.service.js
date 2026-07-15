import { prisma } from "../../config/prisma.js";
/* ==========================================================
 * KARDEX GENERAL
 * ========================================================== */
// ==>> REVISAR ANTE ALGUN FALLO LA BD LA TABAL TIPOS DE MOVIMIENTOS Y EL SEED
const TIPOS_MOVIMIENTO = {
  INGRESO: 1,
  VENTA: 2,
  AJUSTE: 3,
  DEVOLUCION: 4,
  PROMOCION: 5,
  REGALO: 6,
  INTERCAMBIO: 7,
};
/* ==========================================================
 * Construye dinámicamente el WHERE para el Kardex General.
 * ========================================================== */
function construirWhere(filtros, tiendaId) {
  const {
    fechaInicio,
    fechaFin,
    categoriaId,
    marcaId,
    tipoMovimientoId,
    search,
  } = filtros;
  const where = {
    producto: {
      tiendaId,
    },
  };
  // Rango de fechas
  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) {
      where.fecha.gte = new Date(fechaInicio);
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      where.fecha.lte = fin;
    }
  }
  // Filtro por categoría
  if (categoriaId) {
    where.producto.categoriaId = Number(categoriaId);
  }
  // Filtro por marca
  if (marcaId) {
    where.producto.marcaId = Number(marcaId);
  }
  // Filtro por tipo de movimiento
  if (tipoMovimientoId) {
    where.tipoMovimientoId = Number(tipoMovimientoId);
  }
  // Búsqueda general
  if (search?.trim()) {
    where.OR = [
      {
        producto: {
          sku: {
            contains: search,
          },
        },
      },
      {
        producto: {
          codigo: {
            contains: search,
          },
        },
      },
      {
        producto: {
          descripcion: {
            contains: search,
          },
        },
      },
      {
        referencia: {
          contains: search,
        },
      },
      {
        observacion: {
          contains: search,
        },
      },
    ];
  }
  return where;
}
/* ==========================================================
 * Obtiene los movimientos generales de inventario.
 *
 * Esta consulta es la base del módulo Auditoría.
 *
 * Retorna todos los movimientos de una tienda
 * aplicando los filtros recibidos.
 * ========================================================== */
async function obtenerMovimientosGeneral(where) {
  return await prisma.movimientoInventario.findMany({
    where,
    select: {
      id: true,
      fecha: true,
      cantidad: true,
      stockAnterior: true,
      stockNuevo: true,
      referenciaId: true,
      referencia: true,
      observacion: true,
      // Tipo de movimiento
      tipoMovimiento: {
        select: {
          id: true,
          nombre: true,
          abreviatura: true,
          naturaleza: true,
        },
      },
      // Usuario que realizó el movimiento
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
      // Producto afectado
      producto: {
        select: {
          id: true,
          sku: true,
          codigo: true,
          descripcion: true,
          precioVenta: true,
          color: true,
          tallas: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
            },
          },
          marca: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        fecha: "asc",
      },
      {
        id: "asc",
      },
    ],
  });
}

/* ==========================================================
 * Obtiene la información principal del producto.
 * ========================================================== */
async function obtenerProducto(productoId, tiendaId) {
  const producto = await prisma.producto.findFirst({
    where: {
      id: productoId,
      tiendaId,
    },
    include: {
      categoria: {
        select: {
          id: true,
          nombre: true,
        },
      },
      marca: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });
  if (!producto) {
    throw new Error("El producto no existe.");
  }
  return producto;
}
/* ==========================================================
 * Obtiene todos los movimientos del producto.
 * Siempre en orden cronológico ASCENDENTE.
 * ========================================================== */
async function obtenerMovimientos(productoId, tiendaId) {
  return await prisma.movimientoInventario.findMany({
    where: {
      productoId,
      producto: {
        tiendaId,
      },
    },
    include: {
      tipoMovimiento: {
        select: {
          id: true,
          nombre: true,
          abreviatura: true,
          naturaleza: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      fecha: "asc",
    },
  });
}
/* ==========================================================
 * Extrae todos los IDs de documentos utilizados.
 *
 * Clasifica los movimientos según el tipo de movimiento.
 *
 * Resultado:
 *
 * ingresosIds[]
 * ventasIds[]
 * salidasIds[]
 * ========================================================== */
function obtenerReferencias(movimientos) {
  const ingresosIds = [];
  const ventasIds = [];
  const salidasIds = [];
  for (const movimiento of movimientos) {
    if (!movimiento.referenciaId) continue;
    switch (movimiento.tipoMovimientoId) {
      // Documentos INGRESO
      case TIPOS_MOVIMIENTO.INGRESO:
      case TIPOS_MOVIMIENTO.DEVOLUCION:
        ingresosIds.push(movimiento.referenciaId);
        break;
      // Documento VENTA
      case TIPOS_MOVIMIENTO.VENTA:
        ventasIds.push(movimiento.referenciaId);
        break;
      // Documentos SALIDA
      case TIPOS_MOVIMIENTO.AJUSTE:
      case TIPOS_MOVIMIENTO.PROMOCION:
      case TIPOS_MOVIMIENTO.REGALO:
      case TIPOS_MOVIMIENTO.INTERCAMBIO:
        salidasIds.push(movimiento.referenciaId);
        break;
      default:
        break;
    }
  }
  return {
    ingresosIds: [...new Set(ingresosIds)],
    ventasIds: [...new Set(ventasIds)],
    salidasIds: [...new Set(salidasIds)],
  };
}
/* ==========================================================
 * Obtiene todos los documentos INGRESO y crea un Map.
 *
 * Map<idIngreso, Ingreso>
 * ========================================================== */
async function obtenerIngresosMap(ids) {
  if (!ids.length) return new Map();
  const ingresos = await prisma.ingreso.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });
  return new Map(ingresos.map((item) => [item.id, item]));
}
/* ==========================================================
 * Obtiene todas las VENTAS y crea un Map.
 *
 * Map<idVenta, Venta>
 * ========================================================== */
async function obtenerVentasMap(ids) {
  if (!ids.length) return new Map();
  const ventas = await prisma.venta.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
      tipoPago: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });
  return new Map(ventas.map((item) => [item.id, item]));
}
/* ==========================================================
 * Obtiene todas las SALIDAS y crea un Map.
 *
 * Map<idSalida, Salida>
 * ========================================================== */
async function obtenerSalidasMap(ids) {
  if (!ids.length) return new Map();
  const salidas = await prisma.salida.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
      tipoMovimiento: {
        select: {
          id: true,
          nombre: true,
          abreviatura: true,
          naturaleza: true,
        },
      },
    },
  });
  return new Map(salidas.map((item) => [item.id, item]));
}
/* ==========================================================
 * Carga todos los documentos relacionados al Kardex.
 * ========================================================== */
async function obtenerDocumentosMovimiento(movimientos) {
  const referencias = obtenerReferencias(movimientos);
  const [ingresosMap, ventasMap, salidasMap] = await Promise.all([
    obtenerIngresosMap(referencias.ingresosIds),
    obtenerVentasMap(referencias.ventasIds),
    obtenerSalidasMap(referencias.salidasIds),
  ]);
  return {
    ingresosMap,
    ventasMap,
    salidasMap,
  };
}
/* ==========================================================
 * Obtiene el documento relacionado a un movimiento.
 * ========================================================== */
function obtenerDocumentoMovimiento(
  movimiento,
  ingresosMap,
  ventasMap,
  salidasMap,
) {
  const tipo = movimiento.tipoMovimiento.nombre;
  switch (tipo) {
    case "INGRESO":
    case "DEVOLUCION":
      return ingresosMap.get(movimiento.referenciaId) ?? null;
    case "VENTA":
      return ventasMap.get(movimiento.referenciaId) ?? null;
    default:
      return salidasMap.get(movimiento.referenciaId) ?? null;
  }
}
/* ==========================================================
 * Convierte todos los movimientos al formato del Kardex.
 * ========================================================== */
function transformarMovimientos(
  movimientos,
  ingresosMap,
  ventasMap,
  salidasMap,
) {
  return movimientos.map((movimiento) => {
    const documento = obtenerDocumentoMovimiento(
      movimiento,
      ingresosMap,
      ventasMap,
      salidasMap,
    );
    const esEntrada = movimiento.tipoMovimiento.naturaleza === "ENTRADA";
    const entrada = esEntrada ? movimiento.cantidad : 0;
    const salida = esEntrada ? 0 : movimiento.cantidad;
    return {
      id: movimiento.id,
      fecha: movimiento.fecha,
      documento: {
        id: documento?.id ?? null,
        tipo: movimiento.tipoMovimiento.nombre,
        codigo: documento?.codigo ?? movimiento.referencia,
        numero: documento?.numero ?? null,
        gestion: documento?.gestion ?? null,
      },
      tipoMovimiento: {
        id: movimiento.tipoMovimiento.id,
        nombre: movimiento.tipoMovimiento.nombre,
        abreviatura: movimiento.tipoMovimiento.abreviatura,
        naturaleza: movimiento.tipoMovimiento.naturaleza,
      },
      cliente: documento?.cliente
        ? {
            id: documento.cliente.id,
            nombre: documento.cliente.nombre,
          }
        : null,
      usuario: {
        id: movimiento.usuario.id,
        nombre: movimiento.usuario.nombre,
      },
      cantidad: movimiento.cantidad,
      entrada,
      salida,
      saldo: movimiento.stockNuevo,
      stockAnterior: movimiento.stockAnterior,
      stockNuevo: movimiento.stockNuevo,
      observacion: documento?.observacion ?? movimiento.observacion ?? "",
    };
  });
}
/* ==========================================================
 * Convierte movimientos generales al formato de Auditoría.
 *
 * Cada elemento representa una fila del reporte general.
 * ========================================================== */
function transformarMovimientosGeneral(
  movimientos,
  ingresosMap,
  ventasMap,
  salidasMap,
) {
  return movimientos.map((movimiento) => {
    const documento = obtenerDocumentoMovimiento(
      movimiento,
      ingresosMap,
      ventasMap,
      salidasMap,
    );
    const esEntrada = movimiento.tipoMovimiento.naturaleza === "ENTRADA";
    return {
      id: movimiento.id,
      fecha: movimiento.fecha,
      documento: {
        id: documento?.id ?? null,
        tipo: movimiento.tipoMovimiento.nombre,
        codigo: documento?.codigo ?? movimiento.referencia,
        numero: documento?.numero ?? null,
        gestion: documento?.gestion ?? null,
      },
      tipoMovimiento: {
        id: movimiento.tipoMovimiento.id,
        nombre: movimiento.tipoMovimiento.nombre,
        abreviatura: movimiento.tipoMovimiento.abreviatura,
        naturaleza: movimiento.tipoMovimiento.naturaleza,
      },
      producto: {
        id: movimiento.producto.id,
        sku: movimiento.producto.sku,
        codigo: movimiento.producto.codigo,
        descripcion: movimiento.producto.descripcion,
        precioVenta: movimiento.producto.precioVenta,
        color: movimiento.producto.color,
        tallas: movimiento.producto.tallas,
        categoria: movimiento.producto.categoria?.nombre ?? null,
        marca: movimiento.producto.marca?.nombre ?? null,
      },
      cliente: documento?.cliente
        ? {
            id: documento.cliente.id,
            nombre: documento.cliente.nombre,
          }
        : null,
      usuario: {
        id: movimiento.usuario.id,
        nombre: movimiento.usuario.nombre,
      },
      cantidad: movimiento.cantidad,
      entrada: esEntrada ? movimiento.cantidad : 0,
      salida: esEntrada ? 0 : movimiento.cantidad,
      stockAnterior: movimiento.stockAnterior,
      stockNuevo: movimiento.stockNuevo,
      saldo: movimiento.stockNuevo,
      observacion: documento?.observacion ?? movimiento.observacion ?? "",
    };
  });
}
/* ==========================================================
 * Calcula los indicadores principales del reporte.
 * Estos datos alimentan las tarjetas del módulo Auditoría.
 * ========================================================== */
function calcularIndicadores(movimientos) {
  let totalEntradas = 0;
  let totalSalidas = 0;

  const productos = new Set();

  for (const mov of movimientos) {
    productos.add(mov.producto.id);

    totalEntradas += mov.entrada;
    totalSalidas += mov.salida;
  }

  return {
    totalMovimientos: movimientos.length,

    productosAfectados: productos.size,

    totalEntradas,

    totalSalidas,

    stockFinal:
      movimientos.length > 0 ? movimientos[movimientos.length - 1].saldo : 0,

    primerMovimiento: movimientos.length > 0 ? movimientos[0].fecha : null,

    ultimoMovimiento:
      movimientos.length > 0 ? movimientos[movimientos.length - 1].fecha : null,
  };
}
/* ==========================================================
 * Calcula los totales agrupados por tipo de movimiento.
 *
 * Estos datos alimentan:
 *  - Tarjetas resumen
 *  - Gráficos
 *  - Exportación Excel
 *  - Reportes PDF
 * ========================================================== */
function calcularTotales(movimientos) {
  const totales = {
    ingresos: {
      ingresos: 0,
      devoluciones: 0,
      total: 0,
    },

    ventas: {
      ventas: 0,
      total: 0,
    },

    salidas: {
      ajustes: 0,
      promociones: 0,
      regalos: 0,
      intercambios: 0,
      total: 0,
    },
  };

  for (const mov of movimientos) {
    switch (mov.tipoMovimiento.id) {
      case TIPOS_MOVIMIENTO.INGRESO:
        totales.ingresos.ingresos += mov.entrada;
        break;

      case TIPOS_MOVIMIENTO.DEVOLUCION:
        totales.ingresos.devoluciones += mov.entrada;
        break;

      case TIPOS_MOVIMIENTO.VENTA:
        totales.ventas.ventas += mov.salida;
        break;

      case TIPOS_MOVIMIENTO.AJUSTE:
        totales.salidas.ajustes += mov.salida;
        break;

      case TIPOS_MOVIMIENTO.PROMOCION:
        totales.salidas.promociones += mov.salida;
        break;

      case TIPOS_MOVIMIENTO.REGALO:
        totales.salidas.regalos += mov.salida;
        break;

      case TIPOS_MOVIMIENTO.INTERCAMBIO:
        totales.salidas.intercambios += mov.salida;
        break;

      default:
        break;
    }
  }

  totales.ingresos.total =
    totales.ingresos.ingresos + totales.ingresos.devoluciones;

  totales.ventas.total = totales.ventas.ventas;

  totales.salidas.total =
    totales.salidas.ajustes +
    totales.salidas.promociones +
    totales.salidas.regalos +
    totales.salidas.intercambios;

  return totales;
}
/* ==========================================================
 * Calcula el resumen del Kardex.
 * ========================================================== */
function calcularResumen(movimientos) {
  let entradas = 0;
  let salidas = 0;
  for (const mov of movimientos) {
    entradas += mov.entrada;
    salidas += mov.salida;
  }
  return {
    totalMovimientos: movimientos.length,
    totalEntradas: entradas,
    totalSalidas: salidas,
    stockFinal:
      movimientos.length > 0 ? movimientos[movimientos.length - 1].saldo : 0,
    primerMovimiento: movimientos.length > 0 ? movimientos[0].fecha : null,
    ultimoMovimiento:
      movimientos.length > 0 ? movimientos[movimientos.length - 1].fecha : null,
  };
}
/* ==========================================================
 * KARDEX DE UN PRODUCTO
 * ========================================================== */
export async function obtenerKardexProducto(productoId, tiendaId) {
  // 1. Producto
  const producto = await obtenerProducto(productoId, tiendaId);
  // 2. Historial de movimientos
  const movimientos = await obtenerMovimientos(productoId, tiendaId);
  // 3. Cargar todos los documentos relacionados
  const { ingresosMap, ventasMap, salidasMap } =
    await obtenerDocumentosMovimiento(movimientos);
  // 4. Transformar movimientos
  const historial = transformarMovimientos(
    movimientos,
    ingresosMap,
    ventasMap,
    salidasMap,
  );
  // 5. Resumen
  const resumen = calcularResumen(historial);
  // 6. Respuesta
  return {
    producto: {
      id: producto.id,
      sku: producto.sku,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      color: producto.color,
      tallas: producto.tallas,
      unidad: producto.unidad,
      categoria: producto.categoria.nombre,
      marca: producto.marca.nombre,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
    },
    resumen,
    movimientos: historial,
    metadata: {
      fechaConsulta: new Date(),
      cantidadMovimientos: historial.length,
    },
  };
}

/* ==========================================================
 * KARDEX GENERAL
 *
 * Obtiene el reporte general de movimientos de inventario.
 * Base para el módulo AUDITORÍA.
 * ========================================================== */
export async function obtenerKardex(filtros, tiendaId) {
  // 1. Construir filtros dinámicos
  const where = construirWhere(filtros, tiendaId);

  // 2. Obtener movimientos
  const movimientos = await obtenerMovimientosGeneral(where);

  // 3. Cargar documentos relacionados
  const { ingresosMap, ventasMap, salidasMap } =
    await obtenerDocumentosMovimiento(movimientos);

  // 4. Transformar movimientos al formato de Auditoría
  const historial = transformarMovimientosGeneral(
    movimientos,
    ingresosMap,
    ventasMap,
    salidasMap,
  );

  // 5. Calcular indicadores
  const indicadores = calcularIndicadores(historial);

  // 6. Calcular totales
  const totales = calcularTotales(historial);

  // 7. Respuesta
  return {
    indicadores,
    totales,
    movimientos: historial,

    metadata: {
      fechaConsulta: new Date(),

      filtros,

      cantidadRegistros: historial.length,
    },
  };
}
