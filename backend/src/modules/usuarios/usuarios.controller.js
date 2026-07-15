import * as service from "./usuarios.service.js";
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  cambiarEstadoSchema,
  cambiarPasswordSchema,
} from "./usuarios.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export async function listar(req, res) {
  try {
    const data = await service.obtenerUsuarios();

    return successResponse(res, data, "Usuarios obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function obtener(req, res) {
  try {
    const data = await service.obtenerUsuarioPorId(Number(req.params.id));

    return successResponse(res, data, "Usuario obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}

export async function crear(req, res) {
  try {
    const body = crearUsuarioSchema.parse(req.body);

    const data = await service.crearUsuario(body);

    return successResponse(res, data, "Usuario creado correctamente");
  } catch (error) {
    console.error(error);
    console.error(error.issues);
    return errorResponse(res, error.message, 400);
  }
}

export async function actualizar(req, res) {
  try {
    const body = actualizarUsuarioSchema.parse(req.body);

    const data = await service.actualizarUsuario(Number(req.params.id), body);

    return successResponse(res, data, "Usuario actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

export async function estado(req, res) {
  try {
    const body = cambiarEstadoSchema.parse(req.body);

    const data = await service.cambiarEstado(
      Number(req.params.id),
      body.estado,
    );

    return successResponse(res, data, "Estado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

export async function password(req, res) {
  try {
    const body = cambiarPasswordSchema.parse(req.body);

    await service.cambiarPassword(
      Number(req.params.id),
      body.password,
      req.body.nuevoPassword,
    );

    return successResponse(res, null, "Password actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

export async function resetear(req, res) {
  try {
    await service.resetPassword(Number(req.params.id));

    return successResponse(res, null, "Password restablecido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
