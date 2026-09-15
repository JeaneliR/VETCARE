export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toInputDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function toInputDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
}

export function fullName(person?: { nombres: string; apellidos: string } | null): string {
  if (!person) return "—";
  return `${person.nombres} ${person.apellidos}`;
}

// Una reseña puede venir de un Dueño ya registrado o de alguien que solo
// dejó su nombre desde la web pública (nombreCliente).
export function reviewAuthorName(review: {
  dueno?: { nombres: string; apellidos: string } | null;
  nombreCliente?: string | null;
}): string {
  if (review.dueno) return fullName(review.dueno);
  return review.nombreCliente || "Cliente anónimo";
}