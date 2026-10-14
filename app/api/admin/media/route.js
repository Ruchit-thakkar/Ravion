import { NextResponse } from "next/server";
import { getMediaCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "image", "video", or null
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "60", 10)));

    const filter = {};
    if (type && type !== "all") {
      filter.fileType = type;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const mediaCol = await getMediaCollection();
    const total = await mediaCol.countDocuments(filter);
    const media = await mediaCol
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/media error:", err);
    return NextResponse.json({ error: "Failed to fetch media assets." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.url) {
      return NextResponse.json({ error: "Media URL is required." }, { status: 400 });
    }

    const mediaCol = await getMediaCollection();
    const doc = {
      fileId: body.fileId || `ext-${Date.now()}`,
      name: body.name || "Media Asset",
      url: body.url,
      thumbnailUrl: body.thumbnailUrl || body.url,
      fileType: body.fileType || "image",
      size: body.size || 0,
      mimeType: body.mimeType || "image/jpeg",
      tags: Array.isArray(body.tags) ? body.tags : ["image"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await mediaCol.insertOne(doc);
    return NextResponse.json({ media: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/media error:", err);
    return NextResponse.json({ error: err.message || "Failed to record media." }, { status: 500 });
  }
}
