import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/duenos", label: "Dueños", icon: "👤" },
  { to: "/mascotas", label: "Mascotas", icon: "🐾" },
  { to: "/citas", label: "Citas", icon: "📅" },
  { to: "/vacunas", label: "Vacunas", icon: "💉" },
  { to: "/tratamientos", label: "Tratamientos", icon: "🩺" },
  { to: "/banos-cortes", label: "Baños y cortes", icon: "✂️" },
  { to: "/sedes", label: "Sedes", icon: "📍" },
  { to: "/resenas", label: "Reseñas", icon: "⭐" },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <span className="text-2xl">🐾</span>
          <div>
            <p className="text-lg font-semibold text-brand-700">VetCare</p>
            <p className="text-xs text-slate-400">Sistema de gestión</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-400">
          VetCare Manager v1.0
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="flex items-center gap-2 text-lg font-semibold text-brand-700">
            🐾 VetCare
          </span>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <Outlet />
        </main>
        <nav className="flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
          {links.slice(0, 5).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 text-[11px] ${
                  isActive ? "text-brand-700" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
