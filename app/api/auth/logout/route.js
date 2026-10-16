import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Invalidate cookie securely across all browsers
    response.cookies.set({
      ...COOKIE_OPTIONS,
      value: "",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error("[AUTH] Logout error:", err.message);
    return NextResponse.json(
      { error: "Failed to log out." },
      { status: 500 }
    );
  }
}
