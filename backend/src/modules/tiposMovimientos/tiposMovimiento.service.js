import { prisma } from "../../config/prisma.js";
import { normalizarTexto } from "../../utils/normalizar.js";
const EGRESOS = ["PROMOCION", "REGALO", "INTERCAMBIO", "AJUSTE"];
const INGRESOS = ["INGRESO", "DEVOLUCION"];

export async function obtenerTiposMovimientoIngresos() {
  return prisma.tipoMovimiento.findMany({
    where: {
      estado: true,
      nombre: {
        in: INGRESOS,
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function obtenerTiposMovimientoEgresos() {
  return prisma.tipoMovimiento.findMany({
    where: {
      estado: true,
      nombre: {
        in: EGRESOS,
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function obtenerTiposMovimiento() {
  return prisma.tipoMovimiento.findMany({
    where: {
      estado: true,
    },
    orderBy: [
      {
        id: "asc",
      },
    ],
  });
}
export async function obtenerTipoMovimientoPorId(id) {
  const tipoMovimiento = await prisma.tipoMovimiento.findUnique({
    where: {
      id,
    },
  });
  if (!tipoMovimiento) {
    throw new Error("El tipo de movimiento no existe");
  }
  return tipoMovimiento;
}
export async function crearTipoMovimiento(data) {
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const existe = await prisma.tipoMovimiento.findFirst({
    where: {
      nombre,
    },
  });
  if (existe) {
    throw new Error("Ya existe un tipo de movimiento con ese nombre");
  }
  return prisma.tipoMovimiento.create({
    data: {
      nombre,
      descripcion,
      estado: true,
    },
  });
}
export async function actualizarTipoMovimiento(id, data) {
  const tipoMovimiento = await prisma.tipoMovimiento.findUnique({
    where: {
      id,
    },
  });
  if (!tipoMovimiento) {
    throw new Error("El tipo de movimiento no existe");
  }
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const duplicado = await prisma.tipoMovimiento.findFirst({
    where: {
      nombre,
      NOT: {
        id,
      },
    },
  });
  if (duplicado) {
    throw new Error("Ya existe un tipo de movimiento con ese nombre");
  }
  return prisma.tipoMovimiento.update({
    where: {
      id,
    },
    data: {
      nombre,
      descripcion,
    },
  });
}
export async function cambiarEstado(id, estado) {
  const tipoMovimiento = await prisma.tipoMovimiento.findUnique({
    where: {
      id,
    },
  });
  if (!tipoMovimiento) {
    throw new Error("El tipo de movimiento no existe");
  }
  return prisma.tipoMovimiento.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
