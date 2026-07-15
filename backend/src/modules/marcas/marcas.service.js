import { prisma } from "../../config/prisma.js";
import { normalizarTexto } from "../../utils/normalizar.js";
export async function obtenerMarcas(tiendaId) {
  return prisma.marca.findMany({
    where: {
      tiendaId,
    },
    orderBy: [
      {
        // 1. Ordena primero por la cantidad de productos vinculados de forma descendente
        productos: {
          _count: "desc",
        },
      },
      {
        // 2. En caso de empate (ej. dos marcas con 0 productos), las ordena alfabéticamente
        nombre: "asc",
      },
    ],
  });
}
export async function obtenerMarcaPorId(id, tiendaId) {
  const marca = await prisma.marca.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!marca) {
    throw new Error("La marca no existe");
  }
  return marca;
}
export async function crearMarca(tiendaId, data) {
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const existe = await prisma.marca.findFirst({
    where: {
      tiendaId,
      nombre,
    },
  });
  if (existe) {
    throw new Error("Ya existe una marca con ese nombre");
  }
  return prisma.marca.create({
    data: {
      tiendaId,
      nombre,
      descripcion,
      estado: true,
    },
  });
}
export async function actualizarMarca(id, tiendaId, data) {
  const marca = await prisma.marca.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!marca) {
    throw new Error("La marca no existe");
  }
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const duplicado = await prisma.marca.findFirst({
    where: {
      tiendaId,
      nombre,
      NOT: {
        id,
      },
    },
  });
  if (duplicado) {
    throw new Error("Ya existe una marca con ese nombre");
  }
  return prisma.marca.update({
    where: {
      id,
    },
    data: {
      nombre,
      descripcion,
    },
  });
}
export async function cambiarEstado(id, tiendaId, estado) {
  const marca = await prisma.marca.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!marca) {
    throw new Error("La marca no existe");
  }
  return prisma.marca.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
