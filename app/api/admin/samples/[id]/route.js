import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSamplesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sample ID format." }, { status: 400 });
    }

    const samplesCol = await getSamplesCollection();
    const doc = await samplesCol.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      sample: {
        _id: doc._id.toString(),
        title: doc.title || "",
        slug: doc.slug || "",
        category: doc.category || "",
        description: doc.description || "",
        status: doc.status || "Published",
        thumbnail: doc.thumbnail || doc.media?.[0]?.thumbnailUrl || doc.media?.[0]?.url || "",
        media: doc.media || doc.images || [],
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN SAMPLE GET] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve portfolio sample." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sample ID format." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, slug, category, description, status, media, thumbnail } = body;

    const samplesCol = await getSamplesCollection();
    const existing = await samplesCol.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }

    // 1. Validation
    const cleanTitle = title !== undefined ? String(title).trim() : existing.title;
    if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.length > 120) {
      return NextResponse.json(
        { error: "Sample title must be between 2 and 120 characters." },
        { status: 400 }
      );
    }

    const cleanCategory = category !== undefined ? String(category).trim() : existing.category;
    if (!cleanCategory) {
      return NextResponse.json(
        { error: "Please select a valid category." },
        { status: 400 }
      );
    }

    const cleanDescription = description !== undefined ? String(description).trim() : existing.description;
    const cleanStatus = status !== undefined ? (status === "Draft" ? "Draft" : "Published") : existing.status;

    const mediaArray = media !== undefined ? (Array.isArray(media) ? media : []) : (existing.media || existing.images || []);

    const resolvedThumbnail =
      thumbnail !== undefined
        ? String(thumbnail).trim() || mediaArray[0]?.thumbnailUrl || mediaArray[0]?.url || ""
        : existing.thumbnail || mediaArray[0]?.thumbnailUrl || mediaArray[0]?.url || "";

    // 2. Slug check
    let resolvedSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      const baseSlug = slugify(slug);
      let candidate = baseSlug;
      let collision = await samplesCol.findOne({ slug: candidate, _id: { $ne: new ObjectId(id) } });
      let counter = 1;
      while (collision) {
        candidate = `${baseSlug}-${counter}`;
        collision = await samplesCol.findOne({ slug: candidate, _id: { $ne: new ObjectId(id) } });
        counter++;
      }
      resolvedSlug = candidate;
    }

    const now = new Date();
    const updatePayload = {
      $set: {
        title: cleanTitle,
        slug: resolvedSlug,
        category: cleanCategory,
        description: cleanDescription,
        status: cleanStatus,
        thumbnail: resolvedThumbnail,
        media: mediaArray,
        images: mediaArray,
        updatedAt: now,
        updatedBy: admin.email,
      },
    };

    const updateResult = await samplesCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updatePayload,
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      message: "Portfolio sample updated successfully.",
      sample: {
        ...updateResult,
        _id: updateResult._id.toString(),
        createdAt: updateResult.createdAt ? new Date(updateResult.createdAt).toISOString() : now.toISOString(),
        updatedAt: updateResult.updatedAt ? new Date(updateResult.updatedAt).toISOString() : now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN SAMPLE PUT] error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio sample." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid sample ID format." }, { status: 400 });
    }

    const samplesCol = await getSamplesCollection();
    const result = await samplesCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Sample not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio sample deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("[ADMIN SAMPLE DELETE] error:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio sample." },
      { status: 500 }
    );
  }
}
