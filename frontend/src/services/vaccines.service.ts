import { api } from "./api";
import { Vaccine } from "../types";

export type VaccineInput = Omit<Vaccine, "id" | "mascota">;

export const vaccinesService = {
  list: (mascotaId?: number) =>
    api.get<Vaccine[]>("/vacunas", { params: mascotaId ? { mascotaId } : {} }).then((r) => r.data),
  getById: (id: number) => api.get<Vaccine>(`/vacunas/${id}`).then((r) => r.data),
  create: (data: VaccineInput) => api.post<Vaccine>("/vacunas", data).then((r) => r.data),
  update: (id: number, data: Partial<VaccineInput>) =>
    api.put<Vaccine>(`/vacunas/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/vacunas/${id}`),
};
