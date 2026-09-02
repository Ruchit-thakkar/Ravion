import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getInquiriesCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await getInquiriesCollection();
    const list = await inquiries.find({}).sort({ createdAt: -1 }).toArray();

    const formattedList = list.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json({ inquiries: formattedList });
  } catch (err) {
    console.error("[ADMIN_INQUIRIES_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch inquiries." },
      { status: 500 }
    );
  }
}
