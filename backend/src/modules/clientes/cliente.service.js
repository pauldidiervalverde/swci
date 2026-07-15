import { prisma } from "../../config/prisma.js";
import {
  limpiarTexto,
  normalizarTexto,
  parseFecha,
} from "../../utils/normalizar.js";

export async function crearCliente(data) {
  //console.log(data.fecha);

  const nombre = normalizarTexto(data.nombre);
  const telefono = data.telefono.trim();
  const direccion = limpiarTexto(data.direccion);
  const nit = normalizarTexto(data.nit);
  const observacion = limpiarTexto(data.observacion);
  const correo = limpiarTexto(data.correo);
  const fecha = data.fecha ? new Date(data.fecha) : null;

  const existe = await prisma.cliente.findFirst({
    where: {
      nombre,
      telefono,
    },
  });

  if (existe) {
    throw new Error("Ya existe un cliente con ese nombre y teléfono");
  }

  return prisma.cliente.create({
    data: {
      nombre,
      telefono,
      direccion,
      correo,
      fecha,
      nit,
      observacion,
      estado: true,
    },
  });
}

export async function obtenerClientes() {
  return prisma.cliente.findMany({
    orderBy: [
      {
        nombre: "asc",
      },
    ],
  });
}

export async function buscarClientes(search = "") {
  const texto = normalizarTexto(search ?? "");

  return prisma.cliente.findMany({
    where: {
      OR: [
        {
          nombre: {
            contains: texto,
          },
        },
        {
          telefono: {
            contains: texto,
          },
        },
        {
          nit: {
            contains: texto,
          },
        },
      ],
    },
    orderBy: {
      nombre: "asc",
    },
    take: 100,
  });
}

export async function obtenerClientePorId(id) {
  const cliente = await prisma.cliente.findUnique({
    where: {
      id,
    },
  });

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  return cliente;
}

export async function actualizarCliente(id, data) {
  const cliente = await prisma.cliente.findUnique({
    where: {
      id,
    },
  });

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  const nombre = normalizarTexto(data.nombre);
  const telefono = data.telefono.trim();
  const direccion = limpiarTexto(data.direccion);
  const correo = limpiarTexto(data.correo);
  const nit = normalizarTexto(data.nit);
  const observacion = limpiarTexto(data.observacion);
  const fecha = data.fecha ? new Date(data.fecha) : null;

  const duplicado = await prisma.cliente.findFirst({
    where: {
      nombre,
      telefono,
      NOT: {
        id,
      },
    },
  });

  if (duplicado) {
    throw new Error("Ya existe un cliente con ese nombre y teléfono");
  }

  return prisma.cliente.update({
    where: {
      id,
    },
    data: {
      nombre,
      telefono,
      direccion,
      correo,
      fecha,
      nit,
      observacion,
    },
  });
}

export async function cambiarEstado(id, estado) {
  const cliente = await prisma.cliente.findUnique({
    where: {
      id,
    },
  });

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  return prisma.cliente.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
