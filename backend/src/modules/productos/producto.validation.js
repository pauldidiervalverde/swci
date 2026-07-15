import { z } from "zod";
export const crearProductoSchema = z.object({
  categoriaId: z.number().int().positive(),
  marcaId: z.number().int().positive(),
  codigo: z.number().int().positive(),
  descripcion: z.string().trim().min(3, "La descripción es requerida").max(300),
  color: z.string().trim().min(1, "El color es requerido").max(100),
  tallas: z.string().max(50).optional().default("U"),
  piezas: z.number().int().positive().default(1),
  precioVenta: z.number().positive(),
  stockActual: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(1),
  observacion: z.string().optional().nullable(),
});

export const actualizarProductoSchema = z.object({
  marcaId: z.number().int().positive(),
  descripcion: z.string().trim().min(3, "La descripción es requerida").max(300),
  color: z.string().trim().min(1, "El color es requerido").max(100),
  tallas: z.string().max(50).optional().default("U"),
  piezas: z.number().int().positive().default(1),
  precioVenta: z.number().positive(),
  stockMinimo: z.number().int().min(0).default(1),
  observacion: z.string().optional().nullable(),
});
export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
// Esquema para un ítem individual dentro del array que viene del Excel
const itemExcelSchema = z.object({
  CODIGO: z.union([z.number(), z.string()]),
  MARCA: z.string().trim().default("GENERICO"),
  DESCRIPCION: z
    .string()
    .trim()
    .min(1, "La descripción en la fila es requerida"),
  COLOR: z.string().trim().default("SIN COLOR"),
  TALLA: z.string().trim().default("U"),
  PRECIO: z.union([z.number(), z.string()]).optional().default(0),
});

export const simularCargaMasivaSchema = z.object({
  categoriaId: z.number().int().positive(),
  productos: z
    .array(itemExcelSchema)
    .min(1, "El archivo debe contener al menos un producto"),
});

export const confirmarCargaMasivaSchema = z.object({
  categoriaId: z.number().int().positive(),
  // Para la confirmación real, recibimos únicamente la lista de los productos que resultaron VERDES
  productos: z
    .array(
      z.object({
        codigo: z.number().int().positive(),
        marca: z.string().trim(),
        descripcion: z.string().trim(),
        color: z.string().trim(),
        talla: z.string().trim(),
        precio: z.number().nonnegative(),
      }),
    )
    .min(1, "No hay productos válidos para confirmar"),
});
