import { api } from "./api";
import { InventoryItem } from "../types";

export type InventoryItemInput = Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;

export const inventoryService = {
  list: () => api.get<InventoryItem[]>("/inventario").then((r) => r.data),
  getById: (id: number) => api.get<InventoryItem>(`/inventario/${id}`).then((r) => r.data),
  create: (data: InventoryItemInput) => api.post<InventoryItem>("/inventario", data).then((r) => r.data),
  update: (id: number, data: Partial<InventoryItemInput>) =>
    api.put<InventoryItem>(`/inventario/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/inventario/${id}`),
};
