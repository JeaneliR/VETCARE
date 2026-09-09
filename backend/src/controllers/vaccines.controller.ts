import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true } },
};

export async function list(req: Request, res: Response) {
  const { mascotaId } = req.query;
  const vaccines = await prisma.vaccine.findMany({
    where: mascotaId ? { mascotaId: Number(mascotaId) } : undefined,
    orderBy: { fechaAplicacion: "desc" },
    include,
  });
  res.json(vaccines);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const vaccine = await prisma.vaccine.findUnique({ where: { id }, include });
  if (!vaccine) throw ApiError.notFound("Vacuna no encontrada");
  res.json(vaccine);
}

export async function create(req: Request, res: Response) {
  const vaccine = await prisma.vaccine.create({ data: req.body, include });
  res.status(201).json(vaccine);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const vaccine = await prisma.vaccine.update({ where: { id }, data: req.body, include });
  res.json(vaccine);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.vaccine.delete({ where: { id } });
  res.status(204).send();
}
