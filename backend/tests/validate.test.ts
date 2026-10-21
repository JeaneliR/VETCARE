
import { describe, it, expect } from "vitest";
import { parseIdParam } from "../src/middleware/validate";
import { ApiError } from "../src/utils/ApiError";

describe("VETCARE - Validación de identificadores", () => {

  it("CP01: acepta un identificador válido", () => {
    expect(parseIdParam("5")).toBe(5);
  });

  it("CP02: rechaza el identificador cero", () => {
    expect(() => parseIdParam("0")).toThrow(ApiError);
  });

  it("CP03: rechaza identificadores negativos", () => {
    expect(() => parseIdParam("-3")).toThrow(ApiError);
  });

  it("CP04: rechaza valores no numéricos", () => {
    expect(() => parseIdParam("abc")).toThrow(ApiError);
  });

  it("CP05: rechaza números decimales", () => {
    expect(() => parseIdParam("2.5")).toThrow(ApiError);
  });

});
