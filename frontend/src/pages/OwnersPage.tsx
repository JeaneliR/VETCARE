import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import DataTable, { Column } from "../components/DataTable";
import { InputField, TextareaField } from "../components/FormField";
import { ownersService, OwnerInput } from "../services/owners.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Owner } from "../types";

const emptyForm: OwnerInput = {
  nombres: "",
  apellidos: "",
  dni: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function OwnersPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("duenos");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [form, setForm] = useState<OwnerInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<Owner | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadOwners() {
    setLoading(true);
    try {
      const data = await ownersService.list();
      setOwners(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(owner: Owner) {
    setEditing(owner);
    setForm({
      nombres: owner.nombres,
      apellidos: owner.apellidos,
      dni: owner.dni,
      telefono: owner.telefono,
      email: owner.email,
      direccion: owner.direccion ?? "",
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
        await ownersService.update(editing.id, form);
        setSuccess("Dueño actualizado correctamente.");
      } else {
        await ownersService.create(form);
        setSuccess("Dueño creado correctamente.");
      }
      setModalOpen(false);
      await loadOwners();
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
      await ownersService.remove(toDelete.id);
      setSuccess("Dueño eliminado.");
      setToDelete(null);
      await loadOwners();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Owner>[] = [
    { header: "Nombre completo", accessor: (o) => `${o.nombres} ${o.apellidos}` },
    { header: "DNI", accessor: (o) => o.dni },
    { header: "Teléfono", accessor: (o) => o.telefono },
    { header: "Email", accessor: (o) => o.email },
    {
      header: "Mascotas",
      accessor: (o) => (
        <Link to={`/app/mascotas?duenoId=${o.id}`} className="text-brand-600 hover:underline">
          {o._count?.mascotas ?? 0}
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dueños"
        subtitle="Administra a los clientes de la veterinaria"
        action={canManage ? <Button onClick={openCreate}>+ Nuevo dueño</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : owners.length === 0 ? (
        <EmptyState icon="👤" title="Aún no hay dueños registrados" description="Crea el primero con el botón de arriba." />
      ) : (
        <DataTable
          columns={columns}
          data={owners}
          rowKey={(o) => o.id}
          actions={
            canManage
              ? (o) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => openEdit(o)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setToDelete(o)}>
                      Eliminar
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar dueño" : "Nuevo dueño"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nombres"
              required
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            />
            <InputField
              label="Apellidos"
              required
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="DNI / Documento"
              required
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
            />
            <InputField
              label="Teléfono"
              required
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <InputField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextareaField
            label="Dirección"
            value={form.direccion ?? ""}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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
        title="Eliminar dueño"
        message={`¿Seguro que deseas eliminar a ${toDelete?.nombres} ${toDelete?.apellidos}? También se eliminarán sus mascotas asociadas.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
