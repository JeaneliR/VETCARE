import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  dueno: { select: { id: true, nombres: true, apellidos: true } },
  sede: { select: { id: true, nombre: true } },
};

export async function list(req: Request, res: Response) {
  const { sedeId, duenoId } = req.query;
  const reviews = await prisma.review.findMany({
    where: {
      ...(sedeId ? { sedeId: Number(sedeId) } : {}),
      ...(duenoId ? { duenoId: Number(duenoId) } : {}),
    },
    orderBy: { fecha: "desc" },
    include,
  });
  res.json(reviews);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const review = await prisma.review.findUnique({ where: { id }, include });
  if (!review) throw ApiError.notFound("Reseña no encontrada");
  res.json(review);
}

export async function create(req: Request, res: Response) {
  const review = await prisma.review.create({ data: req.body, include });
  res.status(201).json(review);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const review = await prisma.review.update({ where: { id }, data: req.body, include });
  res.json(review);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.review.delete({ where: { id } });
  res.status(204).send();
}
