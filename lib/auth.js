import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAdminsCollection } from "./db.js";

export const ADMIN_COOKIE_NAME = "ravion_admin_token";
const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret-ravion-change-me";

export const COOKIE_OPTIONS = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, passwordHash) {
  return await bcrypt.compare(plainPassword, passwordHash);
}

export function signToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || "admin",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.role === "admin") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(request) {
  // First check HttpOnly cookie session
  const cookieAdmin = await getCurrentAdmin();
  if (cookieAdmin && cookieAdmin.role === "admin") {
    return cookieAdmin;
  }

  // Fallback check Authorization header Bearer token
  if (request && typeof request.headers?.get === "function") {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const bearerAdmin = verifyToken(token);
      if (bearerAdmin && bearerAdmin.role === "admin") {
        return bearerAdmin;
      }
    }
  }

  return null;
}


/**
 * Ensures the default initial admin account exists in MongoDB with a bcrypt hash.
 */
export async function seedDefaultAdminIfMissing() {
  try {
    const admins = await getAdminsCollection();
    const defaultEmail = "ruchit@gmail.com";
    const existing = await admins.findOne({ email: defaultEmail });
    
    if (!existing) {
      const passwordHash = await hashPassword("ruchit@123");
      const now = new Date();
      await admins.insertOne({
        email: defaultEmail,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[AUTH] Seeded default admin: ${defaultEmail}`);
    }
  } catch (err) {
    console.error("[AUTH] Error checking/seeding default admin:", err.message);
  }
}
