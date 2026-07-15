import { api } from "./api";

export const kardexService = {
  /**
   * Obtiene el Kardex completo de un producto.
   *
   * GET /kardex/:productoId
   */
  getByProducto: async (productoId) => {
    const response = await api.get(`/kardex/${productoId}`);
    return response.data;
  },

  /**
   * Consulta el Kardex general por rango de fechas.
   * (Será utilizado posteriormente en Reportes.)
   *
   */
  getGeneral: async (filtros = {}) => {
    const response = await api.get("/kardex", {
      params: filtros,
    });
    return response.data;
  },
};
