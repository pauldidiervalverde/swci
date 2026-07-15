import { api } from "./api";

export const ingresosService = {
  // Recibe los queryParams como un string opcional (ej: "?page=1&search=lote")
  getAll: async (queryParams = "") => {
    const response = await api.get(`/ingresos${queryParams}`);
    return response.data;
  },

  // Obtener los detalles de un lote de ingreso específico por su ID
  getById: async (id) => {
    const response = await api.get(`/ingresos/${id}`);
    return response.data;
  },

  // Registrar un nuevo lote completo con su cabecera y el array de detalles en caliente
  create: async (data) => {
    const response = await api.post("/ingresos", data);
    return response.data;
  },

  // Actualizar un ingreso existente
  update: async (id, data) => {
    const response = await api.put(`/ingresos/${id}`, data);

    return response.data;
  },
};
