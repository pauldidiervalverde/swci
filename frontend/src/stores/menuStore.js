import { create } from "zustand";

export const useMenuStore = create((set) => ({
  menu: [],

  loading: false,

  setMenu: (menu) => {
    set({
      menu,
    });
  },

  setLoading: (loading) => {
    set({
      loading,
    });
  },

  clearMenu: () => {
    set({
      menu: [],
      loading: false,
    });
  },
}));
