import { api } from "./api";
import { DashboardSummary } from "../types";

export const statsService = {
  summary: () => api.get<DashboardSummary>("/stats/summary").then((r) => r.data),
};
