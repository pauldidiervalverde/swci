import * as service from "./tipoPago.service.js";
import {
  crearTipoPagoSchema,
  actualizarTipoPagoSchema,
  cambiarEstadoSchema,
} from "./tipoPago.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export async function listar(req, res) {
  try {
    const data = await service.obtenerTiposPago();
    return successResponse(res, data, "Tipos de pago obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
export async function obtener(req, res) {
  try {
    const data = await service.obtenerTipoPagoPorId(Number(req.params.id));
    return successResponse(res, data, "Tipo de pago obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    const body = crearTipoPagoSchema.parse(req.body);
    const data = await service.crearTipoPago(body);
    return successResponse(res, data, "Tipo de pago creado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarTipoPagoSchema.parse(req.body);
    const data = await service.actualizarTipoPago(Number(req.params.id), body);
    return successResponse(res, data, "Tipo de pago actualizado correctamente");
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
