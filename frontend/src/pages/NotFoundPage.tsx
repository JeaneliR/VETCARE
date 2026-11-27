import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  const location = useLocation();
  const isInsideApp = location.pathname.startsWith("/app");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Compass className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Página no encontrada</h1>
      <p className="mt-2 text-slate-500">La ruta que buscas no existe.</p>
      <Link
        to={isInsideApp ? "/app" : "/"}
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        {isInsideApp ? "Volver al dashboard" : "Volver al inicio"}
      </Link>
    </div>
  );
}
