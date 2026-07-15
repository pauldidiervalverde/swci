import * as service from "./ingreso.service.js";
import {
  actualizarIngresoSchema,
  crearIngresoSchema,
} from "./ingreso.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export async function listar(req, res) {
  try {
    const search = req.query.search || "";
    const data = await service.obtenerIngresos(search, req.store.id);
    return successResponse(res, data, "Ingresos obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
export async function obtener(req, res) {
  try {
    const data = await service.obtenerIngreso(
      Number(req.params.id),
      req.store.id,
    );
    return successResponse(res, data, "Ingreso obtenido correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
}
export async function crear(req, res) {
  try {
    // Validamos el cuerpo de la petición
    //console.log(req.body);

    const body = crearIngresoSchema.parse(req.body);
    // IMPORTANTE: Asegúrate de que tu authMiddleware guarde el usuario en req.user o req.usuario
    // Aquí asumo que viene en req.user.id, ajústalo según tu middleware de autenticación
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.crearIngreso(body, req.store, usuarioId);
    return successResponse(
      res,
      data,
      "Ingreso y stock registrados correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
export async function actualizar(req, res) {
  try {
    const body = actualizarIngresoSchema.parse(req.body);
    const usuarioId = req.user?.id || req.usuario?.id || 1;
    const data = await service.actualizarIngreso(
      Number(req.params.id),
      body,
      req.store,
      usuarioId,
    );
    return successResponse(res, data, "Ingreso actualizado correctamente");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}
