import { FormEvent, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import Badge from "../components/Badge";
import { InputField, TextareaField } from "../components/FormField";
import { locationsService, LocationInput } from "../services/locations.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Location } from "../types";

const emptyForm: LocationInput = {
  nombre: "",
  direccion: "",
  ciudad: "",
  telefono: "",
  email: "",
  horario: "",
  latitud: undefined,
  longitud: undefined,
  imagenUrl: "",
  activa: true,
};

export default function LocationsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("sedes");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      setLocations(await locationsService.list());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(location: Location) {
    setEditing(location);
    setForm({
      nombre: location.nombre,
      direccion: location.direccion,
      ciudad: location.ciudad,
      telefono: location.telefono,
      email: location.email ?? "",
      horario: location.horario ?? "",
      latitud: location.latitud ?? undefined,
      longitud: location.longitud ?? undefined,
      imagenUrl: location.imagenUrl ?? "",
      activa: location.activa,
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
        await locationsService.update(editing.id, form);
        setSuccess("Sede actualizada correctamente.");
      } else {
        await locationsService.create(form);
        setSuccess("Sede creada correctamente.");
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
      await locationsService.remove(toDelete.id);
      setSuccess("Sede eliminada.");
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
        title="Sedes y ubicación"
        subtitle="Locales físicos de la veterinaria"
        action={canManage ? <Button onClick={openCreate}>+ Nueva sede</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : locations.length === 0 ? (
        <EmptyState icon="📍" title="No hay sedes registradas" description="Registra la primera sede con el botón de arriba." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {loc.imagenUrl && (
                <img src={loc.imagenUrl} alt={loc.nombre} className="h-36 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{loc.nombre}</h3>
                  <Badge color={loc.activa ? "green" : "red"}>{loc.activa ? "Activa" : "Inactiva"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  📍 {loc.direccion}, {loc.ciudad}
                </p>
                <p className="text-sm text-slate-500">📞 {loc.telefono}</p>
                {loc.horario && <p className="text-sm text-slate-500">🕒 {loc.horario}</p>}
                {loc.latitud != null && loc.longitud != null && (
                  <a
                    className="mt-1 inline-block text-xs text-brand-600 hover:underline"
                    href={`https://www.google.com/maps?q=${loc.latitud},${loc.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver en el mapa →
                  </a>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <StarRating value={Math.round(loc.calificacionPromedio ?? 0)} />
                  <span className="text-xs text-slate-500">
                    {loc.calificacionPromedio ? loc.calificacionPromedio.toFixed(1) : "Sin reseñas"} (
                    {loc._count?.resenas ?? 0})
                  </span>
                </div>
                {canManage && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => openEdit(loc)}>
                      Editar
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={() => setToDelete(loc)}>
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Editar sede" : "Nueva sede"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <InputField
            label="Nombre de la sede"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Dirección"
              required
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
            <InputField
              label="Ciudad"
              required
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Teléfono"
              required
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <InputField
              label="Email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <InputField
            label="Horario de atención"
            placeholder="Lun a Sáb 9:00 - 20:00"
            value={form.horario ?? ""}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Latitud"
              type="number"
              step="0.0001"
              value={form.latitud ?? ""}
              onChange={(e) => setForm({ ...form, latitud: e.target.value ? Number(e.target.value) : undefined })}
            />
            <InputField
              label="Longitud"
              type="number"
              step="0.0001"
              value={form.longitud ?? ""}
              onChange={(e) => setForm({ ...form, longitud: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <InputField
            label="URL de imagen (opcional)"
            value={form.imagenUrl ?? ""}
            onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.activa}
              onChange={(e) => setForm({ ...form, activa: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Sede activa (si se desmarca, deja de mostrarse en la página pública)
          </label>
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
        title="Eliminar sede"
        message={`¿Seguro que deseas eliminar "${toDelete?.nombre}"? También se eliminarán sus reseñas asociadas.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
