import { create } from "zustand";

export const useUIStore = create((set) => ({
  // =========================
  // SIDEBAR
  // =========================

  sidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  closeSidebar: () =>
    set({
      sidebarOpen: false,
    }),

  // =========================
  // USER MENU
  // =========================

  userMenuOpen: false,

  toggleUserMenu: () =>
    set((state) => ({
      userMenuOpen: !state.userMenuOpen,
    })),

  closeUserMenu: () =>
    set({
      userMenuOpen: false,
    }),
}));
