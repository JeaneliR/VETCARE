import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { InputField, SelectField, TextareaField } from "../components/FormField";
import { petsService, PetInput } from "../services/pets.service";
import { ownersService } from "../services/owners.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ESPECIE_LABELS, Especie, Owner, Pet, Sexo } from "../types";
import { toInputDate } from "../utils/format";

const emptyForm: PetInput = {
  nombre: "",
  especie: "PERRO",
  raza: "",
  sexo: "MACHO",
  fechaNacimiento: "",
  peso: undefined,
  color: "",
  esterilizado: false,
  notas: "",
  fotoUrl: "",
  duenoId: 0,
};

export default function PetsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("mascotas");
  const [searchParams] = useSearchParams();
  const duenoIdFilter = searchParams.get("duenoId");

  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [petsData, ownersData] = await Promise.all([
        petsService.list(duenoIdFilter ? Number(duenoIdFilter) : undefined),
        ownersService.list(),
      ]);
      setPets(petsData);
      setOwners(ownersData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duenoIdFilter]);

  const ownerOptions = useMemo(
    () => owners.map((o) => ({ value: o.id, label: `${o.nombres} ${o.apellidos}` })),
    [owners]
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, duenoId: duenoIdFilter ? Number(duenoIdFilter) : owners[0]?.id ?? 0 });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(pet: Pet) {
    setEditing(pet);
    setForm({
      nombre: pet.nombre,
      especie: pet.especie,
      raza: pet.raza ?? "",
      sexo: pet.sexo,
      fechaNacimiento: toInputDate(pet.fechaNacimiento),
      peso: pet.peso ?? undefined,
      color: pet.color ?? "",
      esterilizado: pet.esterilizado,
      notas: pet.notas ?? "",
      fotoUrl: pet.fotoUrl ?? "",
      duenoId: pet.duenoId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, peso: form.peso ? Number(form.peso) : undefined };
      if (editing) {
        await petsService.update(editing.id, payload);
        setSuccess("Mascota actualizada correctamente.");
      } else {
        await petsService.create(payload);
        setSuccess("Mascota registrada correctamente.");
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
      await petsService.remove(toDelete.id);
      setSuccess("Mascota eliminada.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Pet>[] = [
    {
      header: "Nombre",
      accessor: (p) => (
        <Link to={`/app/mascotas/${p.id}`} className="font-medium text-brand-700 hover:underline">
          {p.nombre}
        </Link>
      ),
    },
    { header: "Especie", accessor: (p) => ESPECIE_LABELS[p.especie] },
    { header: "Raza", accessor: (p) => p.raza || "—" },
    { header: "Sexo", accessor: (p) => (p.sexo === "MACHO" ? "Macho" : "Hembra") },
    { header: "Dueño", accessor: (p) => (p.dueno ? `${p.dueno.nombres} ${p.dueno.apellidos}` : "—") },
    {
      header: "Esterilizado",
      accessor: (p) => (p.esterilizado ? <Badge color="green">Sí</Badge> : <Badge color="slate">No</Badge>),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mascotas"
        subtitle={
          duenoIdFilter
            ? `Mostrando mascotas del dueño seleccionado`
            : "Historial y datos de todas las mascotas"
        }
        action={canManage ? <Button onClick={openCreate}>+ Nueva mascota</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : pets.length === 0 ? (
        <EmptyState icon="🐾" title="No hay mascotas registradas" description="Registra la primera mascota con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={pets}
          rowKey={(p) => p.id}
          actions={(p) => (
            <div className="flex justify-end gap-2">
              <Link to={`/app/mascotas/${p.id}`}>
                <Button variant="secondary">Ver ficha</Button>
              </Link>
              {canManage && (
                <>
                  <Button variant="secondary" onClick={() => openEdit(p)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setToDelete(p)}>
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar mascota" : "Nueva mascota"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <SelectField
              label="Dueño"
              required
              options={ownerOptions}
              value={form.duenoId || ""}
              onChange={(e) => setForm({ ...form, duenoId: Number(e.target.value) })}
              placeholder="Selecciona un dueño"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Especie"
              required
              options={Object.entries(ESPECIE_LABELS).map(([value, label]) => ({ value, label }))}
              value={form.especie}
              onChange={(e) => setForm({ ...form, especie: e.target.value as Especie })}
            />
            <SelectField
              label="Sexo"
              required
              options={[
                { value: "MACHO", label: "Macho" },
                { value: "HEMBRA", label: "Hembra" },
              ]}
              value={form.sexo}
              onChange={(e) => setForm({ ...form, sexo: e.target.value as Sexo })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Raza"
              value={form.raza ?? ""}
              onChange={(e) => setForm({ ...form, raza: e.target.value })}
            />
            <InputField
              label="Color"
              value={form.color ?? ""}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha de nacimiento"
              type="date"
              value={form.fechaNacimiento ?? ""}
              onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
            />
            <InputField
              label="Peso (kg)"
              type="number"
              step="0.1"
              min="0"
              value={form.peso ?? ""}
              onChange={(e) => setForm({ ...form, peso: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.esterilizado}
              onChange={(e) => setForm({ ...form, esterilizado: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Esterilizado / castrado
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Foto de la mascota <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // La imagen es opcional y se guarda como data URL para no
                // requerir un servidor de archivos adicional.
                if (file.size > 5 * 1024 * 1024) {
                  setFormError("La imagen no puede superar los 5 MB.");
                  e.currentTarget.value = "";
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setForm({ ...form, fotoUrl: reader.result });
                    setFormError("");
                  }
                };
                reader.readAsDataURL(file);
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
            />
            <p className="mt-1 text-xs text-slate-500">
              Puedes seleccionar una imagen desde tu dispositivo. Máximo 5 MB.
            </p>
            {form.fotoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={form.fotoUrl}
                  alt="Vista previa de la mascota"
                  className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setForm({ ...form, fotoUrl: "" })}
                >
                  Quitar foto
                </Button>
              </div>
            )}
          </div>
          <TextareaField
            label="Notas"
            value={form.notas ?? ""}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
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
        title="Eliminar mascota"
        message={`¿Seguro que deseas eliminar a ${toDelete?.nombre}? Se eliminará también su historial médico.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
