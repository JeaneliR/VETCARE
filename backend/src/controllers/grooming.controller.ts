import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true } },
  sede: { select: { id: true, nombre: true } },
};

export async function list(req: Request, res: Response) {
  const { mascotaId, sedeId } = req.query;
  const services = await prisma.grooming.findMany({
    where: {
      ...(mascotaId ? { mascotaId: Number(mascotaId) } : {}),
      ...(sedeId ? { sedeId: Number(sedeId) } : {}),
    },
    orderBy: { fecha: "desc" },
    include,
  });
  res.json(services);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const service = await prisma.grooming.findUnique({ where: { id }, include });
  if (!service) throw ApiError.notFound("Servicio de baño/corte no encontrado");
  res.json(service);
}

export async function create(req: Request, res: Response) {
  const service = await prisma.grooming.create({ data: req.body, include });
  res.status(201).json(service);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const service = await prisma.grooming.update({ where: { id }, data: req.body, include });
  res.json(service);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.grooming.delete({ where: { id } });
  res.status(204).send();
}
