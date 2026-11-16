
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "vetcare-secreto-de-desarrollo";

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN ?? "12h") as SignOptions["expiresIn"];

export interface TokenPayload {
  sub: number;
  rol: "ADMIN" | "STAFF";
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded !== "object" ||
    decoded === null
  ) {
    throw new Error("Token JWT inválido");
  }

  const sub =
    typeof decoded.sub === "number"
      ? decoded.sub
      : typeof decoded.sub === "string" && decoded.sub.trim() !== ""
        ? Number(decoded.sub)
        : NaN;

  if (
    !Number.isSafeInteger(sub) ||
    sub <= 0 ||
    (decoded.rol !== "ADMIN" && decoded.rol !== "STAFF")
  ) {
    throw new Error("Token JWT con estructura inválida");
  }

  return {
    sub,
    rol: decoded.rol,
  };
}
