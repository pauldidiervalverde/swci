export function buildProductIndex(productos = []) {
  const index = {};

  productos.forEach((p) => {
    const key = `${p.categoriaId}-${p.codigo}`;
    index[key] = p;
  });

  return index;
}

export function mapExcelToStock(rows = [], productIndex, categoriaId) {
  return rows.map((row) => {
    const codigo = Number(row.CODIGO);
    const key = `${categoriaId}-${codigo}`;

    const producto = productIndex[key];

    return {
      productoId: producto?.id || null,
      categoriaId,
      codigo,
      marca: row.MARCA,
      descripcion: row.DESCRIPCION,
      color: row.COLOR,
      tallas: row.TALLA,
      cantidad: Number(row.UNIDADES),
      costoUnitario: Number(row.PRECIO),
      estado: producto ? "OK" : "ERROR",
    };
  });
}
