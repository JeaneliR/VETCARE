import { api } from "./api";
import { Treatment } from "../types";

export type TreatmentInput = Omit<Treatment, "id" | "mascota">;

export const treatmentsService = {
  list: (mascotaId?: number) =>
    api
      .get<Treatment[]>("/tratamientos", { params: mascotaId ? { mascotaId } : {} })
      .then((r) => r.data),
  getById: (id: number) => api.get<Treatment>(`/tratamientos/${id}`).then((r) => r.data),
  create: (data: TreatmentInput) => api.post<Treatment>("/tratamientos", data).then((r) => r.data),
  update: (id: number, data: Partial<TreatmentInput>) =>
    api.put<Treatment>(`/tratamientos/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/tratamientos/${id}`),
};
