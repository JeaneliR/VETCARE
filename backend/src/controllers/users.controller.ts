import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";
import { hashPassword } from "../utils/auth";

function serialize(user: {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: Date;
  permisos: { modulo: string }[];
  sedes: { locationId: number }[];
}) {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    createdAt: user.createdAt,
    permisos: user.permisos.map((p) => p.modulo),
    sedes: user.sedes.map((s) => s.locationId),
  };
}

const withRelations = { permisos: true, sedes: true };

export async function list(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: { nombre: "asc" },
    include: withRelations,
  });
  res.json(users.map(serialize));
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const user = await prisma.user.findUnique({ where: { id }, include: withRelations });
  if (!user) throw ApiError.notFound("Usuario no encontrado");
  res.json(serialize(user));
}

export async function create(req: Request, res: Response) {
  const { nombre, email, password, rol, permisos, sedes } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("Ya existe un usuario con ese email");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      passwordHash,
      rol,
      permisos: {
        create: (permisos as string[]).map((modulo) => ({ modulo })),
      },
      sedes: {
        create: ((sedes as number[]) ?? []).map((locationId) => ({ locationId })),
      },
    },
    include: withRelations,
  });

  res.status(201).json(serialize(user));
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const { nombre, email, password, rol, activo, permisos, sedes } = req.body;

  if (req.user?.id === id && (rol === "STAFF" || activo === false)) {
    throw ApiError.badRequest("No puedes quitarte tu propio acceso de administrador");
  }

  const data: Prisma.UserUpdateInput = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (email !== undefined) data.email = email;
  if (rol !== undefined) data.rol = rol;
  if (activo !== undefined) data.activo = activo;
  if (password) data.passwordHash = await hashPassword(password);

  if (permisos !== undefined) {
    await prisma.userPermission.deleteMany({ where: { userId: id } });
    data.permisos = { create: (permisos as string[]).map((modulo) => ({ modulo })) };
  }

  if (sedes !== undefined) {
    await prisma.userLocation.deleteMany({ where: { userId: id } });
    data.sedes = { create: (sedes as number[]).map((locationId) => ({ locationId })) };
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: withRelations,
  });

  res.json(serialize(user));
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);

  if (req.user?.id === id) {
    throw ApiError.badRequest("No puedes eliminar tu propia cuenta");
  }

  const admins = await prisma.user.count({ where: { rol: "ADMIN" } });
  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.rol === "ADMIN" && admins <= 1) {
    throw ApiError.badRequest("Debe quedar al menos un administrador");
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}