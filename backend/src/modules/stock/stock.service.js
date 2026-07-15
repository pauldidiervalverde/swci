import { prisma } from "../../config/prisma.js";

const SELECT_STOCK_FIELDS = {
  id: true,
  sku: true,
  descripcion: true,
  color: true,
  stockActual: true,
  estado: true,
};

/** Obtiene la información del stock de un producto. */
export async function obtenerStockProducto(productoId) {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: SELECT_STOCK_FIELDS,
  });
  if (!producto) throw new Error("Producto no encontrado.");
  return producto;
}

/** Verifica que exista stock suficiente. */
export async function validarStockDisponible(productoId, cantidad) {
  const producto = await obtenerStockProducto(productoId);
  if (!producto.estado) throw new Error("El producto se encuentra inactivo.");
  if (producto.stockActual < cantidad)
    throw new Error(
      `Stock insuficiente para "${producto.descripcion}". Disponible: ${producto.stockActual}`,
    );
  return true;
}

/** Incrementa el stock de un producto. */
export async function aumentarStock(productoId, cantidad, tx = prisma) {
  const producto = await tx.producto.findUnique({
    where: { id: productoId },
    select: SELECT_STOCK_FIELDS,
  });
  if (!producto) throw new Error("Producto no encontrado.");
  if (!producto.estado) throw new Error("El producto se encuentra inactivo.");
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor que cero.");

  const stockAnterior = producto.stockActual;
  const stockNuevo = stockAnterior + cantidad;

  await tx.producto.update({
    where: { id: productoId },
    data: { stockActual: stockNuevo },
  });
  return { producto, stockAnterior, stockNuevo };
}

/** Disminuye el stock de un producto. */
export async function disminuirStock(productoId, cantidad, tx = prisma) {
  const producto = await tx.producto.findUnique({
    where: { id: productoId },
    select: SELECT_STOCK_FIELDS,
  });
  if (!producto) throw new Error("Producto no encontrado.");
  if (!producto.estado) throw new Error("El producto se encuentra inactivo.");
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor que cero.");
  if (producto.stockActual < cantidad)
    throw new Error(
      `Stock insuficiente para "${producto.descripcion}". Disponible: ${producto.stockActual}. No es posible modificar este ingreso porque parte del stock ya fue utilizado en otros movimientos.`,
    );

  const stockAnterior = producto.stockActual;
  const stockNuevo = stockAnterior - cantidad;

  await tx.producto.update({
    where: { id: productoId },
    data: { stockActual: stockNuevo },
  });
  return { producto, stockAnterior, stockNuevo };
}
