import { obtenerFechaBolivia } from "../../utils/normalizarHora";

export const normalizarTexto = (texto = "") => {
  return String(texto).trim().replace(/\s+/g, " ").toUpperCase();
};

/**
 * Filtra las ventas por:
 * - Código
 * - Fecha (formato Bolivia dd/MM/yyyy)
 */
export function filtrarVentas(ventas = [], terminoBusqueda = "") {
  const busquedaNormalizada = normalizarTexto(terminoBusqueda)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!busquedaNormalizada) {
    return ventas;
  }

  return ventas.filter((venta) => {
    const codigo = normalizarTexto(venta?.codigo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const fecha = normalizarTexto(obtenerFechaBolivia(venta?.fecha))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return (
      codigo.includes(busquedaNormalizada) ||
      fecha.includes(busquedaNormalizada)
    );
  });
}
