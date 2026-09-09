import { Request, Response } from "express";
import prisma from "../lib/prisma";

// Endpoint de resumen usado por el Dashboard del frontend.
export async function summary(_req: Request, res: Response) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalMascotas,
    totalDuenos,
    totalSedes,
    citasHoy,
    citasPendientes,
    vacunasProximas,
    tratamientosEnCurso,
    serviciosGroomingMes,
    promedioResenas,
  ] = await Promise.all([
    prisma.pet.count(),
    prisma.owner.count(),
    prisma.location.count(),
    prisma.appointment.count({ where: { fecha: { gte: startOfDay, lte: endOfDay } } }),
    prisma.appointment.count({ where: { estado: "PENDIENTE" } }),
    prisma.vaccine.count({
      where: { proximaDosis: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.treatment.count({ where: { estado: "EN_CURSO" } }),
    prisma.grooming.count({
      where: { fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.review.aggregate({ _avg: { calificacion: true }, _count: true }),
  ]);

  const proximasCitas = await prisma.appointment.findMany({
    where: { fecha: { gte: new Date() } },
    orderBy: { fecha: "asc" },
    take: 5,
    include: {
      mascota: { select: { nombre: true } },
      sede: { select: { nombre: true } },
    },
  });

  res.json({
    totalMascotas,
    totalDuenos,
    totalSedes,
    citasHoy,
    citasPendientes,
    vacunasProximas,
    tratamientosEnCurso,
    serviciosGroomingMes,
    calificacionPromedio: promedioResenas._avg.calificacion,
    totalResenas: promedioResenas._count,
    proximasCitas,
  });
}
