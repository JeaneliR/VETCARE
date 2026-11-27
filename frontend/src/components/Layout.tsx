
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseLinks = [
  { to: "/app", label: "Inicio", icon: "🏡", end: true, color: "brand" },
  { to: "/app/duenos", label: "Dueños", icon: "💼", color: "ocean" },
  { to: "/app/mascotas", label: "Mascotas", icon: "🐾", color: "brand" },
  { to: "/app/citas", label: "Citas", icon: "📅", color: "ocean" },
  { to: "/app/vacunas", label: "Vacunas", icon: "💉", color: "brand" },
  { to: "/app/tratamientos", label: "Tratamientos", icon: "🩺", color: "ocean" },
  { to: "/app/banos-cortes", label: "Baños y cortes", icon: "🛁", color: "brand" },
  { to: "/app/sedes", label: "Sedes", icon: "📍", color: "ocean" },
];

const iconColors: Record<string, string> = {
  brand: "bg-brand-100",
  ocean: "bg-ocean-100",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.rol === "ADMIN"
      ? [
          ...baseLinks,
          {
            to: "/app/usuarios",
            label: "Usuarios",
            icon: "👥",
            color: "brand",
          },
        ]
      : baseLinks;

  function handleLogout() {
    logout();
    navigate("/app/login", { replace: true });
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
        : "text-slate-600 hover:bg-slate-50 hover:text-brand-800"
    }`;

  const initial = (user?.nombre || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f6f9fa] text-slate-800">

      {/* =====================================
          BARRA LATERAL PARA ESCRITORIO
      ====================================== */}

      <aside className="relative hidden w-[265px] shrink-0 flex-col border-r border-brand-100 bg-white md:flex">

        {/* Detalle decorativo superior */}

        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-ocean-400" />

        {/* Logo */}

        <Link
          to="/app"
          className="flex items-center gap-3 border-b border-slate-100 px-5 py-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl shadow-sm">
            🐾
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-brand-800">
              VetCare<span className="text-ocean-500">.</span>
            </h1>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Patitas felices
            </p>
          </div>
        </Link>

        {/* Encabezado del menú */}

        <div className="px-5 pb-2 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            ¡Hola! ¿Qué haremos hoy?
          </p>
        </div>

        {/* Opciones */}

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1 overflow-y-auto px-3 pb-4"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? "bg-brand-200"
                        : iconColors[link.color]
                    }`}
                  >
                    {link.icon}
                  </span>

                  <span className="flex-1">{link.label}</span>

                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tarjeta amigable */}

        <div className="mx-3 mb-4 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-ocean-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-extrabold text-brand-900">
              ¡Mucho amor!
            </span>

            <span className="text-2xl">🐶</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Cada pequeña patita merece grandes cuidados. Gracias por ser parte
            de su bienestar.
          </p>

          <div className="mt-3 flex gap-1">
            <span className="h-1.5 w-8 rounded-full bg-brand-300" />
            <span className="h-1.5 w-4 rounded-full bg-ocean-300" />
            <span className="h-1.5 w-3 rounded-full bg-slate-300" />
          </div>
        </div>

        {/* Perfil del usuario */}

        <div className="border-t border-slate-100 bg-[#fcfdfc] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-200 to-ocean-100 text-base font-black text-brand-900">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-700">
                {user?.nombre || "Usuario"}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {user?.rol === "ADMIN"
                  ? "Administrador"
                  : "Personal veterinario"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ↪
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <Link
              to="/"
              className="text-slate-500 transition hover:text-brand-700"
            >
              ← Sitio web
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================
          CONTENIDO DE LA APLICACIÓN
      ====================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* Cabecera móvil */}

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-100 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link to="/app" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-xl">
              🐾
            </span>

            <span className="text-lg font-black tracking-tight text-brand-800">
              VetCare<span className="text-ocean-500">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-100 text-sm font-extrabold text-ocean-900">
              {initial}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Fondo y contenido de las páginas */}

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-[#f6f9fa] to-[#eef6f5] p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* Navegación móvil */}

        <nav
          aria-label="Navegación móvil"
          className="sticky bottom-0 z-30 flex justify-around border-t border-brand-100 bg-white/95 px-1 py-2 backdrop-blur-xl md:hidden"
        >
          {links.slice(0, 5).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
                  isActive
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-400 hover:text-brand-700"
                }`
              }
            >
              <span className="text-lg leading-5">{link.icon}</span>

              <span className="max-w-full truncate">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
