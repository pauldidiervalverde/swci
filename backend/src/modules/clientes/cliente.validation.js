import { z } from "zod";

export const crearClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, "Nombre requerido")
    .max(150, "El nombre no puede superar los 150 caracteres"),

  telefono: z
    .string()
    .min(3, "Teléfono requerido")
    .max(30, "El teléfono no puede superar los 30 caracteres"),

  correo: z
    .string()
    .max(250, "El correo no puede superar los 250 caracteres")
    .optional()
    .nullable(),

  fecha: z.string().date().optional().nullable(),

  direccion: z
    .string()
    .max(250, "La dirección no puede superar los 250 caracteres")
    .optional()
    .nullable(),

  nit: z
    .string()
    .max(50, "El NIT no puede superar los 50 caracteres")
    .optional()
    .nullable(),

  observacion: z.string().optional().nullable(),
});

export const actualizarClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, "Nombre requerido")
    .max(150, "El nombre no puede superar los 150 caracteres"),

  telefono: z
    .string()
    .min(3, "Teléfono requerido")
    .max(30, "El teléfono no puede superar los 30 caracteres"),

  correo: z
    .string()
    .max(250, "El correo no puede superar los 250 caracteres")
    .optional()
    .nullable(),

  fecha: z.string().date().optional().nullable(),

  direccion: z
    .string()
    .max(250, "La dirección no puede superar los 250 caracteres")
    .optional()
    .nullable(),

  nit: z
    .string()
    .max(50, "El NIT no puede superar los 50 caracteres")
    .optional()
    .nullable(),

  observacion: z.string().optional().nullable(),
});

export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});
