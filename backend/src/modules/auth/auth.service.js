import { prisma } from "../../config/prisma.js";
import { comparePassword } from "../../utils/bcrypt.js";
import { generateToken } from "../../config/jwt.js";
export const loginService = async (usuario, password) => {
  const user = await prisma.usuario.findUnique({
    where: {
      usuario,
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
  if (!user) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.status = 401;
    throw error;
  }
  if (!user.estado) {
    throw new Error("Usuario deshabilitado");
  }
  const passwordOk = await comparePassword(password, user.password);
  if (!passwordOk) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.status = 401;
    throw error;
  }
  const token = generateToken({
    id: user.id,
    usuario: user.usuario,
    rol: user.rol.nombre,
  });
  return {
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      usuario: user.usuario,
      rol: user.rol.nombre,
    },
    tiendas: user.tiendas.map((item) => ({
      id: item.tienda.id,
      nombre: item.tienda.nombre,
      abreviatura: item.tienda.abreviatura,
      descripcion: item.tienda.descripcion,
      imagen: item.tienda.imagen,
    })),
  };
};
export const obtenerMenuService = async (usuarioId) => {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    include: {
      rol: {
        include: {
          permisos: {
            where: {
              ver: true,
            },
            include: {
              modulo: true,
            },
          },
        },
      },
    },
  });
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }
  return usuario.rol.permisos
    .map((permiso) => ({
      id: permiso.modulo.id,
      nombre: permiso.modulo.nombre,
      ruta: permiso.modulo.ruta,
      icono: permiso.modulo.icono,
      orden: permiso.modulo.orden,
      grupo: permiso.modulo.grupo,
      permisos: {
        ver: permiso.ver,
        crear: permiso.crear,
        editar: permiso.editar,
        eliminar: permiso.eliminar,
      },
    }))
    .sort((a, b) => a.orden - b.orden);
};
