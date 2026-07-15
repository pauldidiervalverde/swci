export const normalizarTexto = (texto) => {
  if (texto === undefined || texto === null) {
    return "";
  }
  return String(texto)
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const parseFecha = (fechaTexto) => {
  if (!fechaTexto) return null;

  const [dia, mes, anio] = fechaTexto.split("/");
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
};

export const limpiarTexto = (texto) => {
  if (texto === undefined || texto === null) {
    return "";
  }
  return texto.toString().trim().replace(/\s+/g, " ");
};

export const obtenerFechaBolivia = (date = new Date()) => {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const obtenerMesBolivia = (date = new Date()) => {
  const formatoMes = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    month: "short",
  }).format(new Date(date));

  // Removemos el punto que genera es-BO (ej: "ene." -> "ene") y lo pasamos a MAYÚSCULAS
  return formatoMes.replace(".", "").toUpperCase();
};

export const obtenerAnioBolivia = (date = new Date()) => {
  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    year: "2-digit",
  }).format(new Date(date));
};
