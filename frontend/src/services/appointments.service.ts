import { api } from "./api";
import { Appointment, EstadoCita } from "../types";

export type AppointmentInput = Omit<Appointment, "id" | "mascota" | "sede">;

export const appointmentsService = {
  list: (filters?: { mascotaId?: number; sedeId?: number; estado?: EstadoCita }) =>
    api.get<Appointment[]>("/citas", { params: filters }).then((r) => r.data),
  getById: (id: number) => api.get<Appointment>(`/citas/${id}`).then((r) => r.data),
  create: (data: AppointmentInput) => api.post<Appointment>("/citas", data).then((r) => r.data),
  update: (id: number, data: Partial<AppointmentInput>) =>
    api.put<Appointment>(`/citas/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/citas/${id}`),
};
