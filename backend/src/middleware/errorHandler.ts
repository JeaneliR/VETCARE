import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

// Middleware central de errores. Traduce errores conocidos de Prisma
// y de la app a respuestas HTTP consistentes: { error: string, details?: any }
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: `Ya existe un registro con ese valor único (${(err.meta?.target as string[])?.join(", ")})`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Referencia inválida: la relación indicada no existe" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
