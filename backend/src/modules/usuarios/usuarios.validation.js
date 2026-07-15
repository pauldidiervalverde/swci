import { z } from "zod";

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(3, "Nombre requerido"),
  usuario: z.string().min(3, "Usuario requerido"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  direccion: z.string().max(250).optional().or(z.literal("")),
  observacion: z.string().optional().or(z.literal("")),
  rolId: z.number(),
  tiendas: z.array(z.number()).min(1, "Debe asignar al menos una tienda"),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(3, "Nombre requerido"),
  usuario: z.string().min(3, "Usuario requerido"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  direccion: z.string().max(250).optional().or(z.literal("")),
  observacion: z.string().optional().or(z.literal("")),
  rolId: z.number(),
  tiendas: z.array(z.number()).min(1, "Debe asignar al menos una tienda"),
  estado: z.boolean(),
});

export const cambiarEstadoSchema = z.object({
  estado: z.boolean(),
});

export const cambiarPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
