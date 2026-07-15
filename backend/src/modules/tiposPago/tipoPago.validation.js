import { z } from "zod";
export const crearTipoPagoSchema = z.object({
  nombre: z
    .string()
    .min(2, "Nombre requerido")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  descripcion: z
    .string()
    .max(200, "La descripción no puede superar los 200 caracteres")
    .optional()
    .nullable(),
});
export const actualizarTipoPagoSchema = z.object({
  nombre: z
    .string()
    .min(2, "Nombre requerido")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  descripcion: z
    .string()
    .max(200, "La descripción no puede superar los 200 caracteres")
    .optional()
    .nullable(),
});
export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
