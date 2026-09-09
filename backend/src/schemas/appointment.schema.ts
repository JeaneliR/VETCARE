import { z } from "zod";

export const estadoCitaEnum = z.enum(["PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"]);

export const createAppointmentSchema = z.object({
  fecha: z.coerce.date({ required_error: "La fecha y hora son obligatorias" }),
  motivo: z.string().min(2, "El motivo es obligatorio"),
  veterinario: z.string().min(2, "El veterinario es obligatorio"),
  estado: estadoCitaEnum.optional().default("PENDIENTE"),
  notas: z.string().optional(),
  mascotaId: z.coerce.number().int().positive("Debe indicar una mascota válida"),
  sedeId: z.coerce.number().int().positive("Debe indicar una sede válida"),
});

// Nota: sobreescribimos "estado" sin el .default(...) heredado de createAppointmentSchema.
// Si no lo hiciéramos, una actualización que no envíe "estado" restauraría
// silenciosamente el valor a "PENDIENTE" por el default de Zod.
export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  estado: estadoCitaEnum.optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
