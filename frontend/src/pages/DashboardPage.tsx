import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import { statsService } from "../services/stats.service";
import { getErrorMessage } from "../services/api";
import { DashboardSummary, ESTADO_CITA_LABELS } from "../types";
import { formatDateTime } from "../utils/format";

const estadoColor: Record<string, "yellow" | "green" | "blue" | "red"> = {
  PENDIENTE: "yellow",
  CONFIRMADA: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService
      .summary()
      .then(setSummary)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen general de la veterinaria" />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {loading && <Spinner />}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Mascotas registradas" value={summary.totalMascotas} icon="🐾" />
            <StatCard label="Dueños registrados" value={summary.totalDuenos} icon="👤" />
            <StatCard label="Sedes activas" value={summary.totalSedes} icon="📍" />
            <StatCard label="Citas hoy" value={summary.citasHoy} icon="📅" accent="bg-sky-50 text-sky-700" />
            <StatCard
              label="Citas pendientes"
              value={summary.citasPendientes}
              icon="⏳"
              accent="bg-amber-50 text-amber-700"
            />
            <StatCard
              label="Vacunas próx. 30 días"
              value={summary.vacunasProximas}
              icon="💉"
              accent="bg-violet-50 text-violet-700"
            />
            <StatCard
              label="Tratamientos en curso"
              value={summary.tratamientosEnCurso}
              icon="🩺"
              accent="bg-rose-50 text-rose-700"
            />
            <StatCard
              label="Baños/cortes del mes"
              value={summary.serviciosGroomingMes}
              icon="✂️"
              accent="bg-teal-50 text-teal-700"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-base font-semibold text-slate-800">Próximas citas</h2>
              {summary.proximasCitas.length === 0 ? (
                <EmptyState icon="📅" title="No hay citas próximas" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {summary.proximasCitas.map((cita) => (
                    <li key={cita.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-slate-700">
                          {cita.mascota?.nombre} · {cita.motivo}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(cita.fecha)} — {cita.sede?.nombre}
                        </p>
                      </div>
                      <Badge color={estadoColor[cita.estado]}>{ESTADO_CITA_LABELS[cita.estado]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/app/citas"
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todas las citas →
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-slate-800">Satisfacción de clientes</h2>
              <p className="text-4xl font-bold text-brand-700">
                {summary.calificacionPromedio ? summary.calificacionPromedio.toFixed(1) : "—"}
                <span className="text-lg text-slate-400"> / 5</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">Basado en {summary.totalResenas} reseñas</p>
              <Link
                to="/app/resenas"
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver reseñas →
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { to: "/app/duenos", label: "Dueños", icon: "👤" },
              { to: "/app/mascotas", label: "Mascotas", icon: "🐾" },
              { to: "/app/citas", label: "Citas", icon: "📅" },
              { to: "/app/vacunas", label: "Vacunas", icon: "💉" },
              { to: "/app/tratamientos", label: "Tratamientos", icon: "🩺" },
              { to: "/app/banos-cortes", label: "Baños/Cortes", icon: "✂️" },
              { to: "/app/sedes", label: "Sedes", icon: "📍" },
              { to: "/app/resenas", label: "Reseñas", icon: "⭐" },
            ].map((shortcut) => (
              <Link
                key={shortcut.to}
                to={shortcut.to}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">{shortcut.icon}</span>
                <span className="text-xs font-medium text-slate-600">{shortcut.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
