import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: admin.userId,
      email: admin.email,
      role: admin.role,
    },
  });
}
