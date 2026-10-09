import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAdminsCollection } from "./db.js";

export const ADMIN_COOKIE_NAME = "ravion_admin_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[SECURITY] JWT_SECRET is not defined in production environment.");
    }
    return "dev-ravion-local-secret-do-not-use-in-production";
  }
  return secret;
}

export const COOKIE_OPTIONS = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return await bcrypt.compare(plainPassword, passwordHash);
}

export function signToken(payload) {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || "admin",
    },
    secret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    if (!token) return null;
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
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
 * Ensures an admin exists if ADMIN_EMAIL and ADMIN_PASSWORD are provided in environment,
 * without using hardcoded plaintext credentials in source code.
 */
export async function seedDefaultAdminIfMissing() {
  try {
    const admins = await getAdminsCollection();
    const adminCount = await admins.countDocuments();
    if (adminCount > 0) {
      // Admins already exist in MongoDB
      return;
    }

    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD;

    if (envEmail && envPassword) {
      const passwordHash = await hashPassword(envPassword);
      const now = new Date();
      await admins.insertOne({
        email: envEmail,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[AUTH] Provisioned initial admin from environment: ${envEmail}`);
    }
  } catch (err) {
    console.error("[AUTH] Error checking/provisioning initial admin:", err.message);
  }
}
