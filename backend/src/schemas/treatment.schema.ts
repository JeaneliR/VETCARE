import { z } from "zod";

export const estadoTratamientoEnum = z.enum(["EN_CURSO", "FINALIZADO", "SUSPENDIDO"]);

export const createTreatmentSchema = z.object({
  diagnostico: z.string().min(2, "El diagnóstico es obligatorio"),
  descripcion: z.string().min(2, "La descripción es obligatoria"),
  medicamentos: z.string().optional(),
  fechaInicio: z.coerce.date({ required_error: "La fecha de inicio es obligatoria" }),
  fechaFin: z.coerce.date().optional(),
  veterinario: z.string().min(2, "El veterinario es obligatorio"),
  estado: estadoTratamientoEnum.optional().default("EN_CURSO"),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
});

export const updateTreatmentSchema = createTreatmentSchema.partial();

export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;
