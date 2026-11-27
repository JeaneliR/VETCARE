
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../../components/StarRating";
import Spinner from "../../components/Spinner";
import AnimatedPets from "../../components/public/AnimatedPets";
import PetIllustration from "../../components/public/PetIllustration";
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  PawPrint,
  Calendar,
  Syringe,
  Stethoscope,
  Scissors,
  MessageCircle,
  Heart,
  Check,
  Mail,
  PartyPopper,
  Lock,
} from "lucide-react";
import { getErrorMessage } from "../../services/api";
import { locationsService } from "../../services/locations.service";
import { reviewsService } from "../../services/reviews.service";
import { Location, Review } from "../../types";
import { reviewAuthorName } from "../../utils/format";

const WHATSAPP_NUMBER = "51998236732";

function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const DEFAULT_WHATSAPP_MESSAGE =
  "¡Hola VetCare! Quisiera agendar una cita para mi mascota.";


const services = [
  {
    icon: PawPrint,
    title: "Ficha de tu mascota",
    description:
      "Su información, historial y visitas organizados en un solo lugar.",
    color: "bg-brand-100",
    accent: "text-brand-700",
    hoverStyle:
      "hover:bg-brand-50 hover:border-brand-200 hover:shadow-brand-900/5",
  },
  {
    icon: Calendar,
    title: "Citas y consultas",
    description:
      "Agenda una consulta con el especialista y la sede que prefieras.",
    color: "bg-ocean-100",
    accent: "text-ocean-700",
    hoverStyle:
      "hover:bg-ocean-50 hover:border-ocean-200 hover:shadow-ocean-900/5",
  },
  {
    icon: Syringe,
    title: "Vacunación",
    description:
      "Controla sus vacunas y mantén al día sus próximas dosis.",
    color: "bg-brand-100",
    accent: "text-brand-700",
    hoverStyle:
      "hover:bg-brand-50 hover:border-brand-200 hover:shadow-brand-900/5",
  },
  {
    icon: Stethoscope,
    title: "Tratamientos",
    description:
      "Seguimiento de diagnósticos y cuidados durante su recuperación.",
    color: "bg-ocean-100",
    accent: "text-ocean-700",
    hoverStyle:
      "hover:bg-ocean-50 hover:border-ocean-200 hover:shadow-ocean-900/5",
  },
  {
    icon: Scissors,
    title: "Baño y corte",
    description:
      "Baño, corte, deslanado y cuidado para que luzca genial.",
    color: "bg-brand-100",
    accent: "text-brand-700",
    hoverStyle:
      "hover:bg-brand-50 hover:border-brand-200 hover:shadow-brand-900/5",
  },
  {
    icon: MapPin,
    title: "Varias sedes",
    description:
      "Encuentra un centro veterinario cerca de donde te encuentres.",
    color: "bg-ocean-100",
    accent: "text-ocean-700",
    hoverStyle:
      "hover:bg-ocean-50 hover:border-ocean-200 hover:shadow-ocean-900/5",
  },
];

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#sedes", label: "Sedes" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#contacto", label: "Contacto" },
];

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewFilterSedeId, setReviewFilterSedeId] = useState<number | "">("");

  const [contactName, setContactName] = useState("");
  const [contactPet, setContactPet] = useState("");
  const [contactExotic, setContactExotic] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  const [reviewName, setReviewName] = useState("");
  const [reviewSedeId, setReviewSedeId] = useState<number | "">("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const visibleReviews = useMemo(() => {
    const filtered = reviewFilterSedeId
      ? allReviews.filter((review) => review.sedeId === reviewFilterSedeId)
      : allReviews;

    return filtered.slice(0, 6);
  }, [allReviews, reviewFilterSedeId]);

  useEffect(() => {
    Promise.all([
      locationsService.list({ activa: true }),
      reviewsService.list(),
    ])
      .then(([locs, reviews]) => {
        setLocations(locs);
        setReviewSedeId((current) => current || locs[0]?.id || "");
        setAllReviews(reviews);
      })
      .catch(() => {
        setLocations([]);
        setAllReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reviewSedeId) {
      setReviewError("Selecciona una sede antes de publicar tu reseña.");
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

      const updatedReviews = await reviewsService.list();
      setAllReviews(updatedReviews);
      setReviewSuccess(true);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    } catch (error) {
      setReviewError(getErrorMessage(error));
    } finally {
      setReviewSubmitting(false);
    }
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const lines = [
      "¡Hola VetCare! Quisiera agendar una cita.",
      `Nombre: ${contactName || "-"}`,
    ];

    if (contactPet.trim()) {
      lines.push(`Mascota: ${contactPet}`);
    }

    lines.push(`¿Es animal exótico?: ${contactExotic ? "Sí" : "No"}`);

    if (contactMessage.trim()) {
      lines.push(`Mensaje: ${contactMessage}`);
    }

    window.open(
      buildWhatsappLink(lines.join("\n")),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white font-sans text-slate-800">
      {/* Navegación */}
      <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex shrink-0 items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <PawPrint className="h-6 w-6" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-2xl font-black tracking-tight text-slate-900">
                Vet<span className="text-brand-600">Care</span>
              </span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                Salud y bienestar para tu mascota
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-brand-600"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-700 sm:px-5"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Agendar por WhatsApp</span>
            <span className="sm:hidden">Agendar</span>
          </a>
        </div>
      </header>

      <main>
        {/* Portada principal */}
        <section
          id="inicio"
          className="relative isolate scroll-mt-20 overflow-hidden bg-gradient-to-br from-ocean-50 via-white to-brand-50"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
                <Heart className="h-4 w-4" strokeWidth={2} />
                Atención veterinaria integral
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Cuidamos a tu mejor amigo como{" "}
                <span className="text-brand-600">parte de la familia.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Consultas, vacunación, tratamientos y estética para tu mascota.
                Un equipo preparado para acompañarte en cada etapa de su vida.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 font-bold text-white shadow-lg shadow-brand-200 transition hover:-translate-y-1 hover:bg-brand-700"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  Agendar una cita
                </a>

                <a
                  href="#sedes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-100 bg-white px-6 py-4 font-bold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <MapPin className="h-4 w-4" strokeWidth={2} /> Ver nuestras sedes
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-600" strokeWidth={2.5} /> Atención cercana</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-600" strokeWidth={2.5} /> Cuidado integral</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-600" strokeWidth={2.5} /> Amor por los animales</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div
                className="pointer-events-none absolute inset-0 z-20"
                aria-hidden="true"
              >
                <AnimatedPets />
              </div>

              <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-ocean-200/70 blur-2xl" />
              <div className="absolute -bottom-6 -left-5 h-36 w-36 rounded-full bg-brand-200/70 blur-2xl" />

              <div className="relative rounded-[2rem] border-8 border-white shadow-2xl shadow-brand-900/10">
                <PetIllustration
                  variant="duo"
                  className="h-[340px] w-full rounded-[1.5rem] object-cover sm:h-[430px] lg:h-[500px]"
                />

                <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ocean-100 text-ocean-700">
                      <PawPrint className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-900">
                        Pequeños amigos
                      </p>
                      <p className="text-sm text-slate-500">
                        Merecen grandes cuidados <Heart className="inline h-3.5 w-3.5 text-brand-500" strokeWidth={2} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-brand-700 shadow-lg sm:right-6 sm:top-6">
                  <PawPrint className="h-4 w-4" strokeWidth={2} /> ¡Bienvenidos!
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-ocean-100/70" />
        </section>

        {/* Servicios */}
        <section
          id="servicios"
          className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">
                Todo para su bienestar
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Servicios para consentirlos
              </h2>
              <p className="mt-4 text-slate-600">
                Cada patita merece atención, cariño y cuidados especiales.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.title}
                  className={`group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${service.hoverStyle}`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.color} ${service.accent} transition group-hover:rotate-3`}
                  >
                    <service.icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <h3 className={`mt-5 text-lg font-extrabold ${service.accent}`}>
                    {service.title}
                  </h3>
                  <p className="mt-2 leading-6 text-slate-600">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sedes */}
        <section
          id="sedes"
          className="scroll-mt-24 bg-gradient-to-br from-ocean-50 to-brand-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">
                  Estamos cerca de ti
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Nuestras sedes
                </h2>
                <p className="mt-3 text-slate-600">
                  Encuentra el lugar ideal para cuidar a tu mejor amigo.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
                <MapPin className="h-4 w-4" strokeWidth={2} /> {locations.length}{" "}
                {locations.length === 1
                  ? "sede disponible"
                  : "sedes disponibles"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : locations.length === 0 ? (
              <div className="rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-sm">
                <Building2 className="mx-auto h-12 w-12 text-brand-400" strokeWidth={1.5} />
                <h3 className="mt-4 text-xl font-extrabold text-slate-800">
                  Pronto estaremos más cerca
                </h3>
                <p className="mt-2 text-slate-500">
                  Muy pronto publicaremos nuestras sedes aquí.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                  <article
                    key={location.id}
                    className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {location.imagenUrl ? (
                      <img
                        src={location.imagenUrl}
                        alt={location.nombre}
                        loading="lazy"
                        className="h-52 w-full object-cover"
                      />
                    ) : location.latitud != null && location.longitud != null ? (
                      <iframe
                        title={`Mapa de ${location.nombre}`}
                        src={`https://maps.google.com/maps?q=${location.latitud},${location.longitud}&z=15&output=embed`}
                        loading="lazy"
                        className="h-52 w-full border-0"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-100 to-ocean-100 text-brand-500">
                        <Building2 className="h-12 w-12" strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-extrabold text-slate-900">
                          {location.nombre}
                        </h3>
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                          Activa
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
                          <span>
                            {location.direccion}, {location.ciudad}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
                          {location.telefono}
                        </p>
                        {location.horario && (
                          <p className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
                            <span>{location.horario}</span>
                          </p>
                        )}
                      </div>

                      {location.calificacionPromedio != null && (
                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                          <StarRating
                            value={Math.round(location.calificacionPromedio)}
                          />
                          <span className="text-sm font-bold text-slate-700">
                            {location.calificacionPromedio.toFixed(1)} / 5
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Reseñas */}
        <section
          id="resenas"
          className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">
                  Experiencias reales
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Historias que nos inspiran
                </h2>
                <p className="mt-3 text-slate-600">
                  Opiniones de personas que confían en el cuidado de sus mascotas.
                </p>
              </div>

              {locations.length > 0 && (
                <select
                  value={reviewFilterSedeId}
                  onChange={(event) =>
                    setReviewFilterSedeId(
                      event.target.value ? Number(event.target.value) : "",
                    )
                  }
                  aria-label="Filtrar reseñas por sede"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
                >
                  <option value="">Reseñas de todas las sedes</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      Solo {location.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {!loading && visibleReviews.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 px-6 py-12 text-center">
                <Mail className="mx-auto h-12 w-12 text-brand-400" strokeWidth={1.5} />
                <p className="mt-4 font-bold text-slate-700">
                  Todavía no hay reseñas para mostrar.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  ¡Puedes ser la primera persona en compartir su experiencia!
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600" aria-label="Reseña de cliente">
                        <MessageCircle className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <StarRating value={review.calificacion} />
                    </div>

                    <p className="mt-4 leading-7 text-slate-600">
                      “{review.comentario}”
                    </p>

                    <div className="mt-5 border-t border-slate-200 pt-4">
                      <p className="font-extrabold text-slate-900">
                        {reviewAuthorName(review)}
                      </p>
                      <p className="mt-1 text-sm text-brand-700">
                        <MapPin className="inline h-3.5 w-3.5" strokeWidth={2} /> {review.sede?.nombre || "Sede VetCare"}
                      </p>
                    </div>

                    {review.respuestaAdmin && (
                      <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-800">
                        <span className="inline-flex items-center gap-1.5 font-extrabold">
                          <Heart className="h-4 w-4" strokeWidth={2} /> Respuesta de VetCare
                        </span>
                        <p className="mt-1">{review.respuestaAdmin}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Formulario de reseñas */}
            <div className="mt-12 grid gap-8 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-ocean-50 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
              <div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                  <Heart className="h-7 w-7" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-2xl font-black text-slate-900">
                  ¡Cuéntanos tu experiencia!
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Tu opinión nos ayuda a seguir mejorando. Comparte cómo fue tu
                  visita y ayuda a otras familias con mascotas.
                </p>
                <p className="mt-4 text-sm font-semibold text-brand-700">
                  <PawPrint className="inline h-4 w-4" strokeWidth={2} /> No necesitas una cuenta para dejar tu reseña.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                {reviewSuccess ? (
                  <div
                    role="status"
                    className="rounded-2xl bg-brand-50 p-6 text-center text-brand-800"
                  >
                    <PartyPopper className="mx-auto h-10 w-10 text-brand-600" strokeWidth={1.75} />
                    <h4 className="mt-3 text-lg font-extrabold">
                      ¡Muchas gracias!
                    </h4>
                    <p className="mt-2 text-sm">
                      Tu reseña se ha enviado correctamente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setReviewSuccess(false)}
                      className="mt-4 rounded-full bg-brand-600 px-5 py-2 font-bold text-white transition hover:bg-brand-700"
                    >
                      Escribir otra reseña
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="flex flex-col gap-5"
                  >
                    {reviewError && (
                      <p
                        role="alert"
                        className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700"
                      >
                        {reviewError}
                      </p>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Tu calificación
                      </label>
                      <StarRating
                        value={reviewRating}
                        onChange={setReviewRating}
                        size="text-2xl"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="review-name"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Tu nombre
                        </label>
                        <input
                          id="review-name"
                          required
                          value={reviewName}
                          onChange={(event) => setReviewName(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                          placeholder="Ej. María Torres"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="review-location"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Sede que visitaste
                        </label>
                        <select
                          id="review-location"
                          required
                          value={reviewSedeId}
                          onChange={(event) =>
                            setReviewSedeId(
                              event.target.value ? Number(event.target.value) : "",
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                        >
                          <option value="" disabled>
                            Selecciona una sede
                          </option>
                          {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="review-comment"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Tu comentario
                      </label>
                      <textarea
                        id="review-comment"
                        required
                        minLength={3}
                        value={reviewComment}
                        onChange={(event) =>
                          setReviewComment(event.target.value)
                        }
                        rows={4}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                        placeholder="¿Cómo fue tu experiencia en VetCare?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-bold text-white shadow-md shadow-brand-100 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSubmitting
                        ? "Enviando reseña..."
                        : "⭐ Publicar reseña"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section
          id="contacto"
          className="scroll-mt-24 bg-gradient-to-br from-brand-900 via-brand-800 to-ocean-900 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-brand-100">
                <Mail className="h-4 w-4" strokeWidth={2} /> Estamos para ayudarte
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                Tu mascota merece lo mejor. ¡Hablemos!
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-brand-50/90">
                Cuéntanos qué necesita tu compañero. Te ayudaremos a encontrar
                la mejor manera de cuidarlo.
              </p>

              <div className="relative mt-8 max-w-lg overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
                <PetIllustration
                  variant="solo"
                  className="h-64 w-full object-cover sm:h-80"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 pt-14">
                  <p className="flex items-center gap-2 text-lg font-extrabold">
                    <PawPrint className="h-5 w-5 shrink-0" strokeWidth={2} /> Más cariño, más salud, más colitas felices.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-5">
                <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" strokeWidth={2} /> 998 236 732</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" strokeWidth={2} /> contacto@vetcare.pe</span>
              </div>

              <a
                href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-4 font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:bg-brand-400"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} /> Escribir por WhatsApp
              </a>
            </div>

            {/* Formulario de contacto */}
            <form
              onSubmit={handleContactSubmit}
              className="rounded-[2rem] bg-white p-6 text-slate-800 shadow-2xl sm:p-8 lg:p-10"
            >
              <div className="mb-7">
                <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">
                  Contáctanos
                </span>
                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  Cuéntanos sobre tu mascota
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Al enviar, se abrirá WhatsApp con tu mensaje listo para
                  confirmar.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Tu nombre
                  </label>
                  <input
                    id="contact-name"
                    required
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                    placeholder="Ej. María Torres"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-pet"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Nombre de tu mascota (opcional)
                  </label>
                  <input
                    id="contact-pet"
                    value={contactPet}
                    onChange={(event) => setContactPet(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                    placeholder="Ej. Rocky"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-ocean-50 p-4 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={contactExotic}
                    onChange={(event) => setContactExotic(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block font-bold">
                      Tengo un animal exótico
                    </span>
                    <span className="mt-1 block text-slate-500">
                      Por ejemplo, un ave, reptil, roedor o hurón.
                    </span>
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    ¿Cómo podemos ayudarte?
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                    placeholder="Cuéntanos qué necesita tu mascota y tu horario preferido."
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 font-extrabold text-white shadow-lg shadow-brand-100 transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} /> Enviar por WhatsApp
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-brand-200">
              <PawPrint className="h-6 w-6" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-xl font-black text-white">
                Vet<span className="text-brand-400">Care</span>
              </span>
              <span className="text-xs text-slate-400">
                Salud y bienestar para tu mascota
              </span>
            </span>
          </a>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} VetCare Manager — Proyecto académico,
            Herramienta de Desarrollo.
          </p>

          <Link
            to="/app/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition hover:text-white"
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={2} /> Acceso administrativo
          </Link>
        </div>
      </footer>
    </div>
  );
}
