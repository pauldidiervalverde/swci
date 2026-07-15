import { api } from "./api";

export const rolesService = {
  // Obtener todos los roles
  getAll: async () => {
    const response = await api.get("/roles");
    return response.data;
  },

  // Obtener un rol
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Crear
  create: async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // Activar / Desactivar
  changeStatus: async (id, estado) => {
    const response = await api.patch(`/roles/${id}/estado`, { estado });
    return response.data;
  },

  // ==========================================
  // PERMISOS
  // ==========================================

  // Obtener permisos del rol
  getPermisos: async (id) => {
    const response = await api.get(`/roles/${id}/permisos`);
    return response.data;
  },

  // Guardar permisos
  updatePermisos: async (id, permisos) => {
    const response = await api.put(`/roles/${id}/permisos`, permisos);
    return response.data;
  },
};
