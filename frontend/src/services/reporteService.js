import { api } from "./api";

export const reporteService = {
  /**
   * Obtiene el reporte comercial e indicadores de rendimiento diario.
   * Admite rango de fechas en formato ISO / UTC para evitar desfases de horas.
   *
   * GET /reportes/diario?fechaInicio=...&fechaFin=...
   */
  getReporteDiario: async (filtros = {}) => {
    const response = await api.get("/reportes/diario", {
      params: filtros,
    });
    return response.data;
  },
};
