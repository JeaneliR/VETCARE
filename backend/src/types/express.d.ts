// Extiende el tipo Request de Express para adjuntar el usuario autenticado.
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nombre: string;
        email: string;
        rol: "ADMIN" | "STAFF";
        permisos: string[];
        // IDs de las sedes a las que este usuario queda restringido. Un
        // arreglo vacío significa "todas las sedes" (sin restricción).
        sedes: number[];
      };
    }
  }
}

export {};