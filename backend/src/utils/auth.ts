import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET ?? "vetcare-secreto-de-desarrollo") as jwt.Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "12h") as jwt.SignOptions["expiresIn"];

export interface TokenPayload {
  sub: number;
  rol: "ADMIN" | "STAFF";
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string" || !decoded.rol) {
    throw new Error("Token inválido");
  }

  const sub = Number(decoded.sub);
  if (!Number.isFinite(sub)) {
    throw new Error("Token inválido");
  }

  return {
    sub,
    rol: decoded.rol as "ADMIN" | "STAFF",
  };
}
