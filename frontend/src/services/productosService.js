import { api } from "./api";
export const productosService = {
  // Ahora recibe los queryParams como un string opcional (ej: "?page=1&search=hola")
  getAll: async (queryParams = "") => {
    // Si tu axios ya tiene configurada la baseURL, solo concatenas el string
    const response = await api.get(`/productos${queryParams}`);
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post("/productos", data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/productos/${id}`, data);
    return response.data;
  },
  async changeStatus(id, estado) {
    const response = await api.patch(`/productos/${id}/estado`, { estado });
    return response.data;
  },
};
