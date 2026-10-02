import { z } from "zod";

export const estadoTratamientoEnum = z.enum(["EN_CURSO", "FINALIZADO", "SUSPENDIDO"]);

const treatmentBaseSchema = z.object({
  diagnostico: z.string().min(2, "El diagnóstico es obligatorio"),
  descripcion: z.string().min(2, "La descripción es obligatoria"),
  medicamentos: z.string().optional(),
  fechaInicio: z.coerce.date({ required_error: "La fecha de inicio es obligatoria" }),
  fechaFin: z.coerce.date().optional(),
  veterinario: z.string().min(2, "El veterinario es obligatorio"),
  estado: estadoTratamientoEnum.optional().default("EN_CURSO"),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
});

export const createTreatmentSchema = treatmentBaseSchema.refine(
  (data) => {
    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
      return false;
    }
    return true;
  },
  {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["fechaFin"],
  }
);

// Sobreescribimos "estado" sin el .default(...) para que un update que no lo
// envíe no restaure silenciosamente el tratamiento a "EN_CURSO".
export const updateTreatmentSchema = treatmentBaseSchema
  .partial()
  .extend({
    estado: estadoTratamientoEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin && data.fechaFin < data.fechaInicio) {
        return false;
      }
      return true;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["fechaFin"],
    }
  );

export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;