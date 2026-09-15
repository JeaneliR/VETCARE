import { Request, Response } from "express";
import prisma from "../lib/prisma";

// Endpoint de resumen usado por el Dashboard del frontend.
// Acepta ?sedeId= para ver las métricas de una sola sede en vez del
// consolidado de todas (lo que pidió hacer el dashboard "más dinámico").
export async function summary(req: Request, res: Response) {
  const sedeId = req.query.sedeId ? Number(req.query.sedeId) : undefined;
  const sedeWhere = sedeId ? { sedeId } : {};
  // Para mascotas/dueños no hay una sede directa en el modelo, así que ese
  // filtro solo aplica a lo que sí tiene sedeId (citas, grooming, reseñas).

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
    ingresosGroomingAgg,
    promedioResenas,
  ] = await Promise.all([
    prisma.pet.count(),
    prisma.owner.count(),
    prisma.location.count(),
    prisma.appointment.count({ where: { ...sedeWhere, fecha: { gte: startOfDay, lte: endOfDay } } }),
    prisma.appointment.count({ where: { ...sedeWhere, estado: "PENDIENTE" } }),
    prisma.vaccine.count({
      where: { proximaDosis: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.treatment.count({ where: { estado: "EN_CURSO" } }),
    prisma.grooming.count({
      where: { ...sedeWhere, fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    // Ingresos de baños/cortes del mes en curso, para el dashboard.
    prisma.grooming.aggregate({
      _sum: { precio: true },
      where: { ...sedeWhere, fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.review.aggregate({ _avg: { calificacion: true }, _count: true, where: sedeWhere }),
  ]);

  const proximasCitas = await prisma.appointment.findMany({
    where: { ...sedeWhere, fecha: { gte: new Date() } },
    orderBy: { fecha: "asc" },
    take: 5,
    include: {
      mascota: { select: { nombre: true } },
      sede: { select: { nombre: true } },
    },
  });

  // Citas de los últimos 7 días (incluye hoy), para la mini gráfica de
  // barras del dashboard. Se agrupa en JS porque SQLite/Prisma no tienen
  // un "group by día" cómodo entre motores.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const citasRecientes = await prisma.appointment.findMany({
    where: { ...sedeWhere, fecha: { gte: sevenDaysAgo } },
    select: { fecha: true },
  });
  const citasPorDia: { fecha: string; cantidad: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sevenDaysAgo);
    day.setDate(day.getDate() + i);
    const dayKey = day.toISOString().slice(0, 10);
    const cantidad = citasRecientes.filter((c) => c.fecha.toISOString().slice(0, 10) === dayKey).length;
    citasPorDia.push({ fecha: dayKey, cantidad });
  }

  // Ingresos del mes desglosados por tipo de servicio de grooming (baño,
  // corte, deslanado, etc.), para saber qué servicio genera más facturación.
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const groomingPorTipo = await prisma.grooming.groupBy({
    by: ["tipoServicio"],
    where: { ...sedeWhere, fecha: { gte: inicioMes } },
    _sum: { precio: true },
    _count: true,
  });
  const ingresosPorTipoServicio = groomingPorTipo
    .map((g) => ({
      tipoServicio: g.tipoServicio,
      cantidad: g._count,
      total: g._sum.precio ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Calificación promedio por sede, para comparar sedes entre sí en el dashboard.
  const sedes = await prisma.location.findMany({
    select: {
      id: true,
      nombre: true,
      resenas: { select: { calificacion: true } },
    },
  });
  const resenasPorSede = sedes.map((s) => ({
    sedeId: s.id,
    nombre: s.nombre,
    total: s.resenas.length,
    promedio: s.resenas.length
      ? s.resenas.reduce((sum, r) => sum + r.calificacion, 0) / s.resenas.length
      : null,
  }));

  res.json({
    totalMascotas,
    totalDuenos,
    totalSedes,
    citasHoy,
    citasPendientes,
    vacunasProximas,
    tratamientosEnCurso,
    serviciosGroomingMes,
    ingresosGroomingMes: ingresosGroomingAgg._sum.precio ?? 0,
    ingresosPorTipoServicio,
    calificacionPromedio: promedioResenas._avg.calificacion,
    totalResenas: promedioResenas._count,
    proximasCitas,
    citasPorDia,
    resenasPorSede,
  });
}