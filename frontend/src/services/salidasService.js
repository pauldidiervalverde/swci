import { api } from "./api";

export const salidasService = {
  // Obtener todas las salidas
  getAll: async (queryParams = "") => {
    const response = await api.get(`/salidas${queryParams}`);
    return response.data;
  },

  // Obtener una salida por ID
  getById: async (id) => {
    const response = await api.get(`/salidas/${id}`);
    return response.data;
  },

  // Registrar una nueva salida
  create: async (data) => {
    const response = await api.post("/salidas", data);
    return response.data;
  },

  // Actualizar una salida existente
  update: async (id, data) => {
    const response = await api.put(`/salidas/${id}`, data);
    return response.data;
  },
};
