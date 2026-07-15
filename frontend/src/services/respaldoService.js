import { api } from "./api";

export const respaldoService = {
  // Dispara el respaldo confiando en los middlewares de autenticación del backend respaldos/crear
  crearCopia: async () => {
    const response = await api.post("/respaldos/crear");
    return response.data;
  },
};
