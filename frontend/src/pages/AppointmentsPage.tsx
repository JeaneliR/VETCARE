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
import { appointmentsService, AppointmentInput } from "../services/appointments.service";
import { petsService } from "../services/pets.service";
import { locationsService } from "../services/locations.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Appointment, EstadoCita, ESTADO_CITA_LABELS, Location, Pet } from "../types";
import { formatDateTime, toInputDateTime } from "../utils/format";

const emptyForm: AppointmentInput = {
  fecha: "",
  motivo: "",
  veterinario: "",
  estado: "PENDIENTE",
  notas: "",
  mascotaId: 0,
  sedeId: 0,
};

const estadoColor: Record<EstadoCita, "yellow" | "blue" | "green" | "red"> = {
  PENDIENTE: "yellow",
  CONFIRMADA: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
};

export default function AppointmentsPage() {
  const { user, hasPermission } = useAuth();
  const canManage = hasPermission("citas");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoCita | "">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState<AppointmentInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [appointmentsData, petsData, locationsData] = await Promise.all([
        appointmentsService.list(estadoFilter ? { estado: estadoFilter } : undefined),
        petsService.list(),
        locationsService.list(),
      ]);
      setAppointments(appointmentsData);
      setPets(petsData);
      setLocations(locationsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFilter]);

  const petOptions = useMemo(() => pets.map((p) => ({ value: p.id, label: p.nombre })), [pets]);
  const allowedLocations = useMemo(() => {
    if (!user || user.rol === "ADMIN" || user.sedes.length === 0) return locations;
    return locations.filter((l) => user.sedes.includes(l.id));
  }, [locations, user]);
  const locationOptions = useMemo(
    () => allowedLocations.map((l) => ({ value: l.id, label: l.nombre })),
    [allowedLocations]
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, mascotaId: pets[0]?.id ?? 0, sedeId: allowedLocations[0]?.id ?? 0 });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setForm({
      fecha: toInputDateTime(appointment.fecha),
      motivo: appointment.motivo,
      veterinario: appointment.veterinario,
      estado: appointment.estado,
      notas: appointment.notas ?? "",
      mascotaId: appointment.mascotaId,
      sedeId: appointment.sedeId,
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
        await appointmentsService.update(editing.id, form);
        setSuccess("Cita actualizada correctamente.");
      } else {
        await appointmentsService.create(form);
        setSuccess("Cita creada correctamente.");
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
      await appointmentsService.remove(toDelete.id);
      setSuccess("Cita eliminada.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Appointment>[] = [
    { header: "Fecha y hora", accessor: (a) => formatDateTime(a.fecha) },
    { header: "Mascota", accessor: (a) => a.mascota?.nombre ?? "—" },
    { header: "Motivo", accessor: (a) => a.motivo },
    { header: "Veterinario", accessor: (a) => a.veterinario },
    { header: "Sede", accessor: (a) => a.sede?.nombre ?? "—" },
    { header: "Estado", accessor: (a) => <Badge color={estadoColor[a.estado]}>{ESTADO_CITA_LABELS[a.estado]}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Citas"
        subtitle="Agenda de consultas y controles veterinarios"
        action={canManage ? <Button onClick={openCreate}>+ Nueva cita</Button> : undefined}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["", "PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"] as const).map((estado) => (
          <button
            key={estado || "todas"}
            onClick={() => setEstadoFilter(estado)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              estadoFilter === estado
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {estado ? ESTADO_CITA_LABELS[estado] : "Todas"}
          </button>
        ))}
      </div>

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : appointments.length === 0 ? (
        <EmptyState icon="📅" title="No hay citas registradas" description="Agenda la primera cita con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          rowKey={(a) => a.id}
          actions={
            canManage
              ? (a) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => openEdit(a)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setToDelete(a)}>
                      Eliminar
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar cita" : "Nueva cita"} onClose={() => setModalOpen(false)}>
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
              label="Sede"
              required
              options={locationOptions}
              value={form.sedeId || ""}
              onChange={(e) => setForm({ ...form, sedeId: Number(e.target.value) })}
              placeholder="Selecciona una sede"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha y hora"
              type="datetime-local"
              required
              value={form.fecha as string}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
            <SelectField
              label="Estado"
              required
              options={Object.entries(ESTADO_CITA_LABELS).map(([value, label]) => ({ value, label }))}
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoCita })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Motivo"
              required
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
            <InputField
              label="Veterinario"
              required
              value={form.veterinario}
              onChange={(e) => setForm({ ...form, veterinario: e.target.value })}
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
        title="Eliminar cita"
        message={`¿Seguro que deseas eliminar la cita de ${toDelete?.mascota?.nombre ?? "esta mascota"}?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
