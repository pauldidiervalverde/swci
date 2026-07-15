import { z } from "zod";
export const crearSalidaSchema = z.object({
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
      }),
    )
    .min(1, "Debe registrar al menos un producto."),
});
export const actualizarSalidaSchema = crearSalidaSchema.omit({
  fecha: true,
});
