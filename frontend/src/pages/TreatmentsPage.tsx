import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { treatmentsService, TreatmentInput } from "../services/treatments.service";
import { petsService } from "../services/pets.service";
import { getErrorMessage } from "../services/api";
import { EstadoTratamiento, ESTADO_TRATAMIENTO_LABELS, Pet, Treatment } from "../types";
import { formatDate, toInputDate } from "../utils/format";

const emptyForm: TreatmentInput = {
  diagnostico: "",
  descripcion: "",
  medicamentos: "",
  fechaInicio: "",
  fechaFin: "",
  veterinario: "",
  estado: "EN_CURSO",
  mascotaId: 0,
};

const estadoColor: Record<EstadoTratamiento, "yellow" | "green" | "red"> = {
  EN_CURSO: "yellow",
  FINALIZADO: "green",
  SUSPENDIDO: "red",
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [form, setForm] = useState<TreatmentInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Treatment | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [treatmentsData, petsData] = await Promise.all([treatmentsService.list(), petsService.list()]);
      setTreatments(treatmentsData);
      setPets(petsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const petOptions = useMemo(() => pets.map((p) => ({ value: p.id, label: p.nombre })), [pets]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, mascotaId: pets[0]?.id ?? 0 });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(treatment: Treatment) {
    setEditing(treatment);
    setForm({
      diagnostico: treatment.diagnostico,
      descripcion: treatment.descripcion,
      medicamentos: treatment.medicamentos ?? "",
      fechaInicio: toInputDate(treatment.fechaInicio),
      fechaFin: toInputDate(treatment.fechaFin),
      veterinario: treatment.veterinario,
      estado: treatment.estado,
      mascotaId: treatment.mascotaId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, fechaFin: form.fechaFin || undefined };
      if (editing) {
        await treatmentsService.update(editing.id, payload);
        setSuccess("Tratamiento actualizado correctamente.");
      } else {
        await treatmentsService.create(payload);
        setSuccess("Tratamiento registrado correctamente.");
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
      await treatmentsService.remove(toDelete.id);
      setSuccess("Tratamiento eliminado.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Treatment>[] = [
    { header: "Diagnóstico", accessor: (t) => t.diagnostico },
    { header: "Mascota", accessor: (t) => t.mascota?.nombre ?? "—" },
    { header: "Inicio", accessor: (t) => formatDate(t.fechaInicio) },
    { header: "Fin", accessor: (t) => formatDate(t.fechaFin) },
    { header: "Veterinario", accessor: (t) => t.veterinario },
    { header: "Estado", accessor: (t) => <Badge color={estadoColor[t.estado]}>{ESTADO_TRATAMIENTO_LABELS[t.estado]}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Tratamientos"
        subtitle="Diagnósticos y tratamientos médicos"
        action={<Button onClick={openCreate}>+ Nuevo tratamiento</Button>}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : treatments.length === 0 ? (
        <EmptyState icon="🩺" title="No hay tratamientos registrados" description="Registra el primer tratamiento con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={treatments}
          rowKey={(t) => t.id}
          actions={(t) => (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => openEdit(t)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setToDelete(t)}>
                Eliminar
              </Button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Editar tratamiento" : "Nuevo tratamiento"}
        onClose={() => setModalOpen(false)}
        widthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Mascota"
              required
              options={petOptions}
              value={form.mascotaId || ""}
              onChange={(e) => setForm({ ...form, mascotaId: Number(e.target.value) })}
              placeholder="Selecciona una mascota"
            />
            <SelectField
              label="Estado"
              required
              options={Object.entries(ESTADO_TRATAMIENTO_LABELS).map(([value, label]) => ({ value, label }))}
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoTratamiento })}
            />
          </div>
          <InputField
            label="Diagnóstico"
            required
            value={form.diagnostico}
            onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
          />
          <TextareaField
            label="Descripción del tratamiento"
            required
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <InputField
            label="Medicamentos"
            value={form.medicamentos ?? ""}
            onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha de inicio"
              type="date"
              required
              value={form.fechaInicio as string}
              onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
            />
            <InputField
              label="Fecha de fin"
              type="date"
              value={(form.fechaFin as string) ?? ""}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
            />
          </div>
          <InputField
            label="Veterinario"
            required
            value={form.veterinario}
            onChange={(e) => setForm({ ...form, veterinario: e.target.value })}
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
        title="Eliminar tratamiento"
        message={`¿Seguro que deseas eliminar el tratamiento "${toDelete?.diagnostico}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
