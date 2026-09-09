import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();
  const isInsideApp = location.pathname.startsWith("/app");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl">🐾</p>
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
