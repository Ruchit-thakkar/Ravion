import { NextResponse } from "next/server";
import { getAdminsCollection } from "@/lib/db";
import { comparePassword, signToken, COOKIE_OPTIONS, seedDefaultAdminIfMissing } from "@/lib/auth";

export const runtime = "nodejs";

// Rate limiting for admin login: max 5 failed attempts within 15 minutes per IP
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return false;

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.failedCount >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { failedCount: 1, firstAttempt: now });
  } else {
    record.failedCount += 1;
  }
}

function clearFailedAttempts(ip) {
  loginAttempts.delete(ip);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "Too many failed login attempts. Please wait 15 minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // 1. Input Validation
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length === 0) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    // Ensure default initial admin is seeded if DB is brand new
    await seedDefaultAdminIfMissing();

    const adminsCol = await getAdminsCollection();
    const admin = await adminsCol.findOne({ email });

    // 2. Credentials check
    if (!admin || !admin.passwordHash) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Authentication Succeeded
    clearFailedAttempts(ip);

    // Update last login timestamp in DB
    await adminsCol.updateOne(
      { _id: admin._id },
      { $set: { lastLoginAt: new Date() } }
    ).catch(() => {});

    const token = signToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role || "admin",
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role || "admin",
      },
    });

    // Set secure, HttpOnly session cookie
    response.cookies.set({
      ...COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (err) {
    console.error("[AUTH] Login error:", err.message);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
