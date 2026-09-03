import { NextResponse } from "next/server";
import { getSamplesCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limitParam = searchParams.get("limit");

    const samplesCol = await getSamplesCollection();

    const query = { status: "Published" };
    if (category && category !== "All") {
      query.category = category;
    }

    let cursor = samplesCol.find(query).sort({ createdAt: -1 });

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        cursor = cursor.limit(limit);
      }
    }

    const data = await cursor.toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Public samples GET error:", error);
    return NextResponse.json({ error: "Failed to fetch samples." }, { status: 500 });
  }
}
