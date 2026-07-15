import { api } from "./api";
export const tipoMovimientosService = {
  async getAll() {
    const response = await api.get("/tipos-movimiento");
    return response.data;
  },
  async getIngresos() {
    const response = await api.get("/tipos-movimiento/ingresos");
    return response.data;
  },
  async getEgresos() {
    const response = await api.get("/tipos-movimiento/egresos");
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/tipos-movimiento/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post("/tipos-movimiento", data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/tipos-movimiento/${id}`, data);
    return response.data;
  },
  async changeStatus(id, estado) {
    const response = await api.patch(`/tipos-movimiento/${id}/estado`, {
      estado,
    });
    return response.data;
  },
};
