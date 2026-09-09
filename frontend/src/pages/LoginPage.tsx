import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { InputField } from "../components/FormField";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión iniciada, no tiene sentido mostrar el login de nuevo.
  if (user) {
    return <Navigate to={location.state?.from ?? "/app"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/app", { replace: true });
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl">🐾</span>
          <h1 className="mt-2 text-xl font-bold text-brand-700">Ingresar al sistema</h1>
          <p className="text-sm text-slate-500">Acceso exclusivo para el personal de VetCare</p>
        </div>

        {error && <Alert message={error} onDismiss={() => setError("")} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Contraseña"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs text-slate-400 hover:text-brand-700">
          ← Volver al sitio web
        </Link>
      </div>
    </div>
  );
}
