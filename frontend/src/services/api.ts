import axios from "axios";

export const TOKEN_STORAGE_KEY = "vetcare_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token guardado (si existe) a cada request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 (sesión inválida/expirada), limpiamos el token
// y mandamos al usuario al login del sistema. Evitamos hacerlo para la
// propia petición de login, que ya maneja su error en el formulario.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname.startsWith("/app")) {
        window.location.href = "/app/login";
      }
    }
    return Promise.reject(error);
  }
);

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
