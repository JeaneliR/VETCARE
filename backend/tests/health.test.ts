
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("VETCARE - Pruebas de API REST", () => {

  it("CP06: responde con código HTTP 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
  });

  it("CP07: devuelve el estado ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body.status).toBe("ok");
  });

  it("CP08: identifica correctamente el servicio", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body.service).toBe("vetcare-backend");
  });

  it("CP09: devuelve un timestamp válido", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body.timestamp).toBeDefined();

    const fecha = new Date(response.body.timestamp);

    expect(Number.isNaN(fecha.getTime())).toBe(false);
  });

  it("CP10: responde en formato JSON", async () => {
    const response = await request(app).get("/api/health");

    expect(response.headers["content-type"]).toMatch(/json/);
  });

});
