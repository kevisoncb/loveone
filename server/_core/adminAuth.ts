import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export interface AdminToken {
  type: "admin";
  iat: number;
  exp: number;
}

export function generateAdminToken(): string {
  const token = jwt.sign(
    { type: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
}

export function verifyAdminToken(token: string): AdminToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminToken;
    if (decoded.type === "admin") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
