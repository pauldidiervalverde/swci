import { normalizarTexto } from "../../utils/normalizarTexto";

export function filtrarProductos(productos = [], filtros = {}) {
  // 1. Desestructuramos las nuevas propiedades de ordenamiento con valores por defecto
  const {
    search = "",
    categoriaId = "",
    marcaId = "",
    orderBy = "",
    desc = false,
  } = filtros;

  const textoBusqueda = normalizarTexto(search);

  // 2. Primero ejecutamos el filtro tal como lo tenías
  const productosFiltrados = productos.filter((producto) => {
    if (categoriaId && String(producto.categoriaId) !== String(categoriaId)) {
      return false;
    }
    if (marcaId && String(producto.marcaId) !== String(marcaId)) {
      return false;
    }
    if (!textoBusqueda) {
      return true;
    }

    const descripcion = normalizarTexto(producto.descripcion);
    const codigo = normalizarTexto(producto.codigo);
    const color = normalizarTexto(producto.color);
    const tallas = normalizarTexto(producto.tallas);
    const precioVenta = normalizarTexto(producto.precioVenta);

    return (
      descripcion.includes(textoBusqueda) ||
      codigo.includes(textoBusqueda) ||
      color.includes(textoBusqueda) ||
      tallas.includes(textoBusqueda) ||
      precioVenta.includes(textoBusqueda)
    );
  });

  // 3. Si no se especificó un campo para ordenar, retornamos el array filtrado directamente
  if (!orderBy) return productosFiltrados;

  // 4. Aplicamos el ordenamiento automático inteligente (Crea una copia para evitar mutar el original)
  return [...productosFiltrados].sort((a, b) => {
    let valorA = a[orderBy];
    let valorB = b[orderBy];

    // Control preventivo si el valor es undefined o null
    if (valorA === undefined || valorA === null) return 1;
    if (valorB === undefined || valorB === null) return -1;

    // --- DETECCIÓN AUTOMÁTICA DE TIPOS ---

    // Caso A: Si es numérico (o instancia de Decimal / fechas convertidas a número)
    if (
      typeof valorA === "number" ||
      (!isNaN(Number(valorA)) && typeof valorA !== "boolean")
    ) {
      const numA = Number(valorA);
      const numB = Number(valorB);
      return desc ? numB - numA : numA - numB;
    }

    // Caso B: Si es booleano (como el campo "estado")
    if (typeof valorA === "boolean") {
      return desc
        ? (valorB ? 1 : 0) - (valorA ? 1 : 0)
        : (valorA ? 1 : 0) - (valorB ? 1 : 0);
    }

    // Caso C: Por defecto tratamos el campo como Texto (String)
    const strA = String(valorA).toLowerCase();
    const strB = String(valorB).toLowerCase();

    return desc
      ? strB.localeCompare(strA, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      : strA.localeCompare(strB, undefined, {
          numeric: true,
          sensitivity: "base",
        });
  });
}
