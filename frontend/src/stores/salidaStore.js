import { create } from "zustand";

export const useSalidaStore = create((set) => ({
  id: null,

  setId: (id) =>
    set({
      id,
    }),

  clear: () =>
    set({
      id: null,
    }),
}));
