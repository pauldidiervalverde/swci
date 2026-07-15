export function generarSku(abreviatura, categoriaId, codigo) {
  const gestion = new Date().getFullYear().toString().slice(-2);

  const categoria = categoriaId.toString().padStart(2, "0");

  const codigoFormateado = codigo.toString().padStart(5, "0");

  return `${abreviatura}${gestion}-${categoria}-${codigoFormateado}`;
}
