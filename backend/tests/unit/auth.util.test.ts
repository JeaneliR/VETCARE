import { hashPassword, comparePassword, signToken, verifyToken } from "../../src/utils/auth";

describe("utils/auth - hashing de contraseñas", () => {
  it("genera un hash distinto al texto plano y permite compararlo correctamente", async () => {
    const plain = "admin123";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    await expect(comparePassword(plain, hash)).resolves.toBe(true);
    await expect(comparePassword("clave-incorrecta", hash)).resolves.toBe(false);
  });
});

describe("utils/auth - JWT", () => {
  it("firma y verifica un token válido, recuperando el payload original", () => {
    const token = signToken({ sub: 7, rol: "ADMIN" });
    const payload = verifyToken(token);

    expect(payload.sub).toBe(7);
    expect(payload.rol).toBe("ADMIN");
  });

  it("rechaza un token manipulado o con formato inválido", () => {
    expect(() => verifyToken("esto-no-es-un-jwt-valido")).toThrow();
  });

  it("rechaza un token firmado con otra clave secreta", () => {
    const jwt = require("jsonwebtoken");
    const tokenAjeno = jwt.sign({ sub: 1, rol: "STAFF" }, "otra-clave-distinta");

    expect(() => verifyToken(tokenAjeno)).toThrow();
  });
});
