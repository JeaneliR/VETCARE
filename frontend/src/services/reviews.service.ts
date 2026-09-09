import { api } from "./api";
import { Review } from "../types";

export type ReviewInput = Omit<Review, "id" | "dueno" | "sede" | "fecha"> & { fecha?: string };

export const reviewsService = {
  list: (filters?: { sedeId?: number; duenoId?: number }) =>
    api.get<Review[]>("/resenas", { params: filters }).then((r) => r.data),
  getById: (id: number) => api.get<Review>(`/resenas/${id}`).then((r) => r.data),
  create: (data: ReviewInput) => api.post<Review>("/resenas", data).then((r) => r.data),
  update: (id: number, data: Partial<ReviewInput>) =>
    api.put<Review>(`/resenas/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/resenas/${id}`),
};
