import { api } from "./api";

export const clientesService = {
  async getAll() {
    const response = await api.get("/clientes");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/clientes", data);

    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/clientes/${id}`, data);

    return response.data;
  },

  async changeStatus(id, estado) {
    const response = await api.patch(`/clientes/${id}/estado`, { estado });

    return response.data;
  },
};
