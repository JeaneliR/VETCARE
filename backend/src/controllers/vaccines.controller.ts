import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true } },
};

export async function list(req: Request, res: Response) {
  const { mascotaId, estado, orden } = req.query;
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const direccionOrden = orden === "asc" ? "asc" : "desc";

  let dosisFilter = {};
  if (estado === "vencidas") {
    dosisFilter = { proximaDosis: { lt: now } };
  } else if (estado === "proximas") {
    dosisFilter = { proximaDosis: { gte: now, lte: in30Days } };
  } else if (estado === "al_dia") {
    dosisFilter = {
      OR: [{ proximaDosis: null }, { proximaDosis: { gt: in30Days } }],
    };
  }

  const vaccines = await prisma.vaccine.findMany({
    where: {
      ...(mascotaId ? { mascotaId: Number(mascotaId) } : {}),
      ...dosisFilter,
    },
    orderBy: { fechaAplicacion: direccionOrden },
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
