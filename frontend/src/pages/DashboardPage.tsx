import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import StarRating from "../components/StarRating";
import { SelectField } from "../components/FormField";
import { statsService } from "../services/stats.service";
import { locationsService } from "../services/locations.service";
import { reviewsService } from "../services/reviews.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { DashboardSummary, ESTADO_CITA_LABELS, Location, Review, TIPO_GROOMING_LABELS } from "../types";
import { formatCurrency, formatDateTime, reviewAuthorName } from "../utils/format";

const estadoColor: Record<string, "yellow" | "green" | "blue" | "red"> = {
  PENDIENTE: "yellow",
  CONFIRMADA: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
};

const DIA_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "ADMIN";

  const [locations, setLocations] = useState<Location[]>([]);
  const [sedeFilter, setSedeFilter] = useState<number | "">("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<number | null>(null);

  useEffect(() => {
    locationsService.list().then(setLocations).catch(() => setLocations([]));
  }, []);

  async function loadSummary() {
    setLoading(true);
    try {
      const [summaryData, reviewsData] = await Promise.all([
        statsService.summary(sedeFilter || undefined),
        reviewsService.list(sedeFilter ? { sedeId: sedeFilter } : undefined),
      ]);
      setSummary(summaryData);
      const latestReviews = reviewsData.slice(0, 5);
      setReviews(latestReviews);
      setReplyDrafts((prev) => {
        const next = { ...prev };
        latestReviews.forEach((r) => {
          if (next[r.id] === undefined) next[r.id] = r.respuestaAdmin ?? "";
        });
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeFilter]);

  async function handleDeleteReview() {
    if (!reviewToDelete) return;
    setDeletingReview(true);
    try {
      await reviewsService.remove(reviewToDelete.id);
      setReviewToDelete(null);
      await loadSummary();
    } catch (err) {
      setError(getErrorMessage(err));
      setReviewToDelete(null);
    } finally {
      setDeletingReview(false);
    }
  }

  async function handleSaveReply(review: Review) {
    const texto = (replyDrafts[review.id] ?? "").trim();
    setSavingReplyId(review.id);
    try {
      await reviewsService.update(review.id, { respuestaAdmin: texto });
      await loadSummary();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingReplyId(null);
    }
  }

  function handleExportCsv() {
    if (!summary) return;
    const rows: (string | number)[][] = [
      ["Métrica", "Valor"],
      ["Mascotas registradas", summary.totalMascotas],
      ["Dueños registrados", summary.totalDuenos],
      ["Sedes", summary.totalSedes],
      ["Citas hoy", summary.citasHoy],
      ["Citas pendientes", summary.citasPendientes],
      ["Vacunas próx. 30 días", summary.vacunasProximas],
      ["Tratamientos en curso", summary.tratamientosEnCurso],
      ["Baños/cortes del mes", summary.serviciosGroomingMes],
      ["Ingresos baños/cortes del mes", summary.ingresosGroomingMes],
      ["Calificación promedio", summary.calificacionPromedio ?? ""],
      ["Total reseñas", summary.totalResenas],
      [],
      ["Sede", "Reseñas", "Promedio"],
      ...summary.resenasPorSede.map((s) => [s.nombre, s.total, s.promedio ?? ""]),
      [],
      ["Tipo de servicio (grooming)", "Cantidad", "Ingresos del mes"],
      ...summary.ingresosPorTipoServicio.map((s) => [
        TIPO_GROOMING_LABELS[s.tipoServicio],
        s.cantidad,
        s.total,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-vetcare-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const maxCitasDia = useMemo(
    () => Math.max(1, ...(summary?.citasPorDia.map((d) => d.cantidad) ?? [1])),
    [summary]
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de la veterinaria"
        action={
          <div className="flex items-end gap-3">
            <div className="w-56">
              <SelectField
                label="Sede"
                value={sedeFilter}
                onChange={(e) => setSedeFilter(e.target.value ? Number(e.target.value) : "")}
                options={[
                  { value: "", label: "Todas las sedes" },
                  ...locations.map((l) => ({ value: l.id, label: l.nombre })),
                ]}
              />
            </div>
            {summary && (
              <button
                onClick={handleExportCsv}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ⬇️ Exportar CSV
              </button>
            )}
          </div>
        }
      />

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
            <StatCard
              label="Ingresos grooming (mes)"
              value={formatCurrency(summary.ingresosGroomingMes)}
              icon="💰"
              accent="bg-emerald-50 text-emerald-700"
            />
          </div>

          {summary.ingresosPorTipoServicio.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-slate-800">
                Ingresos del mes por tipo de servicio (baños/cortes)
              </h2>
              <ul className="divide-y divide-slate-100">
                {summary.ingresosPorTipoServicio.map((item) => (
                  <li key={item.tipoServicio} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-600">
                      {TIPO_GROOMING_LABELS[item.tipoServicio]}
                      <span className="ml-2 text-xs text-slate-400">({item.cantidad})</span>
                    </span>
                    <span className="font-medium text-slate-800">{formatCurrency(item.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

              {!sedeFilter && summary.resenasPorSede.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {summary.resenasPorSede.map((s) => (
                    <li key={s.sedeId} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{s.nombre}</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        {s.promedio ? s.promedio.toFixed(1) : "—"}
                        <span className="text-xs text-slate-400">({s.total})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-slate-800">Citas de los últimos 7 días</h2>
              <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
                {summary.citasPorDia.map((d) => {
                  const heightPct = (d.cantidad / maxCitasDia) * 100;
                  const dia = DIA_LABELS[new Date(d.fecha + "T00:00:00").getDay()];
                  return (
                    <div key={d.fecha} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium text-slate-500">{d.cantidad}</span>
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-brand-500"
                          style={{ height: `${Math.max(heightPct, d.cantidad > 0 ? 6 : 2)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">{dia}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Últimas reseñas</h2>
                <Link to="/#resenas" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Ver en la web →
                </Link>
              </div>
              {reviews.length === 0 ? (
                <EmptyState icon="⭐" title="Sin reseñas todavía" />
              ) : (
                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <StarRating value={review.calificacion} />
                          <p className="mt-1 text-sm text-slate-600">"{review.comentario}"</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {reviewAuthorName(review)} · {review.sede?.nombre}
                          </p>
                          {review.respuestaAdmin && !isAdmin && (
                            <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                              <span className="font-semibold">Respuesta de VetCare:</span> {review.respuestaAdmin}
                            </p>
                          )}
                          {isAdmin && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                value={replyDrafts[review.id] ?? ""}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                                }
                                placeholder="Responder públicamente a esta reseña..."
                                className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                              <button
                                onClick={() => handleSaveReply(review)}
                                disabled={savingReplyId === review.id}
                                className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
                              >
                                {savingReplyId === review.id ? "Guardando..." : "Guardar"}
                              </button>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setReviewToDelete(review)}
                            className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
                            title="Eliminar reseña"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Las reseñas las dejan los clientes desde la página web, no desde aquí.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { to: "/app/duenos", label: "Dueños", icon: "👤" },
              { to: "/app/mascotas", label: "Mascotas", icon: "🐾" },
              { to: "/app/citas", label: "Citas", icon: "📅" },
              { to: "/app/vacunas", label: "Vacunas", icon: "💉" },
              { to: "/app/tratamientos", label: "Tratamientos", icon: "🩺" },
              { to: "/app/banos-cortes", label: "Baños/Cortes", icon: "✂️" },
              { to: "/app/sedes", label: "Sedes", icon: "📍" },
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

      <ConfirmDialog
        open={!!reviewToDelete}
        title="Eliminar reseña"
        message="¿Seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer."
        onCancel={() => setReviewToDelete(null)}
        onConfirm={handleDeleteReview}
        loading={deletingReview}
      />
    </div>
  );
}
