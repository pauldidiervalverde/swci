import * as service from "./venta.service.js";
import { crearVentaSchema, actualizarVentaSchema } from "./venta.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
//////////////////////////////////////////////////////////////////////
// LISTAR
//////////////////////////////////////////////////////////////////////
export async function listar(req, res) {
  try {
    const search = req.query.search || "";
    const data = await service.obtenerVentas(search, req.store.id);
    return successResponse(res, data, "Ventas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
//////////////////////////////////////////////////////////////////////
// OBTENER
//////////////////////////////////////////////////////////////////////
export async function obtener(req, res) {
  try {
    const data = await service.obtenerVenta(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Venta obtenida correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
//////////////////////////////////////////////////////////////////////
// CREAR
//////////////////////////////////////////////////////////////////////
export async function crear(req, res) {
  try {
    const body = crearVentaSchema.parse(req.body);
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.crearVenta(body, req.store, usuarioId);
    return successResponse(res, data, "Venta registrada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
//////////////////////////////////////////////////////////////////////
// ACTUALIZAR
//////////////////////////////////////////////////////////////////////
export async function actualizar(req, res) {
  try {
    const body = actualizarVentaSchema.parse(req.body);
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.actualizarVenta(
      Number(req.params.id),
      body,
      req.store,
      usuarioId,
    );
    return successResponse(res, data, "Venta actualizada correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
