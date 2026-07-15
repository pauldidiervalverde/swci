export const normalizarTexto = (texto = "") => {
  return String(texto).trim().replace(/\s+/g, " ").toUpperCase();
};

/**
 * Filtra el arreglo de clientes basado en un término de búsqueda.
 * Remueve de forma básica acentos comúnmente utilizados en español para la comparación.
 * Busca coincidencias en nombre, telefono y nit.
 */
export function filtrarClientes(clientes = [], terminoBusqueda = "") {
  const busquedaNormalizada = normalizarTexto(terminoBusqueda)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!busquedaNormalizada) {
    return clientes;
  }

  return clientes.filter((cliente) => {
    const nombreCliente = normalizarTexto(cliente?.nombre || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const telefonoCliente = normalizarTexto(cliente?.telefono || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const nitCliente = normalizarTexto(cliente?.nit || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return (
      nombreCliente.includes(busquedaNormalizada) ||
      telefonoCliente.includes(busquedaNormalizada) ||
      nitCliente.includes(busquedaNormalizada)
    );
  });
}
