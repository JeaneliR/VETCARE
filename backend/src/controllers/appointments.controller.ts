import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

const include = {
  mascota: { select: { id: true, nombre: true, especie: true, dueno: { select: { id: true, nombres: true, apellidos: true } } } },
  sede: { select: { id: true, nombre: true, ciudad: true } },
};

// ============================================================================
// Módulo: Atención Médica (Persona 2 - Citas, Vacunas y Tratamientos)
// ============================================================================
export async function list(req: Request, res: Response) {
  const { mascotaId, sedeId, estado, orden } = req.query;
  const user = req.user;

  // Un STAFF con sedes asignadas solo ve las citas de esas sedes; sin
  // sedes asignadas (o ADMIN) ve todas, como antes. Si además pidió un
  // ?sedeId= puntual, se respeta la restricción: si esa sede no es suya,
  // simplemente no le devolvemos nada (en vez de ignorar el filtro).
  const isRestricted = !!user && user.rol !== "ADMIN" && user.sedes.length > 0;
  let sedeFilter: number | { in: number[] } | undefined;
  if (sedeId) {
    const requested = Number(sedeId);
    sedeFilter = isRestricted && !user!.sedes.includes(requested) ? -1 : requested;
  } else if (isRestricted) {
    sedeFilter = { in: user!.sedes };
  }

  // Permite ordenar citas cronológicamente de forma ascendente o descendente
  const direccionOrden = orden === "desc" ? "desc" : "asc";

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(mascotaId ? { mascotaId: Number(mascotaId) } : {}),
      ...(sedeFilter !== undefined ? { sedeId: sedeFilter } : {}),
      ...(estado ? { estado: String(estado) } : {}),
    },
    orderBy: { fecha: direccionOrden },
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