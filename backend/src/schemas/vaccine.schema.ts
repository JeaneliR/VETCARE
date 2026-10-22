import { z } from "zod";

const vaccineBaseSchema = z.object({
  nombre: z.string().min(2, "El nombre de la vacuna es obligatorio"),
  fechaAplicacion: z.coerce.date({ required_error: "La fecha de aplicación es obligatoria" }),
  proximaDosis: z.coerce.date().optional(),
  veterinario: z.string().min(2, "El veterinario es obligatorio"),
  lote: z.string().optional(),
  notas: z.string().optional(),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
});

export const createVaccineSchema = vaccineBaseSchema.refine(
  (data) => {
    if (data.proximaDosis && data.proximaDosis <= data.fechaAplicacion) {
      return false;
    }
    return true;
  },
  {
    message: "La fecha de la próxima dosis debe ser posterior a la fecha de aplicación",
    path: ["proximaDosis"],
  }
);

export const updateVaccineSchema = vaccineBaseSchema.partial().refine(
  (data) => {
    if (data.fechaAplicacion && data.proximaDosis && data.proximaDosis <= data.fechaAplicacion) {
      return false;
    }
    return true;
  },
  {
    message: "La fecha de la próxima dosis debe ser posterior a la fecha de aplicación",
    path: ["proximaDosis"],
  }
);

export type CreateVaccineInput = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineInput = z.infer<typeof updateVaccineSchema>;
