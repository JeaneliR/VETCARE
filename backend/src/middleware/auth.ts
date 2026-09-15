import { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/auth";

// Verifica el JWT del header Authorization y carga el usuario (con sus
// permisos) desde la base de datos, para no confiar solo en lo que dice
// el token si el admin le quitó permisos o desactivó la cuenta hace rato.
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.badRequest("No autenticado");
    }
    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { permisos: true, sedes: true },
    });

    if (!user || !user.activo) {
      throw ApiError.badRequest("Sesión inválida o usuario desactivado");
    }

    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol as "ADMIN" | "STAFF",
      permisos: user.permisos.map((p) => p.modulo),
      sedes: user.sedes.map((s) => s.locationId),
    };
    next();
  } catch {
    res.status(401).json({ error: "No autenticado" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.rol !== "ADMIN") {
    return res.status(403).json({ error: "Solo un administrador puede hacer esto" });
  }
  next();
}

// Permite el paso si el usuario es ADMIN o tiene el módulo indicado entre
// sus permisos. Se usa en las rutas de creación/edición/borrado de cada
// módulo; la lectura (GET) queda abierta a cualquier usuario autenticado.
export function requireModule(modulo: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (user.rol === "ADMIN" || user.permisos.includes(modulo)) {
      return next();
    }
    return res.status(403).json({ error: "No tienes permiso para modificar este módulo" });
  };
}

// Indica si el usuario tiene acceso a una sede: ADMIN siempre, y un STAFF
// sin sedes asignadas también (se interpreta como "todas las sedes", para
// no romper cuentas creadas antes de esta funcionalidad).
export function hasSedeAccess(user: { rol: "ADMIN" | "STAFF"; sedes: number[] }, sedeId: number) {
  return user.rol === "ADMIN" || user.sedes.length === 0 || user.sedes.includes(sedeId);
}

// Bloquea crear/editar/eliminar un registro (cita, baño/corte...) en una
// sede que no está entre las asignadas al usuario. `getSedeIds` devuelve
// todas las sedes relevantes de la operación (por ejemplo, al editar: la
// sede actual del registro Y la nueva sede si se está reasignando); basta
// con que una de ellas no sea accesible para bloquear la request.
export function requireSedeAccess(
  getSedeIds: (req: Request) => Promise<(number | null)[]> | (number | null)[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    // getSedeIds puede lanzar (ej. un :id de ruta inválido) o rechazar la
    // promesa; sin este try/catch, ese error quedaría como una promesa no
    // manejada y la request se colgaría en vez de responder con un error.
    Promise.resolve()
      .then(() => getSedeIds(req))
      .then((sedeIds) => {
        const blocked = sedeIds.some((sedeId) => sedeId !== null && !hasSedeAccess(user, sedeId));
        if (blocked) {
          return res.status(403).json({ error: "No tienes acceso a esta sede" });
        }
        next();
      })
      .catch(next);
  };
}