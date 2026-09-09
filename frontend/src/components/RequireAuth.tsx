import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

// Envuelve las rutas del sistema de gestión: si no hay sesión, manda al login
// y recuerda a dónde quería ir el usuario para regresarlo después.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando sesión..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
