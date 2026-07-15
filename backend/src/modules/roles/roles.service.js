import { prisma } from "../../config/prisma.js";
// ============================
// ROLES
// ============================
export async function obtenerRoles() {
  return prisma.rol.findMany({
    where: {
      id: {
        not: 1, // Excluye el id 1 (MASTER)
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}
export async function obtenerRolPorId(id) {
  return prisma.rol.findUnique({
    where: {
      id,
    },
    include: {
      permisos: {
        include: {
          modulo: true,
        },
      },
    },
  });
}
export async function crearRol(data) {
  return prisma.rol.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: true,
    },
  });
}
export async function actualizarRol(id, data) {
  if (id === 1) {
    throw new Error("El rol MASTER no puede ser modificado ni eliminado.");
  }
  return prisma.rol.update({
    where: {
      id,
    },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
    },
  });
}
export async function cambiarEstado(id, estado) {
  return prisma.rol.update({
    where: {
      id,
    },
    data: {
      estado,
    },
  });
}
export async function obtenerPermisosRol(rolId) {
  const modulos = await prisma.modulo.findMany({
    where: {
      estado: true,
    },
    orderBy: [
      {
        grupo: "asc",
      },
      {
        orden: "asc",
      },
    ],
    include: {
      permisos: {
        where: {
          rolId,
        },
      },
    },
  });

  return modulos.map((modulo) => {
    const permiso = modulo.permisos[0];

    return {
      moduloId: modulo.id,
      nombre: modulo.nombre,
      ruta: modulo.ruta,
      icono: modulo.icono,
      grupo: modulo.grupo,
      orden: modulo.orden,

      // Para el switch general
      permitido:
        permiso?.ver ||
        permiso?.crear ||
        permiso?.editar ||
        permiso?.eliminar ||
        false,

      // Se conservan para la futura implementación
      ver: permiso?.ver ?? false,
      crear: permiso?.crear ?? false,
      editar: permiso?.editar ?? false,
      eliminar: permiso?.eliminar ?? false,
    };
  });
}

export async function actualizarPermisosRol(rolId, permisos) {
  await prisma.$transaction(async (tx) => {
    // Eliminar todos los permisos actuales del rol
    await tx.permisoRol.deleteMany({
      where: {
        rolId,
      },
    });

    // Crear nuevamente los permisos enviados
    if (permisos.length > 0) {
      await tx.permisoRol.createMany({
        data: permisos.map((permiso) => ({
          rolId,
          moduloId: permiso.moduloId,
          ver: permiso.ver,
          crear: permiso.crear,
          editar: permiso.editar,
          eliminar: permiso.eliminar,
        })),
      });
    }
  });

  return obtenerPermisosRol(rolId);
}
