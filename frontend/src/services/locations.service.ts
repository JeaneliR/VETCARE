import { api } from "./api";
import { Location } from "../types";

export type LocationInput = Omit<Location, "id" | "calificacionPromedio" | "_count" | "resenas">;

export const locationsService = {
  list: (filters?: { activa?: boolean }) =>
    api.get<Location[]>("/sedes", { params: filters }).then((r) => r.data),
  getById: (id: number) => api.get<Location>(`/sedes/${id}`).then((r) => r.data),
  create: (data: LocationInput) => api.post<Location>("/sedes", data).then((r) => r.data),
  update: (id: number, data: Partial<LocationInput>) =>
    api.put<Location>(`/sedes/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/sedes/${id}`),
};