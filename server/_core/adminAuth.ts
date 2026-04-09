
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

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

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH is not set. Cannot verify password.');
    return false;
  }
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}
