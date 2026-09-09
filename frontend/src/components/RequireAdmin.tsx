import { useAuth } from "../context/AuthContext";
import EmptyState from "./EmptyState";

// Se usa dentro de RequireAuth, para páginas exclusivas del administrador
// principal (por ejemplo, gestión de usuarios). No redirige: muestra un
// aviso, porque llegar aquí ya implica que hay sesión iniciada.
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.rol !== "ADMIN") {
    return (
      <EmptyState
        icon="🔒"
        title="Acceso restringido"
        description="Esta sección es solo para el administrador principal del sistema."
      />
    );
  }

  return <>{children}</>;
}
