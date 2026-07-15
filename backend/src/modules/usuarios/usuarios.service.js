import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
export async function obtenerUsuarios() {
  return prisma.usuario.findMany({
    where: {
      id: {
        not: 1, // Excluye el id 1 (MASTER)
      },
    },
    include: {
      rol: true,
      tiendas: {
        include: {
          tienda: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}
export async function obtenerUsuarioPorId(id) {
  return prisma.usuario.findUnique({
    where: {
      id,
    },
    include: {
      rol: true,
      tiendas: {
        include: {
          tienda: true,
        },
      },
    },
  });
}
export async function crearUsuario(data) {
  console.log(data);
  const passwordTemporal = "Clave123/*";
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      usuario: data.usuario,
      password: passwordHash,
      rolId: data.rolId,
      estado: true,
    },
  });
  for (const tiendaId of data.tiendas) {
    await prisma.usuarioTienda.create({
      data: {
        usuarioId: usuario.id,
        tiendaId,
      },
    });
  }
  return usuario;
}
export async function actualizarUsuario(id, data) {
  console.log(data);

  await prisma.usuario.update({
    where: {
      id,
    },
    data: {
      nombre: data.nombre,
      usuario: data.usuario,
      correo: data.correo,
      telefono: data.telefono,
      direccion: data.direccion,
      observacion: data.observacion,
      rolId: data.rolId,
      estado: data.estado,
    },
  });
  await prisma.usuarioTienda.deleteMany({
    where: {
      usuarioId: id,
    },
  });
  for (const tiendaId of data.tiendas) {
    await prisma.usuarioTienda.create({
      data: {
        usuarioId: id,
        tiendaId,
      },
    });
  }
  return obtenerUsuarioPorId(id);
}
export async function cambiarEstado(id, estado) {
  return prisma.usuario.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
export async function cambiarPassword(id, password, nuevoPassword) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id,
    },
  });
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }
  const passwordValido = await bcrypt.compare(password, usuario.password);
  if (!passwordValido) {
    throw new Error("La contraseña actual es incorrecta");
  }
  const passwordHash = await bcrypt.hash(nuevoPassword, 10);
  return prisma.usuario.update({
    where: {
      id,
    },
    data: {
      password: passwordHash,
    },
  });
}

export async function resetPassword(id) {
  const passwordTemporal = "Clave123/*";
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  return prisma.usuario.update({
    where: {
      id,
    },
    data: {
      password: passwordHash,
    },
  });
}
