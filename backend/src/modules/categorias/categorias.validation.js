import { z } from "zod";
export const crearCategoriaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(50),
  descripcion: z.string().optional().nullable(),
});
export const actualizarCategoriaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(50),
  descripcion: z.string().optional().nullable(),
});
export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
