import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { petsService } from "../services/pets.service";
import { getErrorMessage } from "../services/api";
import {
  ESPECIE_LABELS,
  ESTADO_CITA_LABELS,
  ESTADO_TRATAMIENTO_LABELS,
  Pet,
  TIPO_GROOMING_LABELS,
} from "../types";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    petsService
      .getById(Number(id))
      .then(setPet)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <Alert message={error} />;
  if (!pet) return null;

  return (
    <div>
      <PageHeader
        title={pet.nombre}
        subtitle={`${ESPECIE_LABELS[pet.especie]} · ${pet.raza || "Raza no especificada"}`}
        action={
          <Link to="/mascotas">
            <Button variant="secondary">← Volver a mascotas</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {pet.fotoUrl ? (
              <img src={pet.fotoUrl} alt={pet.nombre} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
                🐾
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800">{pet.nombre}</p>
              <p className="text-sm text-slate-500">
                Dueño:{" "}
                {pet.dueno ? (
                  <Link to={`/mascotas?duenoId=${pet.dueno.id}`} className="text-brand-600 hover:underline">
                    {pet.dueno.nombres} {pet.dueno.apellidos}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Sexo</dt>
              <dd className="text-slate-700">{pet.sexo === "MACHO" ? "Macho" : "Hembra"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fecha de nacimiento</dt>
              <dd className="text-slate-700">{formatDate(pet.fechaNacimiento)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Peso</dt>
              <dd className="text-slate-700">{pet.peso ? `${pet.peso} kg` : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Color</dt>
              <dd className="text-slate-700">{pet.color || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Esterilizado</dt>
              <dd>{pet.esterilizado ? <Badge color="green">Sí</Badge> : <Badge color="slate">No</Badge>}</dd>
            </div>
          </dl>
          {pet.notas && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p className="mb-1 font-medium text-slate-700">Notas</p>
              {pet.notas}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">📅 Citas</h2>
            {!pet.citas?.length ? (
              <p className="text-sm text-slate-500">Sin citas registradas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {pet.citas.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2">
                    <span>
                      {formatDateTime(c.fecha)} — {c.motivo}
                    </span>
                    <Badge color="blue">{ESTADO_CITA_LABELS[c.estado]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">💉 Vacunas</h2>
            {!pet.vacunas?.length ? (
              <p className="text-sm text-slate-500">Sin vacunas registradas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {pet.vacunas.map((v) => (
                  <li key={v.id} className="flex items-center justify-between py-2">
                    <span>
                      {v.nombre} — aplicada {formatDate(v.fechaAplicacion)}
                    </span>
                    <span className="text-slate-500">
                      {v.proximaDosis ? `Próxima: ${formatDate(v.proximaDosis)}` : "Dosis única"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">🩺 Tratamientos</h2>
            {!pet.tratamientos?.length ? (
              <p className="text-sm text-slate-500">Sin tratamientos registrados.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {pet.tratamientos.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2">
                    <span>
                      {t.diagnostico} — desde {formatDate(t.fechaInicio)}
                    </span>
                    <Badge color={t.estado === "EN_CURSO" ? "yellow" : t.estado === "FINALIZADO" ? "green" : "red"}>
                      {ESTADO_TRATAMIENTO_LABELS[t.estado]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">✂️ Baños y cortes</h2>
            {!pet.banosCortes?.length ? (
              <p className="text-sm text-slate-500">Sin servicios de grooming registrados.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {pet.banosCortes.map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-2">
                    <span>
                      {TIPO_GROOMING_LABELS[g.tipoServicio]} — {formatDate(g.fecha)}
                    </span>
                    <span className="text-slate-500">{formatCurrency(g.precio)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
