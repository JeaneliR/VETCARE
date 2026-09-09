import { z } from "zod";

export const createLocationSchema = z.object({
  nombre: z.string().min(2, "El nombre de la sede es obligatorio"),
  direccion: z.string().min(3, "La dirección es obligatoria"),
  ciudad: z.string().min(2, "La ciudad es obligatoria"),
  telefono: z.string().min(6, "El teléfono no es válido"),
  email: z.string().email().optional().or(z.literal("")),
  horario: z.string().optional(),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
  imagenUrl: z.string().url().optional().or(z.literal("")),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
