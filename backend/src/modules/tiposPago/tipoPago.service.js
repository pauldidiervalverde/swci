import { prisma } from "../../config/prisma.js";
import { normalizarTexto } from "../../utils/normalizar.js";
export async function obtenerTiposPago() {
  return prisma.tipoPago.findMany({
    orderBy: [
      {
        id: "asc",
      },
      {
        ventas: {
          _count: "desc",
        },
      },
    ],
  });
}
export async function obtenerTipoPagoPorId(id) {
  const tipoPago = await prisma.tipoPago.findUnique({
    where: {
      id,
    },
  });
  if (!tipoPago) {
    throw new Error("El tipo de pago no existe");
  }
  return tipoPago;
}
export async function crearTipoPago(data) {
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const existe = await prisma.tipoPago.findFirst({
    where: {
      nombre,
    },
  });
  if (existe) {
    throw new Error("Ya existe un tipo de pago con ese nombre");
  }
  return prisma.tipoPago.create({
    data: {
      nombre,
      descripcion,
      estado: true,
    },
  });
}
export async function actualizarTipoPago(id, data) {
  const tipoPago = await prisma.tipoPago.findUnique({
    where: {
      id,
    },
  });
  if (!tipoPago) {
    throw new Error("El tipo de pago no existe");
  }
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const duplicado = await prisma.tipoPago.findFirst({
    where: {
      nombre,
      NOT: {
        id,
      },
    },
  });
  if (duplicado) {
    throw new Error("Ya existe un tipo de pago con ese nombre");
  }
  return prisma.tipoPago.update({
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
  const tipoPago = await prisma.tipoPago.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          ventas: true,
        },
      },
    },
  });
  if (!tipoPago) {
    throw new Error("El tipo de pago no existe");
  }
  if (!estado && tipoPago._count.ventas > 0) {
    throw new Error(
      "No se puede desactivar el tipo de pago porque tiene ventas registradas",
    );
  }
  return prisma.tipoPago.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
