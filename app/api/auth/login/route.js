import { NextResponse } from "next/server";
import { getAdminsCollection } from "@/lib/db";
import { comparePassword, signToken, COOKIE_OPTIONS, seedDefaultAdminIfMissing } from "@/lib/auth";

export const runtime = "nodejs";

// In-memory sliding window rate limiter for admin login to prevent brute force
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return true;

  // Clean expired
  if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return true;
  }

  return record.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function resetAttempts(ip) {
  loginAttempts.delete(ip);
}

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many failed login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Ensure database exists and check initial admin
    await seedDefaultAdminIfMissing();

    const admins = await getAdminsCollection();
    const admin = await admins.findOne({ email: cleanEmail });

    if (!admin || !admin.passwordHash || admin.role !== "admin") {
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

    // Success - reset attempts
    resetAttempts(ip);

    // Generate JWT
    const token = signToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: admin.email,
        role: admin.role,
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set(COOKIE_OPTIONS.name, token, {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
      path: COOKIE_OPTIONS.path,
      maxAge: COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (err) {
    console.error("[LOGIN_API_ERROR]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
