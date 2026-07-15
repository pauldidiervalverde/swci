import { z } from "zod";

export const obtenerStockSchema = z.object({
  productoId: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .positive("El ID debe ser mayor que cero."),
});
