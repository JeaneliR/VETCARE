import { FormEvent, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import DataTable, { Column } from "../components/DataTable";
import { InputField, SelectField, TextareaField } from "../components/FormField";
import { groomingService, GroomingInput } from "../services/grooming.service";
import { petsService } from "../services/pets.service";
import { locationsService } from "../services/locations.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Grooming, Location, Pet, TIPO_GROOMING_LABELS, TipoServicioGrooming } from "../types";
import { formatCurrency, formatDate, toInputDate } from "../utils/format";

const emptyForm: GroomingInput = {
  tipoServicio: "BANO",
  fecha: "",
  precio: 0,
  encargado: "",
  notas: "",
  mascotaId: 0,
  sedeId: 0,
};

export default function GroomingPage() {
  const { user, hasPermission } = useAuth();
  const canManage = hasPermission("grooming");
  const [services, setServices] = useState<Grooming[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grooming | null>(null);
  const [form, setForm] = useState<GroomingInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Grooming | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [servicesData, petsData, locationsData] = await Promise.all([
        groomingService.list(),
        petsService.list(),
        locationsService.list(),
      ]);
      setServices(servicesData);
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
  }, []);

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
    setForm({ ...emptyForm, mascotaId: pets[0]?.id ?? 0, sedeId: allowedLocations[0]?.id ?? 0});
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(service: Grooming) {
    setEditing(service);
    setForm({
      tipoServicio: service.tipoServicio,
      fecha: toInputDate(service.fecha),
      precio: service.precio,
      encargado: service.encargado,
      notas: service.notas ?? "",
      mascotaId: service.mascotaId,
      sedeId: service.sedeId,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, precio: Number(form.precio) };
      if (editing) {
        await groomingService.update(editing.id, payload);
        setSuccess("Servicio actualizado correctamente.");
      } else {
        await groomingService.create(payload);
        setSuccess("Servicio registrado correctamente.");
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
      await groomingService.remove(toDelete.id);
      setSuccess("Servicio eliminado.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Grooming>[] = [
    { header: "Servicio", accessor: (g) => TIPO_GROOMING_LABELS[g.tipoServicio] },
    { header: "Mascota", accessor: (g) => g.mascota?.nombre ?? "—" },
    { header: "Fecha", accessor: (g) => formatDate(g.fecha) },
    { header: "Sede", accessor: (g) => g.sede?.nombre ?? "—" },
    { header: "Encargado", accessor: (g) => g.encargado },
    { header: "Precio", accessor: (g) => formatCurrency(g.precio) },
  ];

  return (
    <div>
      <PageHeader
        title="Baños y cortes"
        subtitle="Servicios de estética y grooming"
        action={canManage ? <Button onClick={openCreate}>+ Nuevo servicio</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : services.length === 0 ? (
        <EmptyState icon="✂️" title="No hay servicios registrados" description="Registra el primer servicio con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={services}
          rowKey={(g) => g.id}
          actions={
            canManage
              ? (g) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => openEdit(g)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setToDelete(g)}>
                      Eliminar
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar servicio" : "Nuevo servicio"} onClose={() => setModalOpen(false)}>
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
            <SelectField
              label="Tipo de servicio"
              required
              options={Object.entries(TIPO_GROOMING_LABELS).map(([value, label]) => ({ value, label }))}
              value={form.tipoServicio}
              onChange={(e) => setForm({ ...form, tipoServicio: e.target.value as TipoServicioGrooming })}
            />
            <InputField
              label="Fecha"
              type="date"
              required
              value={form.fecha as string}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Precio (S/)"
              type="number"
              step="0.5"
              min="0"
              required
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
            />
            <InputField
              label="Encargado"
              required
              value={form.encargado}
              onChange={(e) => setForm({ ...form, encargado: e.target.value })}
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
        title="Eliminar servicio"
        message="¿Seguro que deseas eliminar este registro de baño/corte?"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
