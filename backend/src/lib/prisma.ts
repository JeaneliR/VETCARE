import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma Client reutilizada en toda la app
// (evita abrir demasiadas conexiones en desarrollo con hot-reload).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export default prisma;
