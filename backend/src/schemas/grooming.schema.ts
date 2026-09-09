import { z } from "zod";

export const tipoServicioGroomingEnum = z.enum([
  "BANO",
  "CORTE",
  "BANO_Y_CORTE",
  "DESLANADO",
  "CORTE_UNAS",
]);

export const createGroomingSchema = z.object({
  tipoServicio: tipoServicioGroomingEnum,
  fecha: z.coerce.date({ required_error: "La fecha es obligatoria" }),
  precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  encargado: z.string().min(2, "El encargado es obligatorio"),
  notas: z.string().optional(),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
  sedeId: z.coerce.number().int().positive("Debe indicar una sede válida"),
});

export const updateGroomingSchema = createGroomingSchema.partial();

export type CreateGroomingInput = z.infer<typeof createGroomingSchema>;
export type UpdateGroomingInput = z.infer<typeof updateGroomingSchema>;
