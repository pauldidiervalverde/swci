import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { aumentarStock, disminuirStock } from "../stock/stock.service.js";
import { registrarMovimiento } from "../movimientos/movimiento.service.js";
import {
  obtenerFechaBolivia,
  obtenerMesBolivia,
  obtenerAnioBolivia,
} from "../../utils/normalizar.js";
const SELECT_USUARIO = { select: { id: true, nombre: true } };

/** Actualiza un ingreso de inventario completo */
export async function actualizarIngreso(ingresoId, data, store, usuarioId) {
  // const fechaOJO = data.fecha;
  const { observacion = null, detalles } = data;
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new Error("Debe registrar al menos un producto.");
  }
  return await prisma.$transaction(
    async (tx) => {
      // ============================================
      // Obtener el tipo de movimiento INGRESO
      // ============================================
      const tipoMovimiento = await tx.tipoMovimiento.findFirst({
        where: {
          nombre: "INGRESO",
          estado: true,
        },
        select: {
          id: true,
        },
      });
      if (!tipoMovimiento) {
        throw new Error("No existe el tipo de movimiento INGRESO.");
      }
      // ============================================
      // Buscar el ingreso
      // ============================================
      const ingreso = await tx.ingreso.findFirst({
        where: {
          id: ingresoId,
          tiendaId: store.id,
        },
        include: {
          detalles: true,
        },
      });
      if (!ingreso) {
        throw new Error("Ingreso no encontrado.");
      }
      // ============================================
      // Revertir el stock de todos los productos
      // ============================================
      for (const detalle of ingreso.detalles) {
        await disminuirStock(detalle.productoId, detalle.cantidad, tx);
      }
      // ============================================
      // Eliminar movimientos anteriores
      // ============================================
      await tx.movimientoInventario.deleteMany({
        where: {
          referenciaId: ingreso.id,
          tipoMovimientoId: tipoMovimiento.id,
        },
      });
      // ============================================
      // Eliminar todo el detalle anterior
      // ============================================
      await tx.ingresoDetalle.deleteMany({
        where: {
          ingresoId: ingreso.id,
        },
      });
      // ============================================
      // Actualizar cabecera
      // ============================================
      await tx.ingreso.update({
        where: {
          id: ingreso.id,
        },
        data: {
          observacion,
        },
      });
      // ============================================
      // Registrar nuevamente todos los detalles
      // ============================================
      for (const d of detalles) {
        if (d.cantidad <= 0) {
          throw new Error("La cantidad debe ser mayor que cero.");
        }
        if (d.costoUnitario < 0) {
          throw new Error("El costo unitario no puede ser negativo.");
        }
        await tx.ingresoDetalle.create({
          data: {
            ingresoId: ingreso.id,
            productoId: d.productoId,
            cantidad: d.cantidad,
            costoUnitario: d.costoUnitario,
          },
        });
        // Aquí continuará en la Parte 2...
        // ============================================
        // Aumentar nuevamente el stock
        // ============================================
        const stock = await aumentarStock(d.productoId, d.cantidad, tx);
        // ============================================
        // Registrar nuevamente el movimiento
        // ============================================
        await registrarMovimiento(
          {
            productoId: stock.producto.id,
            tipoMovimientoId: tipoMovimiento.id,
            cantidad: d.cantidad,
            stockAnterior: stock.stockAnterior,
            stockNuevo: stock.stockNuevo,
            referencia: ingreso.codigo,
            referenciaId: ingreso.id,
            observacion,
            usuarioId,
          },
          tx,
        );
      }
      // ============================================
      // Obtener el ingreso actualizado
      // ============================================
      const ingresoActualizado = await tx.ingreso.findUnique({
        where: {
          id: ingreso.id,
        },
        include: {
          usuario: SELECT_USUARIO,
          detalles: {
            include: {
              producto: {
                include: {
                  marca: true,
                  categoria: true,
                },
              },
            },
          },
        },
      });
      return ingresoActualizado;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
/** Registra un ingreso de inventario con gestión y número correlativo automático */
export async function crearIngreso(data, store, usuarioId) {
  const {
    fecha,
    observacion = null,
    detalles,
    tipoMovimientoId,
    clienteId,
    ventaId,
  } = data;

  // if (data) {
  //   console.log("crearIngreso data:", data);
  //   console.log("COD del INGRESO: ", ventaId);
  //   return;
  // }

  if (!Array.isArray(detalles) || detalles.length === 0)
    throw new Error("Debe registrar al menos un producto.");
  const fechaFinal = fecha ? new Date(fecha) : new Date();
  // Obtenemos los dos últimos dígitos del año para el código (Ej: 2026 -> 26)
  const anioCompleto = fechaFinal.getFullYear();
  const anioCodigo = obtenerAnioBolivia(fechaFinal);
  const mesCodigo = obtenerMesBolivia(fechaFinal);
  // Intentos por concurrencia
  for (let intento = 1; intento <= 2; intento++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
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
          if (!tipoMovimiento)
            throw new Error("No existe el tipo de movimiento INGRESO.");
          // Buscamos el último número asignado de esta tienda en la GESTIÓN ACTUAL
          const abreviaturaMovimiento = tipoMovimiento.abreviatura;
          // .trim()
          // .toUpperCase()
          // .slice(0, 3);
          const ultimoIngreso = await tx.ingreso.findFirst({
            where: {
              tiendaId: store.id,
              gestion: anioCompleto, // Filtramos por el año entero (Ej: 2026)
            },
            orderBy: { numero: "desc" }, // Trae el número más alto
            select: { numero: true },
          });
          // Si no hay ingresos este año empezamos en 1, sino sumamos +1
          const siguienteNumero = ultimoIngreso ? ultimoIngreso.numero + 1 : 1;
          // Formato visible para el Frontend (Ej: BO26-ING-MES01)
          const codigo = `${store.abreviatura}${anioCodigo}-${abreviaturaMovimiento}-${mesCodigo}${siguienteNumero.toString().padStart(3, "0")}`;
          // Crear cabecera del ingreso
          const nuevoIngreso = await tx.ingreso.create({
            data: {
              tiendaId: store.id,
              numero: siguienteNumero, // Guardado como entero Int
              gestion: anioCompleto, // Guardado como entero Int
              codigo,
              fecha: fechaFinal,
              tipoMovimientoId,
              clienteId,
              ventaId,
              observacion,
              usuarioId,
            },
          });
          // Registrar cada uno de los productos ingresados
          for (const d of detalles) {
            if (d.cantidad <= 0)
              throw new Error("La cantidad debe ser mayor que cero.");
            if (d.costoUnitario < 0)
              throw new Error("El costo unitario no puede ser negativo.");
            await tx.ingresoDetalle.create({
              data: {
                ingresoId: nuevoIngreso.id,
                productoId: d.productoId,
                cantidad: d.cantidad,
                costoUnitario: d.costoUnitario,
              },
            });
            // Actualizar stock físico en el módulo correspondiente
            const stock = await aumentarStock(d.productoId, d.cantidad, tx);
            // Grabar el historial en el Kardex de movimientos
            await registrarMovimiento(
              {
                productoId: stock.producto.id,
                tipoMovimientoId: tipoMovimiento.id,
                cantidad: d.cantidad,
                stockAnterior: stock.stockAnterior,
                stockNuevo: stock.stockNuevo,
                referencia: codigo,
                referenciaId: nuevoIngreso.id,
                observacion,
                usuarioId,
              },
              tx,
            );
          }
          return nuevoIngreso;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      // Error P2002 significa clave única duplicada (alguien ganó el número en ese instante)
      if (error.code !== "P2002") throw error;
      if (intento === 2)
        throw new Error("Conflicto de numeración. Intente de nuevo.");
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
/** Lista los ingresos de una tienda */
export async function obtenerIngresos(search = "", tiendaId) {
  return await prisma.ingreso
    .findMany({
      where: {
        tiendaId,
        OR: [
          { codigo: { contains: search } },
          { observacion: { contains: search } },
          { usuario: { nombre: { contains: search } } },
        ],
      },
      include: {
        usuario: SELECT_USUARIO,
        _count: { select: { detalles: true } },
        detalles: { select: { cantidad: true } },
        venta: {
          select: {
            id: true,
            codigo: true,
            fecha: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
    })
    .then((ingresos) =>
      ingresos.map((i) => ({
        id: i.id,
        codigo: i.codigo,
        fecha: i.fecha,
        venta: i.venta,
        observacion: i.observacion,
        usuario: i.usuario,
        cantidadItems: i._count.detalles,
        totalPiezas: i.detalles.reduce((t, item) => t + item.cantidad, 0),
      })),
    );
}
/** Obtiene un ingreso por ID */
export async function obtenerIngreso(id, tiendaId) {
  return await prisma.ingreso.findFirst({
    where: { id, tiendaId },
    include: {
      usuario: SELECT_USUARIO,
      tienda: { select: { id: true, nombre: true } },
      venta: {
        select: {
          id: true,
          codigo: true,
          fecha: true,
        },
      },
      detalles: {
        include: {
          producto: {
            select: {
              id: true,
              sku: true,
              codigo: true,
              descripcion: true,
              color: true,
              tallas: true,
              stockActual: true,
              marca: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}
