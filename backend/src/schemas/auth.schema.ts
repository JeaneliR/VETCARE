import { z } from "zod";
import { MODULOS } from "../constants/modules";

export const loginSchema = z.object({
  email: z.string().email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const rolEnum = z.enum(["ADMIN", "STAFF"]);
export const moduloEnum = z.enum(MODULOS);

export const createUserSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("El email no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: rolEnum.default("STAFF"),
  permisos: z.array(moduloEnum).default([]),
  // IDs de sedes a las que queda restringido este usuario. Vacío = todas.
  sedes: z.array(z.coerce.number().int().positive()).default([]),
});

export const updateUserSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: rolEnum.optional(),
  activo: z.boolean().optional(),
  permisos: z.array(moduloEnum).optional(),
  sedes: z.array(z.coerce.number().int().positive()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
