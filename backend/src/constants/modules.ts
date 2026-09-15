// Módulos sobre los que se puede dar permiso a un usuario STAFF.
// El ADMIN siempre tiene acceso a todos, sin necesidad de filas en UserPermission.
// "resenas" ya no es un módulo del sistema interno: las reseñas se crean
// desde la web pública (sin login) y solo el ADMIN puede moderarlas
// (borrar), así que no necesita un permiso asignable.
export const MODULOS = [
  "duenos",
  "mascotas",
  "citas",
  "vacunas",
  "tratamientos",
  "grooming",
  "sedes",
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
};