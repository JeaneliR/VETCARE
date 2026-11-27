import client from "prom-client";

// Registro propio (en vez de usar el registro global de prom-client) para
// no arrastrar métricas de otras librerías que también usen prom-client,
// y para poder testear este módulo de forma aislada si hiciera falta.
export const register = new client.Registry();

// Métricas por defecto de Node.js (uso de memoria, event loop lag, CPU,
// handles/descriptores activos, etc.) — esto es lo que Prometheus/Grafana
// necesitan para graficar la salud del proceso sin tener que instrumentar
// nada manualmente.
client.collectDefaultMetrics({ register, prefix: "vetcare_" });

// Métricas propias de la API: cuántas solicitudes llegan y cuánto tardan,
// con etiquetas por método, ruta y código de estado para poder desglosar
// en Grafana (ej. "tasa de error 5xx del módulo de citas").
export const httpRequestsTotal = new client.Counter({
  name: "vetcare_http_requests_total",
  help: "Total de solicitudes HTTP recibidas por la API",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "vetcare_http_request_duration_seconds",
  help: "Duración de las solicitudes HTTP en segundos",
  labelNames: ["method", "route", "status_code"] as const,
  // Buckets pensados para una API CRUD simple: la mayoría de respuestas
  // debería caer bajo 300ms; los últimos buckets detectan consultas lentas.
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});
