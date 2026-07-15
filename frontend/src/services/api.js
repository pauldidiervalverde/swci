import axios from "axios";
import Swal from "sweetalert2";
import { useAuthStore } from "../stores/authStore";

// Evita mostrar múltiples alertas cuando varias peticiones devuelven 401
let sessionExpiredAlert = false;

export const api = axios.create({
  baseURL: "https://p8rrjd6d-3001.brs.devtunnels.ms/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

api.interceptors.request.use(
  (config) => {
    const { token, tiendaActiva } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tiendaActiva?.id) {
      config.headers["x-tienda-id"] = tiendaActiva.id;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Ignorar el 401 del login (usuario o contraseña incorrectos)
    if (status === 401 && !url.includes("/auth/login")) {
      // Si ya se está mostrando la alerta, no hacer nada más
      if (sessionExpiredAlert) {
        return Promise.reject(error);
      }

      sessionExpiredAlert = true;

      await Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        html: `
                <p>Su sesión ha finalizado por motivos de <strong>seguridad</strong>.</p>
                <p>Para continuar, <strong>vuelva a iniciar sesión</strong>.</p>
              `,
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      sessionExpiredAlert = false;

      useAuthStore.getState().logout();

      window.location.replace("/login");

      //window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
