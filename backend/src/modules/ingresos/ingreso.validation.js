import { z } from "zod";
export const crearIngresoSchema = z.object({
  fecha: z
    .string()
    .datetime()
    .optional()
    .or(z.string().date().optional())
    .nullable(),
  clienteId: z
    .number()
    .int()
    .positive("Cliente inválido")
    .nullable()
    .optional(),
  tipoMovimientoId: z
    .number()
    .int()
    .positive("Debe seleccionar un tipo de movimiento"),
  ventaId: z
    .number()
    .int()
    .nonnegative("Venta inválida")
    .nullable()
    .optional()
    .transform((value) => (value === 0 ? null : value)),
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres")
    .optional()
    .nullable(),
  detalles: z
    .array(
      z.object({
        productoId: z.number().int().positive("ID de producto inválido"),
        cantidad: z
          .number()
          .int()
          .positive("La cantidad debe ser mayor a cero"),
        costoUnitario: z
          .number()
          .nonnegative("El costo unitario no puede ser negativo"),
      }),
    )
    .min(1, "Debe registrar al menos un producto en el detalle"),
});

export const actualizarIngresoSchema = z.object({
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres")
    .optional()
    .nullable(),
  detalles: z
    .array(
      z.object({
        productoId: z.number().int().positive("ID de producto inválido"),
        cantidad: z
          .number()
          .int()
          .positive("La cantidad debe ser mayor que cero"),
        costoUnitario: z
          .number()
          .nonnegative("El costo unitario no puede ser negativo"),
      }),
    )
    .min(1, "Debe registrar al menos un producto en el detalle"),
});
