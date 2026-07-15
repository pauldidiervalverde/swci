import * as service from "./salida.service.js";
import {
  crearSalidaSchema,
  actualizarSalidaSchema,
} from "./salida.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
//////////////////////////////////////////////////////////////////////
// LISTAR
//////////////////////////////////////////////////////////////////////
export async function listar(req, res) {
  try {
    const search = req.query.search || "";
    const data = await service.obtenerSalidas(search, req.store.id);
    return successResponse(res, data, "Salidas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
//////////////////////////////////////////////////////////////////////
// OBTENER
//////////////////////////////////////////////////////////////////////
export async function obtener(req, res) {
  try {
    const data = await service.obtenerSalida(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Salida obtenida correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
//////////////////////////////////////////////////////////////////////
// CREAR
//////////////////////////////////////////////////////////////////////
export async function crear(req, res) {
  try {
    const body = crearSalidaSchema.parse(req.body);
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.crearSalida(body, req.store, usuarioId);
    return successResponse(res, data, "Salida registrada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
//////////////////////////////////////////////////////////////////////
// ACTUALIZAR
//////////////////////////////////////////////////////////////////////
export async function actualizar(req, res) {
  try {
    const body = actualizarSalidaSchema.parse(req.body);
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.actualizarSalida(
      Number(req.params.id),
      body,
      req.store,
      usuarioId,
    );
    return successResponse(res, data, "Salida actualizada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
