import { FormEvent, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import { SelectField, TextareaField } from "../components/FormField";
import { reviewsService, ReviewInput } from "../services/reviews.service";
import { ownersService } from "../services/owners.service";
import { locationsService } from "../services/locations.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Location, Owner, Review } from "../types";
import { formatDate, fullName } from "../utils/format";

const emptyForm: ReviewInput = {
  calificacion: 5,
  comentario: "",
  duenoId: 0,
  sedeId: 0,
};

export default function ReviewsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("resenas");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [reviewsData, ownersData, locationsData] = await Promise.all([
        reviewsService.list(),
        ownersService.list(),
        locationsService.list(),
      ]);
      setReviews(reviewsData);
      setOwners(ownersData);
      setLocations(locationsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const ownerOptions = useMemo(
    () => owners.map((o) => ({ value: o.id, label: `${o.nombres} ${o.apellidos}` })),
    [owners]
  );
  const locationOptions = useMemo(() => locations.map((l) => ({ value: l.id, label: l.nombre })), [locations]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, duenoId: owners[0]?.id ?? 0, sedeId: locations[0]?.id ?? 0 });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(review: Review) {
    setEditing(review);
    setForm({
      calificacion: review.calificacion,
      comentario: review.comentario,
      duenoId: review.duenoId,
      sedeId: review.sedeId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await reviewsService.update(editing.id, form);
        setSuccess("Reseña actualizada correctamente.");
      } else {
        await reviewsService.create(form);
        setSuccess("Reseña registrada correctamente.");
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await reviewsService.remove(toDelete.id);
      setSuccess("Reseña eliminada.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reseñas"
        subtitle="Opiniones de los dueños sobre nuestras sedes"
        action={canManage ? <Button onClick={openCreate}>+ Nueva reseña</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <EmptyState icon="⭐" title="No hay reseñas registradas" description="Registra la primera reseña con el botón de arriba." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{fullName(review.dueno)}</p>
                  <p className="text-xs text-slate-500">
                    {review.sede?.nombre} · {formatDate(review.fecha)}
                  </p>
                </div>
                <StarRating value={review.calificacion} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{review.comentario}</p>
              {canManage && (
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => openEdit(review)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setToDelete(review)}>
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Editar reseña" : "Nueva reseña"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Dueño"
              required
              options={ownerOptions}
              value={form.duenoId || ""}
              onChange={(e) => setForm({ ...form, duenoId: Number(e.target.value) })}
              placeholder="Selecciona un dueño"
            />
            <SelectField
              label="Sede"
              required
              options={locationOptions}
              value={form.sedeId || ""}
              onChange={(e) => setForm({ ...form, sedeId: Number(e.target.value) })}
              placeholder="Selecciona una sede"
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Calificación</p>
            <StarRating value={form.calificacion} onChange={(v) => setForm({ ...form, calificacion: v })} size="text-2xl" />
          </div>
          <TextareaField
            label="Comentario"
            required
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar reseña"
        message="¿Seguro que deseas eliminar esta reseña?"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
