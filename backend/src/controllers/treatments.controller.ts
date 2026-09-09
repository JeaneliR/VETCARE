import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true } },
};

export async function list(req: Request, res: Response) {
  const { mascotaId, estado } = req.query;
  const treatments = await prisma.treatment.findMany({
    where: {
      ...(mascotaId ? { mascotaId: Number(mascotaId) } : {}),
      ...(estado ? { estado: String(estado) } : {}),
    },
    orderBy: { fechaInicio: "desc" },
    include,
  });
  res.json(treatments);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const treatment = await prisma.treatment.findUnique({ where: { id }, include });
  if (!treatment) throw ApiError.notFound("Tratamiento no encontrado");
  res.json(treatment);
}

export async function create(req: Request, res: Response) {
  const treatment = await prisma.treatment.create({ data: req.body, include });
  res.status(201).json(treatment);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const treatment = await prisma.treatment.update({ where: { id }, data: req.body, include });
  res.json(treatment);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.treatment.delete({ where: { id } });
  res.status(204).send();
}
