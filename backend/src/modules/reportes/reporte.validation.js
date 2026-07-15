import { z } from "zod";

export const reporteDiarioSchema = z.object({
  fechaInicio: z
    .string()
    .datetime({
      message: "Debe ser un formato de fecha o timestamp ISO válido",
    })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .nullable(),
  fechaFin: z
    .string()
    .datetime({
      message: "Debe ser un formato de fecha o timestamp ISO válido",
    })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional()
    .nullable(),
});
