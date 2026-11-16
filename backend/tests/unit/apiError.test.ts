import { ApiError } from "../../src/utils/ApiError";

describe("utils/ApiError", () => {
  it("badRequest construye un error 400 con el mensaje y detalles dados", () => {
    const err = ApiError.badRequest("Datos inválidos", { campo: "email" });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Datos inválidos");
    expect(err.details).toEqual({ campo: "email" });
  });

  it("notFound usa un mensaje por defecto cuando no se especifica uno", () => {
    const err = ApiError.notFound();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Recurso no encontrado");
  });

  it("conflict construye un error 409", () => {
    const err = ApiError.conflict("El email ya está registrado");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("El email ya está registrado");
  });
});
