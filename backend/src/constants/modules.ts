// Módulos sobre los que se puede dar permiso a un usuario STAFF.
// El ADMIN siempre tiene acceso a todos, sin necesidad de filas en UserPermission.
export const MODULOS = [
  "duenos",
  "mascotas",
  "citas",
  "vacunas",
  "tratamientos",
  "grooming",
  "sedes",
  "resenas",
] as const;

export type Modulo = (typeof MODULOS)[number];

export const MODULO_LABELS: Record<Modulo, string> = {
  duenos: "Dueños",
  mascotas: "Mascotas",
  citas: "Citas",
  vacunas: "Vacunas",
  tratamientos: "Tratamientos",
  grooming: "Baños y cortes",
  sedes: "Sedes",
  resenas: "Reseñas",
};
