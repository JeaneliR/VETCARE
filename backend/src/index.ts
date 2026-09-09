import "dotenv/config";
import express from "express";
import cors from "cors";

import ownersRoutes from "./routes/owners.routes";
import petsRoutes from "./routes/pets.routes";
import locationsRoutes from "./routes/locations.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import vaccinesRoutes from "./routes/vaccines.routes";
import treatmentsRoutes from "./routes/treatments.routes";
import groomingRoutes from "./routes/grooming.routes";
import reviewsRoutes from "./routes/reviews.routes";
import statsRoutes from "./routes/stats.routes";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "vetcare-backend", timestamp: new Date().toISOString() });
});

// Rutas por módulo
app.use("/api/duenos", ownersRoutes);
app.use("/api/mascotas", petsRoutes);
app.use("/api/sedes", locationsRoutes);
app.use("/api/citas", appointmentsRoutes);
app.use("/api/vacunas", vaccinesRoutes);
app.use("/api/tratamientos", treatmentsRoutes);
app.use("/api/banos-cortes", groomingRoutes);
app.use("/api/resenas", reviewsRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 VetCare API escuchando en http://localhost:${PORT}`);
});
