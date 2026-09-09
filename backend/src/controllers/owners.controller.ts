import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

export async function list(_req: Request, res: Response) {
  const owners = await prisma.owner.findMany({
    orderBy: { apellidos: "asc" },
    include: { _count: { select: { mascotas: true } } },
  });
  res.json(owners);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const owner = await prisma.owner.findUnique({
    where: { id },
    include: { mascotas: true },
  });
  if (!owner) throw ApiError.notFound("Dueño no encontrado");
  res.json(owner);
}

export async function create(req: Request, res: Response) {
  const owner = await prisma.owner.create({ data: req.body });
  res.status(201).json(owner);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const owner = await prisma.owner.update({ where: { id }, data: req.body });
  res.json(owner);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.owner.delete({ where: { id } });
  res.status(204).send();
}
