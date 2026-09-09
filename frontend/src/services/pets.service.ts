import { api } from "./api";
import { Pet } from "../types";

export type PetInput = Omit<
  Pet,
  "id" | "dueno" | "citas" | "vacunas" | "tratamientos" | "banosCortes"
>;

export const petsService = {
  list: (duenoId?: number) =>
    api.get<Pet[]>("/mascotas", { params: duenoId ? { duenoId } : {} }).then((r) => r.data),
  getById: (id: number) => api.get<Pet>(`/mascotas/${id}`).then((r) => r.data),
  create: (data: PetInput) => api.post<Pet>("/mascotas", data).then((r) => r.data),
  update: (id: number, data: Partial<PetInput>) =>
    api.put<Pet>(`/mascotas/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/mascotas/${id}`),
};
