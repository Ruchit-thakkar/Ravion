import { NextResponse } from "next/server";
import { getAdminsCollection } from "@/lib/db";
import { comparePassword, signToken, COOKIE_OPTIONS, seedDefaultAdminIfMissing } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Ensure database and initial admin exists
    await seedDefaultAdminIfMissing();

    const admins = await getAdminsCollection();
    const admin = await admins.findOne({ email: cleanEmail });

    if (!admin || !admin.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (admin.role !== "admin") {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

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
