import { prisma } from "../../config/prisma.js";

/** Registra un movimiento de inventario (Uso interno). */
export async function registrarMovimiento(data, tx = prisma) {
  const {
    productoId,
    tipoMovimientoId,
    cantidad,
    stockAnterior,
    stockNuevo,
    referencia = null,
    referenciaId = null,
    observacion = null,
    usuarioId,
  } = data;
  return await tx.movimientoInventario.create({
    data: {
      productoId,
      tipoMovimientoId,
      cantidad,
      stockAnterior,
      stockNuevo,
      referencia,
      referenciaId,
      observacion,
      usuarioId,
    },
  });
}

/** Lista los movimientos de inventario de una tienda. */
export async function obtenerMovimientos(search = "", tiendaId) {
  return await prisma.movimientoInventario.findMany({
    where: {
      producto: { tiendaId },
      OR: [
        { producto: { descripcion: { contains: search } } },
        { producto: { sku: { contains: search } } },
        { referencia: { contains: search } },
      ],
    },
    include: {
      producto: {
        select: { id: true, sku: true, descripcion: true, color: true },
      },
      tipoMovimiento: { select: { id: true, nombre: true } },
      usuario: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha: "desc" },
  });
}

/** Obtiene un movimiento por ID. */
export async function obtenerMovimiento(id, tiendaId) {
  return await prisma.movimientoInventario.findFirst({
    where: { id, producto: { tiendaId } },
    include: {
      producto: {
        select: {
          id: true,
          sku: true,
          descripcion: true,
          color: true,
          stockActual: true,
        },
      },
      tipoMovimiento: true,
      usuario: { select: { id: true, nombre: true } },
    },
  });
}

/** Obtiene todos los movimientos de un producto. */
export async function obtenerMovimientosProducto(productoId, tiendaId) {
  return await prisma.movimientoInventario.findMany({
    where: { productoId, producto: { tiendaId } },
    include: {
      tipoMovimiento: { select: { id: true, nombre: true } },
      usuario: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha: "desc" },
  });
}
