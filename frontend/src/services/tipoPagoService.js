import { api } from "./api";
export const tipoPagoService = {
  async getAll() {
    const response = await api.get("/tipos-pago");
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/tipos-pago/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post("/tipos-pago", data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/tipos-pago/${id}`, data);
    return response.data;
  },
  async changeStatus(id, estado) {
    const response = await api.patch(`/tipos-pago/${id}/estado`, {
      estado,
    });
    return response.data;
  },
};
