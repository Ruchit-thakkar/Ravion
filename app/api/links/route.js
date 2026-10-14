import { NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const now = new Date();
    const filter = {
      isActive: true,
      $and: [
        {
          $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }],
        },
        {
          $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
        },
      ],
    };

    if (category && category !== "all") {
      filter.category = category;
    }

    const linksCol = await getLinksCollection();
    const links = await linksCol
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ links });
  } catch (err) {
    console.error("GET /api/links error:", err);
    return NextResponse.json({ error: "Could not fetch links." }, { status: 500 });
  }
}
