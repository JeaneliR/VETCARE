import { z } from "zod";

export const createReviewSchema = z.object({
  calificacion: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comentario: z.string().min(3, "El comentario es obligatorio"),
  fecha: z.coerce.date().optional(),
  duenoId: z.coerce.number().int().positive("Debe indicar un dueño válido"),
  sedeId: z.coerce.number().int().positive("Debe indicar una sede válida"),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
