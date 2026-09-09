import { FormEvent, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { InputField, SelectField } from "../components/FormField";
import { usersService, UserInput } from "../services/users.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Modulo, MODULO_LABELS, MODULOS, Rol, User } from "../types";

const emptyForm: UserInput = {
  nombre: "",
  email: "",
  password: "",
  rol: "STAFF",
  activo: true,
  permisos: [],
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      setUsers(await usersService.list());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol: user.rol,
      activo: user.activo,
      permisos: user.permisos,
    });
    setFormError("");
    setModalOpen(true);
  }

  function toggleModulo(modulo: Modulo) {
    setForm((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(modulo)
        ? prev.permisos.filter((m) => m !== modulo)
        : [...prev.permisos, modulo],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const payload: Partial<UserInput> = { ...form };
        if (!payload.password) delete payload.password; // no cambiar contraseña si se deja vacío
        await usersService.update(editing.id, payload);
        setSuccess("Usuario actualizado correctamente.");
      } else {
        if (!form.password) {
          setFormError("La contraseña es obligatoria para un usuario nuevo.");
          setSaving(false);
          return;
        }
        await usersService.create(form);
        setSuccess("Usuario creado correctamente.");
      }
      setModalOpen(false);
      await loadUsers();
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
      await usersService.remove(toDelete.id);
      setSuccess("Usuario eliminado.");
      setToDelete(null);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<User>[] = [
    { header: "Nombre", accessor: (u) => u.nombre },
    { header: "Email", accessor: (u) => u.email },
    {
      header: "Rol",
      accessor: (u) => <Badge color={u.rol === "ADMIN" ? "purple" : "blue"}>{u.rol === "ADMIN" ? "Administrador" : "Personal"}</Badge>,
    },
    {
      header: "Permisos",
      accessor: (u) =>
        u.rol === "ADMIN" ? (
          <span className="text-xs text-slate-500">Acceso total</span>
        ) : u.permisos.length === 0 ? (
          <span className="text-xs text-slate-400">Sin módulos asignados</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {u.permisos.map((p) => (
              <Badge key={p} color="green">
                {MODULO_LABELS[p]}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      header: "Estado",
      accessor: (u) => (u.activo ? <Badge color="green">Activo</Badge> : <Badge color="red">Inactivo</Badge>),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Cuentas del personal y sus permisos de acceso al sistema"
        action={<Button onClick={openCreate}>+ Nuevo usuario</Button>}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No hay usuarios registrados" />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          rowKey={(u) => u.id}
          actions={(u) => (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => openEdit(u)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => setToDelete(u)} disabled={u.id === currentUser?.id}>
                Eliminar
              </Button>
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar usuario" : "Nuevo usuario"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}
          <InputField
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <InputField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <InputField
            label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            type="password"
            required={!editing}
            placeholder={editing ? "Dejar vacío para no cambiarla" : ""}
            value={form.password ?? ""}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <SelectField
            label="Rol"
            required
            disabled={editing?.id === currentUser?.id}
            options={[
              { value: "STAFF", label: "Personal (permisos por módulo)" },
              { value: "ADMIN", label: "Administrador (acceso total)" },
            ]}
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}
          />

          {form.rol === "STAFF" && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Módulos permitidos</p>
              <div className="grid grid-cols-2 gap-2">
                {MODULOS.map((modulo) => (
                  <label key={modulo} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.permisos.includes(modulo)}
                      onChange={() => toggleModulo(modulo)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    {MODULO_LABELS[modulo]}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Este usuario podrá ver todos los módulos, pero solo crear/editar/eliminar en los que
                marques aquí.
              </p>
            </div>
          )}

          {editing && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.activo ?? true}
                disabled={editing.id === currentUser?.id}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Usuario activo (si se desmarca, no podrá iniciar sesión)
            </label>
          )}

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
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar a ${toDelete?.nombre}? Perderá acceso al sistema de inmediato.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
