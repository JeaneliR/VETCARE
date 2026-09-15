import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../../components/StarRating";
import Spinner from "../../components/Spinner";
import { getErrorMessage } from "../../services/api";
import { locationsService } from "../../services/locations.service";
import { reviewsService } from "../../services/reviews.service";
import { Location, Review } from "../../types";
import { reviewAuthorName } from "../../utils/format";

const WHATSAPP_NUMBER = "51998236732"; // 998236732 con código de país (Perú)

function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const DEFAULT_WHATSAPP_MESSAGE =
  "¡Hola VetCare! Quisiera agendar una cita para mi mascota.";

const services = [
  {
    icon: "🐾",
    title: "Ficha de tu mascota",
    description: "Guardamos el historial completo de tu mascota: datos, dueño y todas sus visitas en un solo lugar.",
  },
  {
    icon: "📅",
    title: "Citas y consultas",
    description: "Agenda consultas veterinarias con el especialista y la sede que prefieras.",
  },
  {
    icon: "💉",
    title: "Vacunación",
    description: "Control de vacunas al día, con recordatorio de próximas dosis.",
  },
  {
    icon: "🩺",
    title: "Tratamientos",
    description: "Seguimiento de diagnósticos y tratamientos médicos hasta su recuperación.",
  },
  {
    icon: "✂️",
    title: "Baño y corte",
    description: "Servicios de estética: baño, corte, deslanado y corte de uñas.",
  },
  {
    icon: "📍",
    title: "Varias sedes",
    description: "Atendemos en distintos puntos de la ciudad para que elijas el más cercano.",
  },
];

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#sedes", label: "Sedes" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#contacto", label: "Contacto" },
];

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [contactName, setContactName] = useState("");
  const [contactPet, setContactPet] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const [reviewName, setReviewName] = useState("");
  const [reviewSedeId, setReviewSedeId] = useState<number | "">("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    Promise.all([locationsService.list(), reviewsService.list()])
      .then(([locs, revs]) => {
        setLocations(locs);
        setReviewSedeId((current) => current || locs[0]?.id || "");
        setReviews(revs.slice(0, 6));
      })
      .catch(() => {
        // El sitio público sigue siendo útil aunque el API no responda todavía.
        setLocations([]);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reviewSedeId) {
      setReviewError("Selecciona una sede.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await reviewsService.create({
        calificacion: reviewRating,
        comentario: reviewComment,
        nombreCliente: reviewName,
        sedeId: reviewSedeId,
      });
      const updated = await reviewsService.list();
      setReviews(updated.slice(0, 6));
      setReviewSuccess(true);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setReviewSubmitting(false);
    }
  }

  function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    const lines = [
      "¡Hola VetCare! Quisiera agendar una cita.",
      `Nombre: ${contactName || "-"}`,
    ];
    if (contactPet.trim()) {
      lines.push(`Mascota: ${contactPet}`);
    }
    if (contactMessage.trim()) {
      lines.push(`Mensaje: ${contactMessage}`);
    }
    window.open(buildWhatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#inicio" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-brand-700">VetCare</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-brand-700">
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            <span>💬</span> Agendar por WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:py-24">
          <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
            Atención veterinaria integral
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Cuidamos a tu mejor amigo como si fuera de la familia
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Consultas, vacunación, tratamientos y estética para tu mascota, con varias sedes
            para atenderte donde te quede mejor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              <span>💬</span> Agendar una cita por WhatsApp
            </a>
            <a
              href="#contacto"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Escríbenos por formulario
            </a>
            <a
              href="#sedes"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver nuestras sedes
            </a>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Nuestros servicios</h2>
          <p className="mt-2 text-slate-600">Todo lo que tu mascota necesita, en un solo lugar.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <span className="text-3xl">{service.icon}</span>
              <h3 className="mt-3 font-semibold text-slate-800">{service.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sedes */}
      <section id="sedes" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Nuestras sedes</h2>
            <p className="mt-2 text-slate-600">Encuentra la sede VetCare más cercana a ti.</p>
          </div>

          {loading ? (
            <Spinner />
          ) : locations.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">Muy pronto publicaremos nuestras sedes aquí.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc) => (
                <div key={loc.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {loc.imagenUrl && (
                    <img src={loc.imagenUrl} alt={loc.nombre} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800">{loc.nombre}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      📍 {loc.direccion}, {loc.ciudad}
                    </p>
                    <p className="text-sm text-slate-500">📞 {loc.telefono}</p>
                    {loc.horario && <p className="text-sm text-slate-500">🕒 {loc.horario}</p>}
                    {loc.calificacionPromedio != null && (
                      <div className="mt-2 flex items-center gap-2">
                        <StarRating value={Math.round(loc.calificacionPromedio)} />
                        <span className="text-xs text-slate-500">{loc.calificacionPromedio.toFixed(1)} / 5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reseñas */}
      <section id="resenas" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Lo que dicen nuestros clientes</h2>
          <p className="mt-2 text-slate-600">Opiniones reales de dueños que confían en nosotros.</p>
        </div>

        {!loading && reviews.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">Todavía no hay reseñas publicadas.</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 p-5 shadow-sm">
                <StarRating value={review.calificacion} />
                <p className="mt-3 text-sm text-slate-600">"{review.comentario}"</p>
                <p className="mt-3 text-sm font-medium text-slate-800">{reviewAuthorName(review)}</p>
                <p className="text-xs text-slate-400">{review.sede?.nombre}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mx-auto mt-12 max-w-xl rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Déjanos tu reseña</h3>
          <p className="mt-1 text-sm text-slate-500">
            Cuéntanos cómo te fue en tu última visita. No necesitas cuenta ni contraseña.
          </p>

          {reviewSuccess ? (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              ¡Gracias por tu reseña! Ya quedó publicada arriba.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="mt-4 flex flex-col gap-4 text-left">
              {reviewError && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{reviewError}</p>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Calificación</label>
                <StarRating value={reviewRating} onChange={setReviewRating} size="text-2xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tu nombre</label>
                  <input
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Ej. María Torres"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Sede que visitaste</label>
                  <select
                    required
                    value={reviewSedeId}
                    onChange={(e) => setReviewSedeId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="" disabled>
                      Selecciona una sede
                    </option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tu comentario</label>
                <textarea
                  required
                  minLength={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="¿Cómo fue tu experiencia?"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
              >
                {reviewSubmitting ? "Enviando..." : "Publicar reseña"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-brand-700 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold">¿Listo para agendar la cita de tu mascota?</h2>
            <p className="max-w-xl text-brand-50">
              Escríbenos directamente por WhatsApp o completa el formulario y te contactaremos
              por ese mismo medio.
            </p>
            <div className="flex flex-col items-center gap-2 text-sm text-brand-50 lg:items-start">
              <span>📞 WhatsApp: 998 236 732</span>
              <span>✉️ contacto@vetcare.pe</span>
            </div>
            <div className="flex justify-center lg:justify-start">
              <a
                href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
              >
                <span>💬</span> Escribir por WhatsApp
              </a>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="flex flex-col gap-4 rounded-xl bg-white p-6 text-left text-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">O envíanos tus datos</h3>
            <p className="text-sm text-slate-500">
              Al enviar, se abrirá WhatsApp con tu mensaje listo para confirmarlo.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tu nombre</label>
              <input
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Ej. María Torres"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de tu mascota (opcional)</label>
              <input
                value={contactPet}
                onChange={(e) => setContactPet(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Ej. Rocky"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mensaje</label>
              <textarea
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Cuéntanos qué necesitas y tu horario preferido"
              />
            </div>
            <button
              type="submit"
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              <span>💬</span> Enviar por WhatsApp
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} VetCare Manager — Proyecto académico, Herramienta de Desarrollo.</p>
        <Link to="/app/login" className="mt-2 inline-block text-xs text-slate-300 hover:text-slate-400 hover:underline">
          Acceso administrativo
        </Link>
      </footer>
    </div>
  );
}
