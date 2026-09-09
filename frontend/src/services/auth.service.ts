import { api } from "./api";
import { User } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
