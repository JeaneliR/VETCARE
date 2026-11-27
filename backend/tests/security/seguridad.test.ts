import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

// Pruebas de seguridad contra una base de datos PostgreSQL real (ver
// backend/.env.test). Cubren: autenticación (token ausente/inválido/
// expirado), autorización por módulo (RBAC), anti-enumeración de usuarios
// en el login, que las contraseñas nunca viajen ni se guarden en texto
// plano, validación de entrada (Zod) y resistencia a inyección SQL (al
// usarse Prisma como ORM, las consultas quedan parametrizadas).
//
// Mismo requisito que la prueba de integración: la base de vetcare_test ya
// debe tener migraciones + seed corridos.
describe("Seguridad: autenticación, autorización y validación (PostgreSQL real)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("SEC01: una ruta protegida sin token responde 401, nunca con los datos", async () => {
    const res = await request(app).get("/api/duenos");
    expect(res.status).toBe(401);
    expect(Array.isArray(res.body)).toBe(false);
  });

  it("SEC02: un token con formato inválido (no un JWT real) responde 401", async () => {
    const res = await request(app)
      .get("/api/duenos")
      .set("Authorization", "Bearer esto-no-es-un-jwt-valido");

    expect(res.status).toBe(401);
  });

  it("SEC03: un token JWT ya expirado se rechaza con 401, aunque la firma sea válida", async () => {
    const secret = process.env.JWT_SECRET!;
    const tokenExpirado = jwt.sign({ sub: 1, rol: "ADMIN" }, secret, {
      expiresIn: -10, // vencido hace 10 segundos
    });

    const res = await request(app)
      .get("/api/duenos")
      .set("Authorization", `Bearer ${tokenExpirado}`);

    expect(res.status).toBe(401);
  });

  it("SEC04: el login da el mismo mensaje genérico tanto si el email no existe como si la contraseña es incorrecta (anti enumeración de usuarios)", async () => {
    const resEmailInexistente = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie-registrado-asi@vetcare.pe", password: "cualquiera123" });

    const resPasswordIncorrecta = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@vetcare.pe", password: "password-incorrecta" });

    expect(resEmailInexistente.status).toBe(400);
    expect(resPasswordIncorrecta.status).toBe(400);
    expect(resEmailInexistente.body.error).toBe(resPasswordIncorrecta.body.error);
  });

  it("SEC05: el login nunca devuelve el hash de la contraseña en la respuesta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@vetcare.pe", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.user.passwordHash).toBeUndefined();
    // Formato típico de un hash bcrypt ($2a$/$2b$/$2y$...): no debe aparecer
    // en ninguna parte de la respuesta.
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
  });

  it("SEC06: las contraseñas se guardan hasheadas con bcrypt en la base de datos, nunca en texto plano", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@vetcare.pe" } });

    expect(admin).not.toBeNull();
    expect(admin!.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(admin!.passwordHash).not.toBe("admin123");
  });

  it("SEC07: un STAFF sin permiso sobre un módulo puede leerlo (200) pero no puede escribir en él (403)", async () => {
    // La cuenta de grooming del seed solo tiene permiso sobre "grooming".
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "grooming@vetcare.pe", password: "grooming123" });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const lecturaRes = await request(app)
      .get("/api/duenos")
      .set("Authorization", `Bearer ${token}`);
    expect(lecturaRes.status).toBe(200);

    const escrituraRes = await request(app)
      .post("/api/duenos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombres: "No",
        apellidos: "Autorizado",
        dni: `SEC07${Date.now()}`,
        telefono: "999999999",
        email: `sec07.${Date.now()}@example.com`,
      });
    expect(escrituraRes.status).toBe(403);
  });

  it("SEC08: un payload con campos obligatorios faltantes responde 400 con el detalle de validación, nunca 500", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@vetcare.pe", password: "admin123" });
    const token = loginRes.body.token;

    const res = await request(app)
      .post("/api/duenos")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombres: "Solo nombre, falta todo lo demás" });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  it("SEC09: una cadena típica de inyección SQL se guarda como texto literal (Prisma parametriza las consultas), sin romper la tabla", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@vetcare.pe", password: "admin123" });
    const token = loginRes.body.token;

    const payloadMalicioso = "Robert'); DROP TABLE owners;--";

    const res = await request(app)
      .post("/api/duenos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombres: payloadMalicioso,
        apellidos: "Caso de prueba SQLi",
        dni: `SEC09${Date.now()}`,
        telefono: "999999999",
        email: `sec09.${Date.now()}@example.com`,
      });

    expect(res.status).toBe(201);
    // Se guardó tal cual, como texto plano, no se interpretó como SQL.
    expect(res.body.nombres).toBe(payloadMalicioso);

    // La tabla owners sigue existiendo y es consultable: si el DROP TABLE
    // se hubiera ejecutado de verdad, esta consulta (y toda la suite)
    // habría fallado.
    const sigueExistiendo = await prisma.owner.findUnique({ where: { id: res.body.id } });
    expect(sigueExistiendo).not.toBeNull();

    await prisma.owner.delete({ where: { id: res.body.id } }).catch(() => undefined);
  });

  it("SEC10: CORS no refleja un origin arbitrario cuando CORS_ORIGIN está configurado a un valor fijo", async () => {
    const res = await request(app)
      .get("/api/sedes")
      .set("Origin", "https://sitio-arbitrario-no-autorizado.com");

    expect(res.headers["access-control-allow-origin"]).not.toBe(
      "https://sitio-arbitrario-no-autorizado.com"
    );
  });
});
