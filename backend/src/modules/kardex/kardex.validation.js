import { z } from "zod";

/**
 * GET /kardex
 */
export const listarKardexSchema = z.object({
  search: z.string().trim().optional(),

  fechaInicio: z.string().optional(),

  fechaFin: z.string().optional(),

  categoriaId: z.coerce.number().int().positive().optional(),

  marcaId: z.coerce.number().int().positive().optional(),

  tipoMovimientoId: z.coerce.number().int().positive().optional(),
});

/**
 * GET /kardex/:productoId
 */
export const obtenerKardexProductoSchema = z.object({
  productoId: z.coerce.number().int().positive(),
});
