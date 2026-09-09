import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { comparePassword, signToken } from "../utils/auth";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { permisos: true },
  });

  if (!user || !user.activo) {
    throw ApiError.badRequest("Email o contraseña incorrectos");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.badRequest("Email o contraseña incorrectos");
  }

  const token = signToken({ sub: user.id, rol: user.rol as "ADMIN" | "STAFF" });

  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
      permisos: user.permisos.map((p) => p.modulo),
    },
  });
}

export async function me(req: Request, res: Response) {
  // authenticate ya cargó req.user con los datos frescos de la base de datos.
  res.json(req.user);
}
