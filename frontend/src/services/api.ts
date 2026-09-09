import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// Normaliza mensajes de error del backend para mostrarlos en la UI.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: unknown } | undefined;
    if (data?.error) {
      if (data.details && typeof data.details === "object") {
        const fieldErrors = Object.values(data.details as Record<string, string[]>)
          .flat()
          .join(" ");
        return fieldErrors ? `${data.error}: ${fieldErrors}` : data.error;
      }
      return data.error;
    }
    return err.message;
  }
  return "Ocurrió un error inesperado";
}
