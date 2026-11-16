import { loginSchema, createUserSchema } from "../../src/schemas/auth.schema";
import { createOwnerSchema } from "../../src/schemas/owner.schema";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../../src/schemas/appointment.schema";

describe("schemas/auth - loginSchema", () => {
  it("acepta credenciales con formato válido", () => {
    const result = loginSchema.safeParse({ email: "admin@vetcare.pe", password: "admin123" });
    expect(result.success).toBe(true);
  });

  it("rechaza un email con formato inválido", () => {
    const result = loginSchema.safeParse({ email: "no-es-un-email", password: "admin123" });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "admin@vetcare.pe", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("schemas/auth - createUserSchema", () => {
  it("aplica STAFF y listas vacías como valores por defecto", () => {
    const result = createUserSchema.parse({
      nombre: "Ana Pérez",
      email: "ana@vetcare.pe",
      password: "secreto6",
    });

    expect(result.rol).toBe("STAFF");
    expect(result.permisos).toEqual([]);
    expect(result.sedes).toEqual([]);
  });

  it("rechaza una contraseña de menos de 6 caracteres", () => {
    const result = createUserSchema.safeParse({
      nombre: "Ana Pérez",
      email: "ana@vetcare.pe",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("schemas/owner - createOwnerSchema", () => {
  it("rechaza un dueño con DNI demasiado corto", () => {
    const result = createOwnerSchema.safeParse({
      nombres: "Juan",
      apellidos: "Torres",
      dni: "123",
      telefono: "987654321",
      email: "juan@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("acepta un dueño con todos los campos obligatorios válidos", () => {
    const result = createOwnerSchema.safeParse({
      nombres: "Juan",
      apellidos: "Torres",
      dni: "12345678",
      telefono: "987654321",
      email: "juan@example.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("schemas/appointment - coherencia de 'estado' al actualizar", () => {
  it("createAppointmentSchema usa PENDIENTE por defecto cuando no se indica estado", () => {
    const result = createAppointmentSchema.parse({
      fecha: "2026-12-01T10:00:00.000Z",
      motivo: "Control anual",
      veterinario: "Dr. Rojas",
      mascotaId: 1,
      sedeId: 1,
    });
    expect(result.estado).toBe("PENDIENTE");
  });

  // Regresión: el comentario en appointment.schema.ts advierte que una actualización
  // parcial NO debe resetear "estado" a PENDIENTE silenciosamente si no se envía.
  it("updateAppointmentSchema NO fuerza 'estado' a PENDIENTE cuando se omite", () => {
    const result = updateAppointmentSchema.parse({
      motivo: "Reprogramada por el dueño",
    });
    expect(result.estado).toBeUndefined();
  });

  it("updateAppointmentSchema rechaza un mascotaId que no sea un entero positivo", () => {
    const result = updateAppointmentSchema.safeParse({ mascotaId: -5 });
    expect(result.success).toBe(false);
  });
});
