import * as service from "./respaldo.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export async function crear(req, res) {
  try {
    const data = await service.crearRespaldo();
    return successResponse(
      res,
      data,
      "Copia de seguridad creada correctamente",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function restaurar(req, res) {
  try {
    const data = await service.restaurarSistema();
    return successResponse(
      res,
      data,
      "Sistema restaurado correctamente (Base de datos actualizada)",
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
