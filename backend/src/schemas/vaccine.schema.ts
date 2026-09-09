import { z } from "zod";

export const createVaccineSchema = z.object({
  nombre: z.string().min(2, "El nombre de la vacuna es obligatorio"),
  fechaAplicacion: z.coerce.date({ required_error: "La fecha de aplicación es obligatoria" }),
  proximaDosis: z.coerce.date().optional(),
  veterinario: z.string().min(2, "El veterinario es obligatorio"),
  lote: z.string().optional(),
  notas: z.string().optional(),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
});

export const updateVaccineSchema = createVaccineSchema.partial();

export type CreateVaccineInput = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineInput = z.infer<typeof updateVaccineSchema>;
