import { api } from "./api";
import { DashboardSummary } from "../types";

export const statsService = {
  summary: (sedeId?: number) =>
    api.get<DashboardSummary>("/stats/summary", { params: sedeId ? { sedeId } : {} }).then((r) => r.data),
};