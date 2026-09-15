import { z } from "zod";

// Una reseña puede venir de un cliente que ya es "Dueño" en el sistema
// (duenoId) o, más frecuente ahora que se puede dejar desde la web pública
// sin cuenta, de alguien que solo da su nombre (nombreCliente). Se exige
// exactamente uno de los dos.
export const createReviewSchema = z
  .object({
    calificacion: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
    comentario: z.string().min(3, "El comentario es obligatorio"),
    fecha: z.coerce.date().optional(),
    duenoId: z.coerce.number().int().positive().optional(),
    nombreCliente: z.string().trim().min(2, "Indica tu nombre").max(80).optional(),
    sedeId: z.coerce.number().int().positive("Debe indicar una sede válida"),
  })
  .refine((data) => !!data.duenoId || !!data.nombreCliente, {
    message: "Debes indicar un dueño registrado o un nombre de cliente",
    path: ["nombreCliente"],
  });

export const updateReviewSchema = z.object({
  calificacion: z.coerce.number().int().min(1).max(5).optional(),
  comentario: z.string().min(3).optional(),
  fecha: z.coerce.date().optional(),
  duenoId: z.coerce.number().int().positive().optional(),
  nombreCliente: z.string().trim().min(2).max(80).optional(),
  sedeId: z.coerce.number().int().positive().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;