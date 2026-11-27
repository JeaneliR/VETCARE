import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

// Prueba de integración end-to-end contra una base de datos PostgreSQL real
// (ver backend/.env.test): login → crear dueño → crear mascota → crear cita,
// más un caso negativo (cita sobre una mascota que no existe).
//
// Requiere que la base de datos de prueba (vetcare_test) ya tenga las
// migraciones aplicadas y el seed corrido (ver backend/.env.test para los
// comandos exactos), porque usamos la cuenta admin@vetcare.pe/admin123 que
// crea `npm run seed`.
describe("Integración: flujo dueño → mascota → cita (PostgreSQL)", () => {
  let token: string;
  let sedeId: number;
  let duenoId: number | undefined;
  let mascotaId: number | undefined;

  // Sufijo único por corrida para que el DNI/email no choquen con una
  // ejecución anterior que no haya podido limpiar sus datos (por ejemplo,
  // si un test falló antes del afterAll).
  const sufijo = Date.now();

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@vetcare.pe", password: "admin123" });

    if (loginRes.status !== 200) {
      throw new Error(
        `No se pudo iniciar sesión con la cuenta de prueba del seed (status ${loginRes.status}). ` +
          "¿Corriste 'npm run seed' contra la base de datos de backend/.env.test?"
      );
    }
    token = loginRes.body.token;

    const sedesRes = await request(app).get("/api/sedes");
    if (sedesRes.status !== 200 || sedesRes.body.length === 0) {
      throw new Error(
        "No hay sedes en la base de datos de prueba. ¿Corriste 'npm run seed'?"
      );
    }
    sedeId = sedesRes.body[0].id;
  });

  afterAll(async () => {
    // Limpieza explícita: el seed vuelve a borrar todo en la próxima corrida,
    // pero si alguien corre estas pruebas contra una base que NO se va a
    // re-sembrar, no queremos dejar basura de prueba acumulándose.
    if (mascotaId) {
      await prisma.appointment.deleteMany({ where: { mascotaId } }).catch(() => undefined);
      await prisma.pet.delete({ where: { id: mascotaId } }).catch(() => undefined);
    }
    if (duenoId) {
      await prisma.owner.delete({ where: { id: duenoId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it("CI01: crea un dueño nuevo", async () => {
    const res = await request(app)
      .post("/api/duenos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombres: "Prueba",
        apellidos: "Integración Automatizada",
        dni: `TEST${sufijo}`,
        telefono: "999999999",
        email: `prueba.integracion.${sufijo}@example.com`,
        direccion: "Calle de Prueba 123, Lima",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(Number));
    duenoId = res.body.id;
  });

  it("CI02: crea una mascota vinculada a ese dueño", async () => {
    expect(duenoId).toBeDefined();

    const res = await request(app)
      .post("/api/mascotas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Firulais de Prueba",
        especie: "PERRO",
        sexo: "MACHO",
        duenoId,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.duenoId).toBe(duenoId);
    mascotaId = res.body.id;
  });

  it("CI03: agenda una cita para esa mascota en una sede real", async () => {
    expect(mascotaId).toBeDefined();

    const res = await request(app)
      .post("/api/citas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        motivo: "Consulta de prueba de integración",
        veterinario: "Dr. Prueba Automatizada",
        mascotaId,
        sedeId,
      });

    expect(res.status).toBe(201);
    expect(res.body.mascotaId).toBe(mascotaId);
    expect(res.body.sedeId).toBe(sedeId);
    expect(res.body.estado).toBe("PENDIENTE");
  });

  it("CI04 (caso negativo): una cita sobre una mascota inexistente falla con un error de cliente (4xx), nunca con 500", async () => {
    const mascotaInexistente = 999_999_999;

    const res = await request(app)
      .post("/api/citas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        motivo: "Cita sobre mascota inexistente",
        veterinario: "Dr. Prueba",
        mascotaId: mascotaInexistente,
        sedeId,
      });

    // El backend traduce el error de clave foránea de Prisma (P2003) a un
    // 400 con mensaje claro (ver errorHandler.ts) en vez de dejarlo pasar
    // como un 500 genérico.
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(res.body.error).toBeDefined();
  });
});
