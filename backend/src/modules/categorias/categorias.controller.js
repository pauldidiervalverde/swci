import * as service from "./categorias.service.js";
import {
  crearCategoriaSchema,
  actualizarCategoriaSchema,
  cambiarEstadoSchema,
} from "./categorias.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export async function listar(req, res) {
  try {
    const data = await service.obtenerCategorias(req.store.id);
    return successResponse(res, data, "Categorías obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
export async function obtener(req, res) {
  try {
    const data = await service.obtenerCategoriaPorId(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Categoría obtenida correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    const body = crearCategoriaSchema.parse(req.body);
    const data = await service.crearCategoria(body, req.store);
    return successResponse(res, data, "Categoría creada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarCategoriaSchema.parse(req.body);
    const data = await service.actualizarCategoria(
      Number(req.params.id),
      body,
      req.store.id,
    );
    return successResponse(res, data, "Categoría actualizada correctamente");
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
      req.store.id,
    );
    return successResponse(res, data, "Estado actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
