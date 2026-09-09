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

// Sobreescribimos "estado" sin el .default(...) para que un update que no lo
// envíe no restaure silenciosamente el tratamiento a "EN_CURSO".
export const updateTreatmentSchema = createTreatmentSchema.partial().extend({
  estado: estadoTratamientoEnum.optional(),
});

export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;
