// Tipos compartidos por todo el frontend, reflejan el esquema de Prisma del backend.

export type Rol = "ADMIN" | "STAFF";

// Módulos sobre los que se puede otorgar permiso a un usuario STAFF.
// "resenas" no está aquí: ya no es un módulo del sistema interno (ver Review).
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

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt?: string;
  permisos: Modulo[];
  // IDs de sedes a las que queda restringido (citas/grooming). Vacío = todas.
  sedes: number[];
}

export type Especie = "PERRO" | "GATO" | "AVE" | "ROEDOR" | "REPTIL" | "OTRO";
export type Sexo = "MACHO" | "HEMBRA";
export type EstadoCita = "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA";
export type EstadoTratamiento = "EN_CURSO" | "FINALIZADO" | "SUSPENDIDO";
export type TipoServicioGrooming = "BANO" | "CORTE" | "BANO_Y_CORTE" | "DESLANADO" | "CORTE_UNAS";

export interface Owner {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  direccion?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { mascotas: number };
  mascotas?: Pet[];
}

export interface Pet {
  id: number;
  nombre: string;
  especie: Especie;
  raza?: string | null;
  sexo: Sexo;
  fechaNacimiento?: string | null;
  peso?: number | null;
  color?: string | null;
  esterilizado: boolean;
  notas?: string | null;
  fotoUrl?: string | null;
  duenoId: number;
  dueno?: Pick<Owner, "id" | "nombres" | "apellidos">;
  citas?: Appointment[];
  vacunas?: Vaccine[];
  tratamientos?: Treatment[];
  banosCortes?: Grooming[];
}

export interface Location {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email?: string | null;
  horario?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  imagenUrl?: string | null;
  calificacionPromedio?: number | null;
  _count?: { citas: number; banosCortes: number; resenas: number };
  resenas?: Review[];
}

export interface Appointment {
  id: number;
  fecha: string;
  motivo: string;
  veterinario: string;
  estado: EstadoCita;
  notas?: string | null;
  mascotaId: number;
  sedeId: number;
  mascota?: Pick<Pet, "id" | "nombre" | "especie"> & { dueno?: Pick<Owner, "id" | "nombres" | "apellidos"> };
  sede?: Pick<Location, "id" | "nombre" | "ciudad">;
}

export interface Vaccine {
  id: number;
  nombre: string;
  fechaAplicacion: string;
  proximaDosis?: string | null;
  veterinario: string;
  lote?: string | null;
  notas?: string | null;
  mascotaId: number;
  mascota?: Pick<Pet, "id" | "nombre" | "especie">;
}

export interface Treatment {
  id: number;
  diagnostico: string;
  descripcion: string;
  medicamentos?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  veterinario: string;
  estado: EstadoTratamiento;
  mascotaId: number;
  mascota?: Pick<Pet, "id" | "nombre" | "especie">;
}

export interface Grooming {
  id: number;
  tipoServicio: TipoServicioGrooming;
  fecha: string;
  precio: number;
  encargado: string;
  notas?: string | null;
  mascotaId: number;
  sedeId: number;
  mascota?: Pick<Pet, "id" | "nombre" | "especie">;
  sede?: Pick<Location, "id" | "nombre">;
}

export interface Review {
  id: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  // Una reseña viene de un Dueño ya registrado (duenoId) o de alguien que
  // solo dejó su nombre desde la web pública (nombreCliente); no ambos.
  duenoId?: number | null;
  nombreCliente?: string | null;
  sedeId: number;
  dueno?: Pick<Owner, "id" | "nombres" | "apellidos"> | null;
  sede?: Pick<Location, "id" | "nombre">;
}

export interface DashboardSummary {
  totalMascotas: number;
  totalDuenos: number;
  totalSedes: number;
  citasHoy: number;
  citasPendientes: number;
  vacunasProximas: number;
  tratamientosEnCurso: number;
  serviciosGroomingMes: number;
  calificacionPromedio: number | null;
  totalResenas: number;
  proximasCitas: Appointment[];
  citasPorDia: { fecha: string; cantidad: number }[];
  resenasPorSede: { sedeId: number; nombre: string; total: number; promedio: number | null }[];
}

// Etiquetas legibles para mostrar en la UI
export const ESPECIE_LABELS: Record<Especie, string> = {
  PERRO: "Perro",
  GATO: "Gato",
  AVE: "Ave",
  ROEDOR: "Roedor",
  REPTIL: "Reptil",
  OTRO: "Otro",
};

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

export const ESTADO_TRATAMIENTO_LABELS: Record<EstadoTratamiento, string> = {
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido",
};

export const TIPO_GROOMING_LABELS: Record<TipoServicioGrooming, string> = {
  BANO: "Baño",
  CORTE: "Corte",
  BANO_Y_CORTE: "Baño y corte",
  DESLANADO: "Deslanado",
  CORTE_UNAS: "Corte de uñas",
};