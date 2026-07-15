import { api } from "./api";

export const usuariosService = {
  async getAll() {
    const response = await api.get("/usuarios");

    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/usuarios/${id}`);

    return response.data;
  },

  async create(data) {
    const response = await api.post("/usuarios", data);

    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/usuarios/${id}`, data);

    return response.data;
  },

  async changeStatus(id, estado) {
    const response = await api.patch(`/usuarios/${id}/estado`, {
      estado,
    });

    return response.data;
  },

  async changePassword(id, passwordActual, passwordNueva) {
    const response = await api.patch(`/usuarios/${id}/password`, {
      passwordActual,
      passwordNueva,
    });

    return response.data;
  },

  async resetPassword(id) {
    const response = await api.patch(`/usuarios/${id}/reset`);

    return response.data;
  },
};
