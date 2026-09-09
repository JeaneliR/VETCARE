import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

export async function list(req: Request, res: Response) {
  const { duenoId } = req.query;
  const pets = await prisma.pet.findMany({
    where: duenoId ? { duenoId: Number(duenoId) } : undefined,
    orderBy: { nombre: "asc" },
    include: { dueno: { select: { id: true, nombres: true, apellidos: true } } },
  });
  res.json(pets);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      dueno: true,
      citas: { orderBy: { fecha: "desc" } },
      vacunas: { orderBy: { fechaAplicacion: "desc" } },
      tratamientos: { orderBy: { fechaInicio: "desc" } },
      banosCortes: { orderBy: { fecha: "desc" } },
    },
  });
  if (!pet) throw ApiError.notFound("Mascota no encontrada");
  res.json(pet);
}

export async function create(req: Request, res: Response) {
  const { fotoUrl, ...rest } = req.body;
  const pet = await prisma.pet.create({
    data: { ...rest, fotoUrl: fotoUrl || null },
  });
  res.status(201).json(pet);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const { fotoUrl, ...rest } = req.body;
  const pet = await prisma.pet.update({
    where: { id },
    data: { ...rest, ...(fotoUrl !== undefined ? { fotoUrl: fotoUrl || null } : {}) },
  });
  res.json(pet);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.pet.delete({ where: { id } });
  res.status(204).send();
}
