import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import {
  validarStockDisponible,
  disminuirStock,
  aumentarStock,
} from "../stock/stock.service.js";
import { registrarMovimiento } from "../movimientos/movimiento.service.js";
import {
  obtenerFechaBolivia,
  obtenerMesBolivia,
  obtenerAnioBolivia,
} from "../../utils/normalizar.js";
const SELECT_USUARIO = {
  select: {
    id: true,
    nombre: true,
  },
};
const INCLUDE_DETALLE = {
  producto: {
    include: {
      categoria: true,
      marca: true,
    },
  },
};
export async function obtenerVentas(search = "", tiendaId) {
  return await prisma.venta.findMany({
    where: {
      tiendaId,
      OR: [
        {
          codigo: {
            contains: search,
          },
        },
        {
          cliente: {
            nombre: {
              contains: search,
            },
          },
        },
        {
          usuario: {
            nombre: {
              contains: search,
            },
          },
        },
      ],
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
      tipoPago: {
        select: {
          id: true,
          nombre: true,
        },
      },
      usuario: SELECT_USUARIO,
    },
    orderBy: {
      id: "desc",
    },
  });
}
export async function obtenerVenta(id, tiendaId) {
  const venta = await prisma.venta.findFirst({
    where: {
      id,
      tiendaId,
    },
    include: {
      cliente: true,
      tipoPago: true,
      usuario: SELECT_USUARIO,
      detalles: {
        include: INCLUDE_DETALLE,
      },
    },
  });
  if (!venta) {
    throw new Error("Venta no encontrada.");
  }
  return venta;
}
/** Registra una venta completa con su detalle */
export async function crearVenta(data, store, usuarioId) {
  const {
    fecha,
    clienteId = null,
    tipoPagoId,
    observacion = null,
    detalles,
  } = data;
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error("Debe registrar al menos un producto.");
  }
  const fechaFinal = fecha ? new Date(fecha) : new Date();
  const anioCompleto = fechaFinal.getFullYear();
  const anioCodigo = obtenerAnioBolivia(fechaFinal);
  const mesCodigo = obtenerMesBolivia(fechaFinal);
  // Intentos por concurrencia
  for (let intento = 1; intento <= 2; intento++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          //////////////////////////////////////////////////////
          // Obtener tipo de movimiento VENTA
          //////////////////////////////////////////////////////
          const tipoMovimiento = await tx.tipoMovimiento.findFirst({
            where: {
              nombre: "VENTA",
              estado: true,
            },
            select: {
              id: true,
              nombre: true,
              abreviatura: true,
            },
          });
          if (!tipoMovimiento) {
            throw new Error("No existe el tipo de movimiento VENTA.");
          }
          //////////////////////////////////////////////////////
          // Validar Cliente
          //////////////////////////////////////////////////////
          if (clienteId) {
            const cliente = await tx.cliente.findFirst({
              where: {
                id: clienteId,
                estado: true,
              },
              select: {
                id: true,
              },
            });
            if (!cliente) {
              throw new Error("Cliente no encontrado.");
            }
          }
          //////////////////////////////////////////////////////
          // Validar Tipo de Pago
          //////////////////////////////////////////////////////
          const tipoPago = await tx.tipoPago.findFirst({
            where: {
              id: tipoPagoId,
              estado: true,
            },
            select: {
              id: true,
            },
          });
          if (!tipoPago) {
            throw new Error("Tipo de pago no encontrado.");
          }
          //////////////////////////////////////////////////////
          // Obtener correlativo
          //////////////////////////////////////////////////////
          const ultimaVenta = await tx.venta.findFirst({
            where: {
              tiendaId: store.id,
              gestion: anioCompleto,
            },
            orderBy: {
              numero: "desc",
            },
            select: {
              numero: true,
            },
          });
          const siguienteNumero = ultimaVenta ? ultimaVenta.numero + 1 : 1;
          const codigo = `${store.abreviatura}${anioCodigo}-${tipoMovimiento.abreviatura}-${mesCodigo}${siguienteNumero
            .toString()
            .padStart(2, "0")}`;
          //////////////////////////////////////////////////////
          // Crear Cabecera
          //////////////////////////////////////////////////////
          const venta = await tx.venta.create({
            data: {
              tiendaId: store.id,
              numero: siguienteNumero,
              gestion: anioCompleto,
              codigo,
              fecha: fechaFinal,
              clienteId,
              tipoPagoId,
              total: 0,
              usuarioId,
              observacion,
            },
          });
          //////////////////////////////////////////////////////
          // Variable acumuladora
          //////////////////////////////////////////////////////
          let totalVenta = new Prisma.Decimal(0);
          //////////////////////////////////////////////////////
          // Registrar detalle
          //////////////////////////////////////////////////////
          for (const d of detalles) {
            if (d.cantidad <= 0) {
              throw new Error("La cantidad debe ser mayor que cero.");
            }
            await validarStockDisponible(d.productoId, d.cantidad);
            const producto = await tx.producto.findUnique({
              where: {
                id: d.productoId,
              },
              select: {
                id: true,
                descripcion: true,
                precioVenta: true,
              },
            });
            if (!producto) {
              throw new Error("Producto no encontrado.");
            }
            //////////////////////////////////////////////////////
            // Calcular importes
            //////////////////////////////////////////////////////
            const precioLista = new Prisma.Decimal(producto.precioVenta);
            const descuento = new Prisma.Decimal(d.descuento ?? 0);
            if (descuento.lessThan(0)) {
              throw new Error("El descuento no puede ser negativo.");
            }
            if (descuento.greaterThan(precioLista)) {
              throw new Error(
                `El descuento del producto "${producto.descripcion}" no puede ser mayor al precio de venta.`,
              );
            }
            const precioUnitario = precioLista.minus(descuento);
            const subtotal = precioUnitario.mul(d.cantidad);
            //////////////////////////////////////////////////////
            // Crear detalle
            //////////////////////////////////////////////////////
            await tx.ventaDetalle.create({
              data: {
                ventaId: venta.id,
                productoId: producto.id,
                cantidad: d.cantidad,
                precioLista,
                descuento,
                precioUnitario,
                subtotal,
              },
            });
            //////////////////////////////////////////////////////
            // Actualizar stock
            //////////////////////////////////////////////////////
            const stock = await disminuirStock(producto.id, d.cantidad, tx);
            //////////////////////////////////////////////////////
            // Registrar movimiento
            //////////////////////////////////////////////////////
            await registrarMovimiento(
              {
                productoId: producto.id,
                tipoMovimientoId: tipoMovimiento.id,
                cantidad: d.cantidad,
                stockAnterior: stock.stockAnterior,
                stockNuevo: stock.stockNuevo,
                referencia: codigo,
                referenciaId: venta.id,
                observacion,
                usuarioId,
              },
              tx,
            );
            //////////////////////////////////////////////////////
            // Acumular total
            //////////////////////////////////////////////////////
            totalVenta = totalVenta.plus(subtotal);
          }
          //////////////////////////////////////////////////////
          // Actualizar total de la venta
          //////////////////////////////////////////////////////
          await tx.venta.update({
            where: {
              id: venta.id,
            },
            data: {
              total: totalVenta,
            },
          });
          //////////////////////////////////////////////////////
          // Obtener venta completa
          //////////////////////////////////////////////////////
          const ventaCompleta = await tx.venta.findUnique({
            where: {
              id: venta.id,
            },
            include: {
              cliente: true,
              tipoPago: true,
              usuario: SELECT_USUARIO,
              detalles: {
                include: INCLUDE_DETALLE,
              },
            },
          });
          return ventaCompleta;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (error.code !== "P2002") {
        throw error;
      }
      if (intento === 2) {
        throw new Error("Conflicto de numeración. Intente nuevamente.");
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
//////////////////////////////////////////////////////////////////////
// ACTUALIZAR VENTA
//////////////////////////////////////////////////////////////////////
/** Actualiza una venta completa */
export async function actualizarVenta(ventaId, data, store, usuarioId) {
  const { clienteId = null, tipoPagoId, observacion = null, detalles } = data;
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error("Debe registrar al menos un producto.");
  }
  return await prisma.$transaction(
    async (tx) => {
      //////////////////////////////////////////////////////
      // Obtener tipo de movimiento VENTA
      //////////////////////////////////////////////////////
      const tipoMovimiento = await tx.tipoMovimiento.findFirst({
        where: {
          nombre: "VENTA",
          estado: true,
        },
        select: {
          id: true,
        },
      });
      if (!tipoMovimiento) {
        throw new Error("No existe el tipo de movimiento VENTA.");
      }
      //////////////////////////////////////////////////////
      // Validar Cliente
      //////////////////////////////////////////////////////
      if (clienteId) {
        const cliente = await tx.cliente.findFirst({
          where: {
            id: clienteId,
            estado: true,
          },
          select: {
            id: true,
          },
        });
        if (!cliente) {
          throw new Error("Cliente no encontrado.");
        }
      }
      //////////////////////////////////////////////////////
      // Validar Tipo de Pago
      //////////////////////////////////////////////////////
      const tipoPago = await tx.tipoPago.findFirst({
        where: {
          id: tipoPagoId,
          estado: true,
        },
        select: {
          id: true,
        },
      });
      if (!tipoPago) {
        throw new Error("Tipo de pago no encontrado.");
      }
      //////////////////////////////////////////////////////
      // Buscar la venta
      //////////////////////////////////////////////////////
      const venta = await tx.venta.findFirst({
        where: {
          id: ventaId,
          tiendaId: store.id,
        },
        include: {
          detalles: true,
        },
      });
      if (!venta) {
        throw new Error("Venta no encontrada.");
      }
      //////////////////////////////////////////////////////
      // Reponer stock anterior
      //////////////////////////////////////////////////////
      for (const detalle of venta.detalles) {
        await aumentarStock(detalle.productoId, detalle.cantidad, tx);
      }
      //////////////////////////////////////////////////////
      // Eliminar movimientos anteriores
      //////////////////////////////////////////////////////
      await tx.movimientoInventario.deleteMany({
        where: {
          referenciaId: venta.id,
          tipoMovimientoId: tipoMovimiento.id,
        },
      });
      //////////////////////////////////////////////////////
      // Eliminar detalle anterior
      //////////////////////////////////////////////////////
      await tx.ventaDetalle.deleteMany({
        where: {
          ventaId: venta.id,
        },
      });
      //////////////////////////////////////////////////////
      // Actualizar cabecera
      //////////////////////////////////////////////////////
      await tx.venta.update({
        where: {
          id: venta.id,
        },
        data: {
          clienteId,
          tipoPagoId,
          observacion,
          total: 0,
        },
      });
      //////////////////////////////////////////////////////
      // Reiniciar total
      //////////////////////////////////////////////////////
      let totalVenta = new Prisma.Decimal(0);
      //////////////////////////////////////////////////////
      // Registrar nuevamente el detalle
      //////////////////////////////////////////////////////
      for (const d of detalles) {
        if (d.cantidad <= 0) {
          throw new Error("La cantidad debe ser mayor que cero.");
        }
        await validarStockDisponible(d.productoId, d.cantidad);
        const producto = await tx.producto.findUnique({
          where: {
            id: d.productoId,
          },
          select: {
            id: true,
            descripcion: true,
            precioVenta: true,
          },
        });
        if (!producto) {
          throw new Error("Producto no encontrado.");
        }
        // CONTINÚA EN LA PARTE 3B
        //////////////////////////////////////////////////////
        // Calcular importes
        //////////////////////////////////////////////////////
        const precioLista = new Prisma.Decimal(producto.precioVenta);
        const descuento = new Prisma.Decimal(d.descuento ?? 0);
        if (descuento.lessThan(0)) {
          throw new Error("El descuento no puede ser negativo.");
        }
        if (descuento.greaterThan(precioLista)) {
          throw new Error(
            `El descuento del producto "${producto.descripcion}" no puede ser mayor al precio de venta.`,
          );
        }
        const precioUnitario = precioLista.minus(descuento);
        const subtotal = precioUnitario.mul(d.cantidad);
        //////////////////////////////////////////////////////
        // Crear nuevamente el detalle
        //////////////////////////////////////////////////////
        await tx.ventaDetalle.create({
          data: {
            ventaId: venta.id,
            productoId: producto.id,
            cantidad: d.cantidad,
            precioLista,
            descuento,
            precioUnitario,
            subtotal,
          },
        });
        //////////////////////////////////////////////////////
        // Descontar nuevamente el stock
        //////////////////////////////////////////////////////
        const stock = await disminuirStock(producto.id, d.cantidad, tx);
        //////////////////////////////////////////////////////
        // Registrar nuevamente el movimiento
        //////////////////////////////////////////////////////
        await registrarMovimiento(
          {
            productoId: producto.id,
            tipoMovimientoId: tipoMovimiento.id,
            cantidad: d.cantidad,
            stockAnterior: stock.stockAnterior,
            stockNuevo: stock.stockNuevo,
            referencia: venta.codigo,
            referenciaId: venta.id,
            observacion,
            usuarioId,
          },
          tx,
        );
        //////////////////////////////////////////////////////
        // Acumular total
        //////////////////////////////////////////////////////
        totalVenta = totalVenta.plus(subtotal);
      }
      //////////////////////////////////////////////////////
      // Actualizar total
      //////////////////////////////////////////////////////
      await tx.venta.update({
        where: {
          id: venta.id,
        },
        data: {
          clienteId,
          tipoPagoId,
          observacion,
          total: totalVenta,
        },
      });
      //////////////////////////////////////////////////////
      // Obtener venta actualizada
      //////////////////////////////////////////////////////
      const ventaActualizada = await tx.venta.findUnique({
        where: {
          id: venta.id,
        },
        include: {
          cliente: true,
          tipoPago: true,
          usuario: SELECT_USUARIO,
          detalles: {
            include: INCLUDE_DETALLE,
          },
        },
      });
      return ventaActualizada;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
