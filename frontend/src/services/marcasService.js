import { api } from "./api";

export const marcasService = {
  async getAll() {
    const response = await api.get("/marcas");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/marcas/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/marcas", data);

    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/marcas/${id}`, data);

    return response.data;
  },

  async changeStatus(id, estado) {
    const response = await api.patch(`/marcas/${id}/estado`, { estado });

    return response.data;
  },
};
