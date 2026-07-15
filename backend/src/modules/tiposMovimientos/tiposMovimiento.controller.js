import * as service from "./tiposMovimiento.service.js";
import {
  crearTipoMovimientoSchema,
  actualizarTipoMovimientoSchema,
  cambiarEstadoSchema,
} from "./tiposMovimiento.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export async function searchIngresos(req, res) {
  try {
    const data = await service.obtenerTiposMovimientoIngresos();

    return successResponse(
      res,
      data,
      "Tipos de movimiento para ingresos obtenidos correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function searchEgresos(req, res) {
  try {
    const data = await service.obtenerTiposMovimientoEgresos();

    return successResponse(
      res,
      data,
      "Tipos de movimiento para egresos obtenidos correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function listar(req, res) {
  try {
    const data = await service.obtenerTiposMovimiento();
    return successResponse(
      res,
      data,
      "Tipos de movimiento obtenidos correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
export async function obtener(req, res) {
  try {
    const data = await service.obtenerTipoMovimientoPorId(
      Number(req.params.id),
    );
    return successResponse(
      res,
      data,
      "Tipo de movimiento obtenido correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    const body = crearTipoMovimientoSchema.parse(req.body);
    const data = await service.crearTipoMovimiento(body);
    return successResponse(
      res,
      data,
      "Tipo de movimiento creado correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarTipoMovimientoSchema.parse(req.body);
    const data = await service.actualizarTipoMovimiento(
      Number(req.params.id),
      body,
    );
    return successResponse(
      res,
      data,
      "Tipo de movimiento actualizado correctamente",
    );
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
