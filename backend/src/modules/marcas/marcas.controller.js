import * as service from "./marcas.service.js";
import {
  crearMarcaSchema,
  actualizarMarcaSchema,
  cambiarEstadoSchema,
} from "./marcas.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export async function listar(req, res) {
  try {
    const data = await service.obtenerMarcas(req.store.id);
    return successResponse(res, data, "Marcas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
export async function obtener(req, res) {
  try {
    const data = await service.obtenerMarcaPorId(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Marca obtenida correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    const body = crearMarcaSchema.parse(req.body);
    const data = await service.crearMarca(req.store.id, body);
    return successResponse(res, data, "Marca creada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarMarcaSchema.parse(req.body);
    const data = await service.actualizarMarca(
      Number(req.params.id),
      req.store.id,
      body,
    );
    return successResponse(res, data, "Marca actualizada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function estado(req, res) {
  try {
    const body = cambiarEstadoSchema.parse(req.body);
    const data = await service.cambiarEstado(
      Number(req.params.id),
      req.store.id,
      body.estado,
    );
    return successResponse(res, data, "Estado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
