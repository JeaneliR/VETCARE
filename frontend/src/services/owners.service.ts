import { api } from "./api";
import { Owner } from "../types";

export type OwnerInput = Omit<Owner, "id" | "createdAt" | "updatedAt" | "_count" | "mascotas">;

export const ownersService = {
  list: () => api.get<Owner[]>("/duenos").then((r) => r.data),
  getById: (id: number) => api.get<Owner>(`/duenos/${id}`).then((r) => r.data),
  create: (data: OwnerInput) => api.post<Owner>("/duenos", data).then((r) => r.data),
  update: (id: number, data: Partial<OwnerInput>) =>
    api.put<Owner>(`/duenos/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/duenos/${id}`),
};
