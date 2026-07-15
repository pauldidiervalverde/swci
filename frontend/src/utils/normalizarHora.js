/**
 * Formatea una fecha a string 'dd/mm/aaaa' asegurando la zona horaria de Bolivia.
 * @param {Date|string|number} date - La fecha a formatear.
 * @returns {string} Fecha formateada.
 */
export const obtenerFechaBolivia = (date = new Date()) => {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const parseFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toISOString().split("T")[0];
};

export const formatHora = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/La_Paz", // ◄--- Fuerza la hora oficial de Bolivia
    hour12: false, // Cambia a true si prefieres formato AM/PM (ej: 08:30 PM)
  });
};

export const formatFechaCorta = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric", // ◄--- Te recomiendo incluir el año para evitar confusiones en auditorías viejas
    timeZone: "America/La_Paz", // ◄--- Fuerza la fecha oficial de Bolivia
  });
};

export const getToday = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();

  return new Date(d.getTime() - offset * 60000).toISOString().split("T")[0];
};
