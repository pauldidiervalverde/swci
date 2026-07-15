import { create } from "zustand";

export const useVentaStore = create((set) => ({
  ventaId: null,

  setVentaId: (id) =>
    set({
      ventaId: id,
    }),

  clearVentaId: () =>
    set({
      ventaId: null,
    }),
}));
