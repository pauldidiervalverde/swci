import { api } from "./api";

export const menuService = {
  async getMenu() {
    const response = await api.get("/auth/menu");

    return response.data;
  },
};
