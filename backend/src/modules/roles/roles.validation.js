import { z } from "zod";
export const crearRolSchema = z.object({
  nombre: z.string().min(3, "Nombre requerido"),
  descripcion: z.string().max(200).optional(),
});
export const actualizarRolSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().max(200).optional(),
});
export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
export const permisosRolSchema = z.object({
  permisos: z.array(
    z.object({
      moduloId: z.number(),
      ver: z.boolean(),
      crear: z.boolean(),
      editar: z.boolean(),
      eliminar: z.boolean(),
    }),
  ),
});
