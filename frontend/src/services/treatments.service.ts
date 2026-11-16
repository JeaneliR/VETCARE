import { api } from "./api";
import { Treatment } from "../types";

export type TreatmentInput = Omit<Treatment, "id" | "mascota">;

export const treatmentsService = {
  list: (params?: number | { mascotaId?: number; estado?: string }) => {
    const query = typeof params === "number" ? { mascotaId: params } : params ?? {};
    return api.get<Treatment[]>("/tratamientos", { params: query }).then((r) => r.data);
  },
  getById: (id: number) => api.get<Treatment>(`/tratamientos/${id}`).then((r) => r.data),
  create: (data: TreatmentInput) => api.post<Treatment>("/tratamientos", data).then((r) => r.data),
  update: (id: number, data: Partial<TreatmentInput>) =>
    api.put<Treatment>(`/tratamientos/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/tratamientos/${id}`),
};
