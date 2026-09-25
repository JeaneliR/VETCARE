import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const createInventoryItemSchema = z.object({
  nombre: z.string().min(2, "El nombre del producto es obligatorio"),
  categoria: z.string().min(2, "La categoría es obligatoria"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  stockMinimo: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  proveedor: optionalString,
  ubicacion: optionalString,
  observaciones: optionalString,
  fechaVencimiento: z.coerce.date().optional().nullable(),
  activo: z.boolean().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
