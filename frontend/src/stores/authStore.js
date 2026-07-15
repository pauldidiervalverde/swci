import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,

      usuario: null,

      tiendas: [],

      tiendaActiva: null,

      isAuthenticated: false,

      login: (data) => {
        set({
          token: data.token,
          usuario: data.usuario,
          tiendas: data.tiendas,
          isAuthenticated: true,
        });
      },

      seleccionarTienda: (tienda) => {
        set({
          tiendaActiva: tienda,
        });
      },

      logout: () => {
        set({
          token: null,
          usuario: null,
          tiendas: [],
          tiendaActiva: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "swi-auth",
    },
  ),
);
