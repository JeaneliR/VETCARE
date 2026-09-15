import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

export async function list(req: Request, res: Response) {
  // El sitio público solo debe listar sedes activas (?activa=true), pero el
  // sistema interno (LocationsPage) sigue viendo todas para poder reactivar
  // una sede cerrada temporalmente.
  const { activa } = req.query;
  const locations = await prisma.location.findMany({
    where: activa !== undefined ? { activa: activa === "true" } : {},
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { citas: true, banosCortes: true, resenas: true } },
    },
  });

  // Incluimos el promedio de calificación de reseñas por sede
  const withRatings = await Promise.all(
    locations.map(async (loc) => {
      const agg = await prisma.review.aggregate({
        where: { sedeId: loc.id },
        _avg: { calificacion: true },
      });
      return { ...loc, calificacionPromedio: agg._avg.calificacion ?? null };
    })
  );

  res.json(withRatings);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      resenas: { include: { dueno: { select: { nombres: true, apellidos: true } } } },
    },
  });
  if (!location) throw ApiError.notFound("Sede no encontrada");
  res.json(location);
}

export async function create(req: Request, res: Response) {
  const location = await prisma.location.create({ data: req.body });
  res.status(201).json(location);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const location = await prisma.location.update({ where: { id }, data: req.body });
  res.json(location);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.location.delete({ where: { id } });
  res.status(204).send();
}