import { prisma } from "../../config/prisma.js";
import { normalizarTexto } from "../../utils/normalizar.js";

export async function obtenerCategorias(tiendaId) {
  return prisma.categoria.findMany({
    where: {
      tiendaId,
    },
    orderBy: {
      nombre: "asc",
    },
  });
}
export async function obtenerCategoriaPorId(id, tiendaId) {
  const categoria = await prisma.categoria.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!categoria) {
    throw new Error("La categoría no existe");
  }
  return categoria;
}
export async function crearCategoria(data, store) {
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);

  const existe = await prisma.categoria.findFirst({
    where: {
      tiendaId: store.id,
      nombre,
    },
  });
  if (existe) {
    throw new Error("Ya existe una categoría con ese nombre");
  }
  return prisma.categoria.create({
    data: {
      tiendaId: store.id,
      nombre,
      descripcion,
      estado: true,
    },
  });
}
export async function actualizarCategoria(id, data, tiendaId) {
  const categoria = await prisma.categoria.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!categoria) {
    throw new Error("La categoría no existe");
  }
  const nombre = normalizarTexto(data.nombre);
  const descripcion = normalizarTexto(data.descripcion);
  const duplicado = await prisma.categoria.findFirst({
    where: {
      tiendaId,
      nombre,
      NOT: {
        id,
      },
    },
  });
  if (duplicado) {
    throw new Error("Ya existe una categoría con ese nombre");
  }
  return prisma.categoria.update({
    where: {
      id,
    },
    data: {
      nombre,
      descripcion,
    },
  });
}
export async function cambiarEstado(id, estado, tiendaId) {
  const categoria = await prisma.categoria.findFirst({
    where: {
      id,
      tiendaId,
    },
  });
  if (!categoria) {
    throw new Error("La categoría no existe");
  }
  return prisma.categoria.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
