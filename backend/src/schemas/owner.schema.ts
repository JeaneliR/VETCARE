import { z } from "zod";

export const createOwnerSchema = z.object({
  nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  dni: z.string().min(6, "El DNI/documento no es válido"),
  telefono: z.string().min(6, "El teléfono no es válido"),
  email: z.string().email("El email no es válido"),
  direccion: z.string().optional(),
});

export const updateOwnerSchema = createOwnerSchema.partial();

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
