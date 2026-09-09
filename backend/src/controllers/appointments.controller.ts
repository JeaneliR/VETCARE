import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true, dueno: { select: { id: true, nombres: true, apellidos: true } } } },
  sede: { select: { id: true, nombre: true, ciudad: true } },
};

export async function list(req: Request, res: Response) {
  const { mascotaId, sedeId, estado } = req.query;
  const appointments = await prisma.appointment.findMany({
    where: {
      ...(mascotaId ? { mascotaId: Number(mascotaId) } : {}),
      ...(sedeId ? { sedeId: Number(sedeId) } : {}),
      ...(estado ? { estado: String(estado) } : {}),
    },
    orderBy: { fecha: "asc" },
    include,
  });
  res.json(appointments);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const appointment = await prisma.appointment.findUnique({ where: { id }, include });
  if (!appointment) throw ApiError.notFound("Cita no encontrada");
  res.json(appointment);
}

export async function create(req: Request, res: Response) {
  const appointment = await prisma.appointment.create({ data: req.body, include });
  res.status(201).json(appointment);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const appointment = await prisma.appointment.update({ where: { id }, data: req.body, include });
  res.json(appointment);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.appointment.delete({ where: { id } });
  res.status(204).send();
}
