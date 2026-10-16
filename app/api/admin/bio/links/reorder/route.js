import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function PATCH(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { links } = body;

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json(
        { error: "Expected an array of link ordering items: [{ id, order }, ...]" },
        { status: 400 }
      );
    }

    const linksCol = await getLinksCollection();
    const now = new Date();

    const updateOps = links
      .filter((item) => isValidObjectId(item.id) && typeof item.order === "number")
      .map((item) => ({
        updateOne: {
          filter: { _id: new ObjectId(item.id) },
          update: { $set: { order: item.order, updatedAt: now } },
        },
      }));

    if (updateOps.length > 0) {
      await linksCol.bulkWrite(updateOps);
    }

    const updatedLinks = await linksCol.find({}).sort({ order: 1, createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      message: "Links reordered successfully.",
      links: updatedLinks.map((l) => ({
        ...l,
        _id: l._id.toString(),
      })),
    });
  } catch (error) {
    console.error("[ADMIN BIO LINKS REORDER] error:", error);
    return NextResponse.json({ error: "Failed to reorder links." }, { status: 500 });
  }
}
