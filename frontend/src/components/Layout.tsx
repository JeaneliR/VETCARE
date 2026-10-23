
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseLinks = [
  { to: "/app", label: "Inicio", icon: "🏡", end: true, color: "mint" },
  { to: "/app/duenos", label: "Dueños", icon: "💛", color: "yellow" },
  { to: "/app/mascotas", label: "Mascotas", icon: "🐾", color: "pink" },
  { to: "/app/citas", label: "Citas", icon: "📅", color: "blue" },
  { to: "/app/vacunas", label: "Vacunas", icon: "💉", color: "purple" },
  { to: "/app/tratamientos", label: "Tratamientos", icon: "🩺", color: "mint" },
  { to: "/app/banos-cortes", label: "Baños y cortes", icon: "🛁", color: "blue" },
  { to: "/app/sedes", label: "Sedes", icon: "📍", color: "yellow" },
];

const iconColors: Record<string, string> = {
  mint: "bg-emerald-100",
  yellow: "bg-amber-100",
  pink: "bg-pink-100",
  blue: "bg-sky-100",
  purple: "bg-violet-100",
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
            color: "purple",
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
        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
        : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"
    }`;

  const initial = (user?.nombre || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f7faf8] text-slate-800">

      {/* =====================================
          BARRA LATERAL PARA ESCRITORIO
      ====================================== */}

      <aside className="relative hidden w-[265px] shrink-0 flex-col border-r border-emerald-100 bg-white md:flex">

        {/* Detalle decorativo superior */}

        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300" />

        {/* Logo */}

        <Link
          to="/app"
          className="flex items-center gap-3 border-b border-slate-100 px-5 py-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-sm">
            🐾
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-emerald-800">
              VetCare<span className="text-orange-400">.</span>
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
                        ? "bg-emerald-200"
                        : iconColors[link.color]
                    }`}
                  >
                    {link.icon}
                  </span>

                  <span className="flex-1">{link.label}</span>

                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tarjeta amigable */}

        <div className="mx-3 mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-extrabold text-emerald-900">
              ¡Mucho amor!
            </span>

            <span className="text-2xl">🐶</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Cada pequeña patita merece grandes cuidados. Gracias por ser parte
            de su bienestar.
          </p>

          <div className="mt-3 flex gap-1">
            <span className="h-1.5 w-8 rounded-full bg-emerald-300" />
            <span className="h-1.5 w-4 rounded-full bg-amber-300" />
            <span className="h-1.5 w-3 rounded-full bg-pink-300" />
          </div>
        </div>

        {/* Perfil del usuario */}

        <div className="border-t border-slate-100 bg-[#fcfdfc] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-100 text-base font-black text-emerald-900">
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              ↪
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <Link
              to="/"
              className="text-slate-500 transition hover:text-emerald-700"
            >
              ← Sitio web
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-2 py-1 text-rose-500 transition hover:bg-rose-50"
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

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link to="/app" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
              🐾
            </span>

            <span className="text-lg font-black tracking-tight text-emerald-800">
              VetCare<span className="text-orange-400">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-sm font-extrabold text-amber-900">
              {initial}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Fondo y contenido de las páginas */}

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-[#f7faf8] to-[#eff8f2] p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* Navegación móvil */}

        <nav
          aria-label="Navegación móvil"
          className="sticky bottom-0 z-30 flex justify-around border-t border-emerald-100 bg-white/95 px-1 py-2 backdrop-blur-xl md:hidden"
        >
          {links.slice(0, 5).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-400 hover:text-emerald-700"
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
