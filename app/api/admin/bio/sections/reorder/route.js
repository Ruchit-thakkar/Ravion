import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getBioSectionsCollection } from "@/lib/db";
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

    const bioSectionsCol = await getBioSectionsCollection();
    const bulkOps = body.items
      .map((item) => {
        let filter;
        try {
          filter = { _id: new ObjectId(item.id) };
        } catch {
          filter = { sectionId: item.id };
        }

        return {
          updateOne: {
            filter,
            update: { $set: { order: Number(item.order), updatedAt: new Date() } },
          },
        };
      })
      .filter(Boolean);

    if (bulkOps.length) {
      await bioSectionsCol.bulkWrite(bulkOps);
    }

    const sections = await bioSectionsCol.find({}).sort({ order: 1 }).toArray();
    return NextResponse.json({ success: true, sections, message: "Sections reordered successfully." });
  } catch (err) {
    console.error("Bio sections reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder bio sections." }, { status: 500 });
  }
}
