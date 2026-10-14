import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid reorder payload." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const bulkOps = body.items
      .map((item) => {
        try {
          return {
            updateOne: {
              filter: { _id: new ObjectId(item.id) },
              update: { $set: { order: Number(item.order), updatedAt: new Date() } },
            },
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (bulkOps.length) {
      await linksCol.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Links reordered successfully." });
  } catch (err) {
    console.error("Link reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder links." }, { status: 500 });
  }
}
