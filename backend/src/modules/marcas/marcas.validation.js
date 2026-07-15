import { z } from "zod";
export const crearMarcaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(100),
  descripcion: z.string().max(200).optional().nullable(),
});
export const actualizarMarcaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(100),
  descripcion: z.string().max(200).optional().nullable(),
});
export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
