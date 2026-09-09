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
import { vaccinesService, VaccineInput } from "../services/vaccines.service";
import { petsService } from "../services/pets.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Pet, Vaccine } from "../types";
import { formatDate, toInputDate } from "../utils/format";

const emptyForm: VaccineInput = {
  nombre: "",
  fechaAplicacion: "",
  proximaDosis: "",
  veterinario: "",
  lote: "",
  notas: "",
  mascotaId: 0,
};

function isProximaVencida(proximaDosis?: string | null) {
  if (!proximaDosis) return false;
  return new Date(proximaDosis).getTime() < Date.now();
}

function isProximaCercana(proximaDosis?: string | null) {
  if (!proximaDosis) return false;
  const diff = new Date(proximaDosis).getTime() - Date.now();
  return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
}

export default function VaccinesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("vacunas");
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vaccine | null>(null);
  const [form, setForm] = useState<VaccineInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Vaccine | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [vaccinesData, petsData] = await Promise.all([vaccinesService.list(), petsService.list()]);
      setVaccines(vaccinesData);
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

  function openEdit(vaccine: Vaccine) {
    setEditing(vaccine);
    setForm({
      nombre: vaccine.nombre,
      fechaAplicacion: toInputDate(vaccine.fechaAplicacion),
      proximaDosis: toInputDate(vaccine.proximaDosis),
      veterinario: vaccine.veterinario,
      lote: vaccine.lote ?? "",
      notas: vaccine.notas ?? "",
      mascotaId: vaccine.mascotaId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, proximaDosis: form.proximaDosis || undefined };
      if (editing) {
        await vaccinesService.update(editing.id, payload);
        setSuccess("Vacuna actualizada correctamente.");
      } else {
        await vaccinesService.create(payload);
        setSuccess("Vacuna registrada correctamente.");
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
      await vaccinesService.remove(toDelete.id);
      setSuccess("Vacuna eliminada.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Vaccine>[] = [
    { header: "Vacuna", accessor: (v) => v.nombre },
    { header: "Mascota", accessor: (v) => v.mascota?.nombre ?? "—" },
    { header: "Fecha aplicación", accessor: (v) => formatDate(v.fechaAplicacion) },
    {
      header: "Próxima dosis",
      accessor: (v) =>
        v.proximaDosis ? (
          <span className="flex items-center gap-2">
            {formatDate(v.proximaDosis)}
            {isProximaVencida(v.proximaDosis) && <Badge color="red">Vencida</Badge>}
            {isProximaCercana(v.proximaDosis) && <Badge color="yellow">Próxima</Badge>}
          </span>
        ) : (
          "Dosis única"
        ),
    },
    { header: "Veterinario", accessor: (v) => v.veterinario },
    { header: "Lote", accessor: (v) => v.lote || "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Vacunas"
        subtitle="Control de vacunación de las mascotas"
        action={canManage ? <Button onClick={openCreate}>+ Nueva vacuna</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : vaccines.length === 0 ? (
        <EmptyState icon="💉" title="No hay vacunas registradas" description="Registra la primera vacuna con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={vaccines}
          rowKey={(v) => v.id}
          actions={
            canManage
              ? (v) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => openEdit(v)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setToDelete(v)}>
                      Eliminar
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar vacuna" : "Nueva vacuna"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <SelectField
            label="Mascota"
            required
            options={petOptions}
            value={form.mascotaId || ""}
            onChange={(e) => setForm({ ...form, mascotaId: Number(e.target.value) })}
            placeholder="Selecciona una mascota"
          />
          <InputField
            label="Nombre de la vacuna"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha de aplicación"
              type="date"
              required
              value={form.fechaAplicacion as string}
              onChange={(e) => setForm({ ...form, fechaAplicacion: e.target.value })}
            />
            <InputField
              label="Próxima dosis"
              type="date"
              value={(form.proximaDosis as string) ?? ""}
              onChange={(e) => setForm({ ...form, proximaDosis: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Veterinario"
              required
              value={form.veterinario}
              onChange={(e) => setForm({ ...form, veterinario: e.target.value })}
            />
            <InputField
              label="Lote"
              value={form.lote ?? ""}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />
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
        title="Eliminar vacuna"
        message={`¿Seguro que deseas eliminar el registro de "${toDelete?.nombre}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
