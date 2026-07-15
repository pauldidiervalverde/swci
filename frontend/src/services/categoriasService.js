import { api } from "./api";

export const categoriasService = {
  async getAll() {
    const response = await api.get("/categorias");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/categorias", data);

    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/categorias/${id}`, data);

    return response.data;
  },

  async changeStatus(id, estado) {
    const response = await api.patch(`/categorias/${id}/estado`, { estado });

    return response.data;
  },
};
