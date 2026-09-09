import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

// Middleware genérico de validación con Zod. Uso:
//   router.post("/", validate(createOwnerSchema), controller.create)
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        ApiError.badRequest("Datos inválidos", result.error.flatten().fieldErrors)
      );
    }
    req.body = result.data;
    next();
  };

// Valida que un parámetro de ruta sea un entero positivo y lo devuelve.
export function parseIdParam(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`El id "${value}" no es válido`);
  }
  return id;
}
