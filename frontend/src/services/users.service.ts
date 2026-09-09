import { api } from "./api";
import { Modulo, Rol, User } from "../types";

export interface UserInput {
  nombre: string;
  email: string;
  password?: string;
  rol: Rol;
  activo?: boolean;
  permisos: Modulo[];
}

export const usersService = {
  list: () => api.get<User[]>("/usuarios").then((r) => r.data),
  getById: (id: number) => api.get<User>(`/usuarios/${id}`).then((r) => r.data),
  create: (data: UserInput) => api.post<User>("/usuarios", data).then((r) => r.data),
  update: (id: number, data: Partial<UserInput>) =>
    api.put<User>(`/usuarios/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/usuarios/${id}`),
};
