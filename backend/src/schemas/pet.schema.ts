import { z } from "zod";

export const especieEnum = z.enum(["PERRO", "GATO", "AVE", "ROEDOR", "REPTIL", "OTRO"]);
export const sexoEnum = z.enum(["MACHO", "HEMBRA"]);

export const createPetSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  especie: especieEnum,
  raza: z.string().optional(),
  sexo: sexoEnum,
  fechaNacimiento: z.coerce.date().optional(),
  peso: z.coerce.number().positive("El peso debe ser mayor a 0").optional(),
  color: z.string().optional(),
  esterilizado: z.boolean().optional().default(false),
  notas: z.string().optional(),
  fotoUrl: z.string().url().optional().or(z.literal("")),
  duenoId: z.coerce.number().int().positive("Debe indicar un dueño válido"),
});

// Sobreescribimos "esterilizado" sin el .default(...) para que un update que
// no lo envíe no restaure silenciosamente el valor a "false".
export const updatePetSchema = createPetSchema.partial().extend({
  esterilizado: z.boolean().optional(),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
