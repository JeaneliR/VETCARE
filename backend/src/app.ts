
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import ownersRoutes from "./routes/owners.routes";
import petsRoutes from "./routes/pets.routes";
import locationsRoutes from "./routes/locations.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import vaccinesRoutes from "./routes/vaccines.routes";
import inventoryRoutes from "./routes/inventory.routes";
import treatmentsRoutes from "./routes/treatments.routes";
import groomingRoutes from "./routes/grooming.routes";
import reviewsRoutes from "./routes/reviews.routes";
import statsRoutes from "./routes/stats.routes";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler";
import { register, httpRequestsTotal, httpRequestDurationSeconds } from "./metrics";

// Configuración principal de Express
const app = express();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

// Métricas de Prometheus: mide cada solicitud que entra (antes de que se
// resuelva la ruta) y registra su duración/código de estado cuando la
// respuesta termina. Se coloca antes del enrutado para capturar TODAS las
// solicitudes, incluidas las que terminan en 404.
app.use((req, res, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer();
  res.on("finish", () => {
    // Si la ruta tiene parámetros (ej. /api/mascotas/:id), usamos el patrón
    // de la ruta en vez del path crudo, para no generar una serie de tiempo
    // distinta por cada id (eso haría crecer la cardinalidad sin límite).
    const routePath =
      req.route && typeof req.baseUrl === "string"
        ? `${req.baseUrl}${req.route.path}`
        : req.path;

    const labels = {
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });
  next();
});

// Endpoint para verificar el estado de la API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "vetcare-backend",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint que Prometheus consulta periódicamente (ver
// docker/prometheus/prometheus.yml) para recolectar las métricas.
// Nota: en un entorno de producción expuesto públicamente conviene
// restringir este endpoint (red interna, IP allowlist o un token
// compartido); aquí queda abierto, igual que /api/health, porque Render
// no separa tráfico interno/externo en el plan gratuito usado por este
// proyecto académico.
app.get("/api/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Autenticación y administración de usuarios
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usersRoutes);

// Rutas por módulo
app.use("/api/duenos", ownersRoutes);
app.use("/api/mascotas", petsRoutes);
app.use("/api/sedes", locationsRoutes);
app.use("/api/citas", appointmentsRoutes);
app.use("/api/vacunas", vaccinesRoutes);
app.use("/api/inventario", inventoryRoutes);
app.use("/api/tratamientos", treatmentsRoutes);
app.use("/api/banos-cortes", groomingRoutes);
app.use("/api/resenas", reviewsRoutes);
app.use("/api/stats", statsRoutes);

// Manejo de rutas inexistentes y errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
