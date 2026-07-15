import { z } from "zod";
export const crearVentaSchema = z.object({
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
  tipoPagoId: z.number().int().positive("Debe seleccionar un tipo de pago"),
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres")
    .optional()
    .nullable(),
  detalles: z
    .array(
      z.object({
        productoId: z.number().int().positive("Producto inválido"),
        cantidad: z
          .number()
          .int()
          .positive("La cantidad debe ser mayor a cero"),
        descuento: z
          .number()
          .nonnegative("El descuento no puede ser negativo")
          .optional()
          .default(0),
      }),
    )
    .min(1, "Debe registrar al menos un producto."),
});
export const actualizarVentaSchema = z.object({
  clienteId: z
    .number()
    .int()
    .positive("Cliente inválido")
    .nullable()
    .optional(),
  tipoPagoId: z.number().int().positive("Debe seleccionar un tipo de pago"),
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres")
    .optional()
    .nullable(),
  detalles: z
    .array(
      z.object({
        productoId: z.number().int().positive("Producto inválido"),
        cantidad: z
          .number()
          .int()
          .positive("La cantidad debe ser mayor a cero"),
        descuento: z
          .number()
          .nonnegative("El descuento no puede ser negativo")
          .optional()
          .default(0),
      }),
    )
    .min(1, "Debe registrar al menos un producto."),
});
