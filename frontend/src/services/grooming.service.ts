import { api } from "./api";
import { Grooming } from "../types";

export type GroomingInput = Omit<Grooming, "id" | "mascota" | "sede">;

export const groomingService = {
  list: (filters?: { mascotaId?: number; sedeId?: number }) =>
    api.get<Grooming[]>("/banos-cortes", { params: filters }).then((r) => r.data),
  getById: (id: number) => api.get<Grooming>(`/banos-cortes/${id}`).then((r) => r.data),
  create: (data: GroomingInput) => api.post<Grooming>("/banos-cortes", data).then((r) => r.data),
  update: (id: number, data: Partial<GroomingInput>) =>
    api.put<Grooming>(`/banos-cortes/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/banos-cortes/${id}`),
};
