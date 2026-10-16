import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);

    if (!admin) {
      return NextResponse.json(
        { authenticated: false, admin: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        email: admin.email,
        role: admin.role || "admin",
      },
    });
  } catch (err) {
    console.error("[AUTH] Me check error:", err.message);
    return NextResponse.json(
      { authenticated: false, admin: null },
      { status: 500 }
    );
  }
}
