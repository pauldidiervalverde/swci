import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import {
  validarStockDisponible,
  aumentarStock,
  disminuirStock,
} from "../stock/stock.service.js";
import { registrarMovimiento } from "../movimientos/movimiento.service.js";
import {
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
    select: {
      id: true,
      sku: true,
      codigo: true,
      descripcion: true,
      color: true,
      tallas: true,
      precioVenta: true,
      stockActual: true,
      marca: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
};
const movimientosPermitidos = [
  "PROMOCION",
  "REGALO",
  "INTERCAMBIO",
  "DONACION",
  "CONSUMO INTERNO",
];
//////////////////////////////////////////////////////////////////////
// LISTAR SALIDAS
//////////////////////////////////////////////////////////////////////
export async function obtenerSalidas(search = "", tiendaId) {
  return await prisma.salida.findMany({
    where: {
      tiendaId,
      OR: [
        {
          codigo: {
            contains: search,
          },
        },
        {
          observacion: {
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
      ],
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
      usuario: SELECT_USUARIO,
      tipoMovimiento: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      fecha: "desc",
    },
  });
}
//////////////////////////////////////////////////////////////////////
// OBTENER UNA SALIDA
//////////////////////////////////////////////////////////////////////
export async function obtenerSalida(id, tiendaId) {
  const salida = await prisma.salida.findFirst({
    where: {
      id,
      tiendaId,
    },
    include: {
      cliente: true,
      usuario: SELECT_USUARIO,
      tipoMovimiento: true,
      detalles: {
        include: INCLUDE_DETALLE,
      },
    },
  });
  if (!salida) {
    throw new Error("Salida no encontrada.");
  }
  return salida;
}
//////////////////////////////////////////////////////////////////////
// CREAR SALIDA
//////////////////////////////////////////////////////////////////////
// CONTINÚA EN LA PARTE 2A
/** Registra una salida de inventario */
export async function crearSalida(data, store, usuarioId) {
  const {
    fecha,
    clienteId = null,
    tipoMovimientoId,
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
          // Validar Tipo Movimiento
          //////////////////////////////////////////////////////
          const tipoMovimiento = await tx.tipoMovimiento.findFirst({
            where: {
              id: tipoMovimientoId,
              estado: true,
            },
            select: {
              id: true,
              nombre: true,
              abreviatura: true,
            },
          });
          if (!tipoMovimiento) {
            throw new Error("Tipo de movimiento no encontrado.");
          }

          if (!movimientosPermitidos.includes(tipoMovimiento.nombre)) {
            throw new Error(
              "El tipo de movimiento no es válido para una salida. Crear/Editar",
            );
          }
          //   if (tipoMovimiento.nombre === "INGRESO") {
          //     throw new Error(
          //       "El tipo de movimiento INGRESO no puede utilizarse para una salida.",
          //     );
          //   }
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
          // Obtener correlativo
          //////////////////////////////////////////////////////
          const ultimaSalida = await tx.salida.findFirst({
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
          const siguienteNumero = ultimaSalida ? ultimaSalida.numero + 1 : 1;
          const codigo = `${store.abreviatura}${anioCodigo}-${tipoMovimiento.abreviatura}-${mesCodigo}${siguienteNumero
            .toString()
            .padStart(2, "0")}`;
          //////////////////////////////////////////////////////
          // Crear Cabecera
          //////////////////////////////////////////////////////
          const salida = await tx.salida.create({
            data: {
              tiendaId: store.id,
              numero: siguienteNumero,
              gestion: anioCompleto,
              codigo,
              fecha: fechaFinal,
              clienteId,
              tipoMovimientoId,
              observacion,
              usuarioId,
            },
          });
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
              },
            });
            if (!producto) {
              throw new Error("Producto no encontrado.");
            }
            // CONTINÚA EN LA PARTE 2B
            //////////////////////////////////////////////////////
            // Crear detalle
            //////////////////////////////////////////////////////
            await tx.salidaDetalle.create({
              data: {
                salidaId: salida.id,
                productoId: producto.id,
                cantidad: d.cantidad,
              },
            });
            //////////////////////////////////////////////////////
            // Disminuir stock
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
                referenciaId: salida.id,
                observacion,
                usuarioId,
              },
              tx,
            );
          }
          //////////////////////////////////////////////////////
          // Obtener salida completa
          //////////////////////////////////////////////////////
          const salidaCompleta = await tx.salida.findUnique({
            where: {
              id: salida.id,
            },
            include: {
              cliente: true,
              usuario: SELECT_USUARIO,
              tipoMovimiento: true,
              detalles: {
                include: INCLUDE_DETALLE,
              },
            },
          });
          return salidaCompleta;
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
// ACTUALIZAR SALIDA
//////////////////////////////////////////////////////////////////////

/** Actualiza una salida completa */
export async function actualizarSalida(salidaId, data, store, usuarioId) {
  const {
    clienteId = null,
    tipoMovimientoId,
    observacion = null,
    detalles,
  } = data;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error("Debe registrar al menos un producto.");
  }

  return await prisma.$transaction(
    async (tx) => {
      //////////////////////////////////////////////////////
      // Validar Tipo Movimiento
      //////////////////////////////////////////////////////

      const tipoMovimiento = await tx.tipoMovimiento.findFirst({
        where: {
          id: tipoMovimientoId,

          estado: true,
        },

        select: {
          id: true,

          nombre: true,
        },
      });

      if (!tipoMovimiento) {
        throw new Error("Tipo de movimiento no encontrado.");
      }

      if (tipoMovimiento.nombre === "INGRESO") {
        throw new Error(
          "El tipo de movimiento INGRESO no puede utilizarse para una salida.",
        );
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
      // Buscar salida
      //////////////////////////////////////////////////////

      const salida = await tx.salida.findFirst({
        where: {
          id: salidaId,

          tiendaId: store.id,
        },

        include: {
          detalles: true,
        },
      });

      if (!salida) {
        throw new Error("Salida no encontrada.");
      }

      //////////////////////////////////////////////////////
      // Reponer stock anterior
      //////////////////////////////////////////////////////

      for (const detalle of salida.detalles) {
        await aumentarStock(
          detalle.productoId,

          detalle.cantidad,

          tx,
        );
      }

      //////////////////////////////////////////////////////
      // Eliminar movimientos anteriores
      //////////////////////////////////////////////////////

      await tx.movimientoInventario.deleteMany({
        where: {
          referenciaId: salida.id,

          tipoMovimientoId: salida.tipoMovimientoId,
        },
      });

      //////////////////////////////////////////////////////
      // Eliminar detalle anterior
      //////////////////////////////////////////////////////

      await tx.salidaDetalle.deleteMany({
        where: {
          salidaId: salida.id,
        },
      });

      //////////////////////////////////////////////////////
      // Actualizar cabecera
      //////////////////////////////////////////////////////

      await tx.salida.update({
        where: {
          id: salida.id,
        },

        data: {
          clienteId,

          tipoMovimientoId,

          observacion,
        },
      });

      //////////////////////////////////////////////////////
      // Registrar nuevamente el detalle
      //////////////////////////////////////////////////////

      for (const d of detalles) {
        if (d.cantidad <= 0) {
          throw new Error("La cantidad debe ser mayor que cero.");
        }

        await validarStockDisponible(
          d.productoId,

          d.cantidad,
        );

        const producto = await tx.producto.findUnique({
          where: {
            id: d.productoId,
          },

          select: {
            id: true,

            descripcion: true,
          },
        });

        if (!producto) {
          throw new Error("Producto no encontrado.");
        }

        // CONTINÚA EN LA PARTE 3B
        //////////////////////////////////////////////////////
        // Crear nuevamente el detalle
        //////////////////////////////////////////////////////

        await tx.salidaDetalle.create({
          data: {
            salidaId: salida.id,

            productoId: producto.id,

            cantidad: d.cantidad,
          },
        });

        //////////////////////////////////////////////////////
        // Descontar nuevamente el stock
        //////////////////////////////////////////////////////

        const stock = await disminuirStock(
          producto.id,

          d.cantidad,

          tx,
        );

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

            referencia: salida.codigo,

            referenciaId: salida.id,

            observacion,

            usuarioId,
          },

          tx,
        );
      }

      //////////////////////////////////////////////////////
      // Obtener salida actualizada
      //////////////////////////////////////////////////////

      const salidaActualizada = await tx.salida.findUnique({
        where: {
          id: salida.id,
        },

        include: {
          cliente: true,

          usuario: SELECT_USUARIO,

          tipoMovimiento: true,

          detalles: {
            include: INCLUDE_DETALLE,
          },
        },
      });

      return salidaActualizada;
    },

    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
