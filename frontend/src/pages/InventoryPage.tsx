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
import { inventoryService, InventoryItemInput } from "../services/inventory.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { InventoryItem } from "../types";
import { formatDate, toInputDate } from "../utils/format";

const categories = ["Vacunas", "Medicamentos", "Alimentos", "Accesorios", "Limpieza", "Otros"];

const emptyForm: InventoryItemInput = {
  nombre: "",
  categoria: "Medicamentos",
  stock: 0,
  stockMinimo: 0,
  precio: 0,
  proveedor: "",
  ubicacion: "",
  observaciones: "",
  fechaVencimiento: undefined,
  activo: true,
};

export default function InventoryPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("inventario");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryItemInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [toDelete, setToDelete] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const data = await inventoryService.list();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category, label: category })),
    []
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      categoria: item.categoria,
      stock: item.stock,
      stockMinimo: item.stockMinimo,
      precio: item.precio,
      proveedor: item.proveedor ?? "",
      ubicacion: item.ubicacion ?? "",
      observaciones: item.observaciones ?? "",
      fechaVencimiento: item.fechaVencimiento ? toInputDate(item.fechaVencimiento) : undefined,
      activo: item.activo,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        proveedor: form.proveedor || undefined,
        ubicacion: form.ubicacion || undefined,
        observaciones: form.observaciones || undefined,
        fechaVencimiento: form.fechaVencimiento || undefined,
      };

      if (editing) {
        await inventoryService.update(editing.id, payload);
        setSuccess("Producto actualizado correctamente.");
      } else {
        await inventoryService.create(payload);
        setSuccess("Producto registrado correctamente.");
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
      await inventoryService.remove(toDelete.id);
      setSuccess("Producto eliminado.");
      setToDelete(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<InventoryItem>[] = [
    { header: "Producto", accessor: (item) => item.nombre },
    { header: "Categoría", accessor: (item) => item.categoria },
    { header: "Stock", accessor: (item) => <span className={item.stock <= item.stockMinimo ? "font-semibold text-red-600" : ""}>{item.stock}</span> },
    { header: "Mínimo", accessor: (item) => item.stockMinimo },
    { header: "Precio", accessor: (item) => `S/ ${item.precio.toFixed(2)}` },
    { header: "Proveedor", accessor: (item) => item.proveedor || "—" },
    {
      header: "Estado",
      accessor: (item) =>
        item.stock <= item.stockMinimo ? <Badge color="red">Bajo stock</Badge> : <Badge color="green">Disponible</Badge>,
    },
    { header: "Vence", accessor: (item) => (item.fechaVencimiento ? formatDate(item.fechaVencimiento) : "—") },
  ];

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Control de stock y productos de la veterinaria"
        action={canManage ? <Button onClick={openCreate}>+ Nuevo producto</Button> : undefined}
      />

      {error && <Alert message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay productos en inventario"
          description="Registra tu primer producto para comenzar a controlar stock y vencimientos."
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowKey={(item) => item.id}
          actions={
            canManage
              ? (item) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => openEdit(item)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setToDelete(item)}>
                      Eliminar
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}

      <Modal open={modalOpen} title={editing ? "Editar producto" : "Nuevo producto"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <Alert message={formError} />}

          <InputField
            label="Nombre del producto"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Categoría"
              required
              options={categoryOptions}
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
            <InputField
              label="Proveedor"
              value={form.proveedor ?? ""}
              onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InputField
              label="Stock"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
            <InputField
              label="Stock mínimo"
              type="number"
              min={0}
              required
              value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
            />
            <InputField
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Ubicación"
              value={form.ubicacion ?? ""}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
            <InputField
              label="Fecha de vencimiento"
              type="date"
              value={form.fechaVencimiento ?? ""}
              onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value || undefined })}
            />
          </div>

          <TextareaField
            label="Observaciones"
            value={form.observaciones ?? ""}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.activo ?? true}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Producto activo
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${toDelete?.nombre}" del inventario?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
