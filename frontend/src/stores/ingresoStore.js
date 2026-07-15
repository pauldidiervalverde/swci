import { create } from "zustand";

export const useIngresoStore = create((set) => ({
  ingresoId: null,

  setIngresoId: (id) =>
    set({
      ingresoId: id,
    }),

  clearIngresoId: () =>
    set({
      ingresoId: null,
    }),
}));
