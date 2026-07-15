import * as service from "./reporte.service.js";
import { reporteDiarioSchema } from "./reporte.validation.js";
import { successResponse, errorResponse } from "../../utils/response.js";

//////////////////////////////////////////////////////////////////////
// OBTENER REPORTE DIARIO Y DE RENDIMIENTO
//////////////////////////////////////////////////////////////////////
export async function obtenerReporteDiario(req, res) {
  try {
    // 1. Validar usando exactamente tu misma convención
    const query = reporteDiarioSchema.parse(req.query);

    const hoyStr = new Date().toISOString().split("T")[0];
    const fechaInicio = query.fechaInicio || hoyStr;
    const fechaFin = query.fechaFin || fechaInicio;

    const data = await service.generarReporteDiario(
      fechaInicio,
      fechaFin,
      req.store.id,
    );

    return successResponse(
      res,
      data,
      "Reporte de rendimiento e inventario generado",
    );
  } catch (error) {
    // 2. Estructura estándar de tu backend: directa, limpia y segura
    return errorResponse(res, error.message, 400);
  }
}
