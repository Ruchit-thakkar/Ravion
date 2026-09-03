import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSamplesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sample ID." }, { status: 400 });
    }

    const body = await request.json();
    const { title, category, description, status, media, images } = body;

    const samplesCol = await getSamplesCollection();
    const existing = await samplesCol.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    }

    const updateFields = { updatedAt: new Date() };

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      updateFields.title = trimmedTitle;
      if (trimmedTitle !== existing.title) {
        updateFields.slug = slugify(trimmedTitle);
      }
    }

    if (category !== undefined) {
      const trimmedCategory = category.trim();
      if (!trimmedCategory) {
        return NextResponse.json({ error: "Category cannot be empty." }, { status: 400 });
      }
      updateFields.category = trimmedCategory;
    }

    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    if (status !== undefined) {
      updateFields.status = status === "Draft" ? "Draft" : "Published";
    }

    if (media !== undefined || images !== undefined) {
      const targetMedia = media !== undefined ? media : images;
      updateFields.media = targetMedia;
      updateFields.images = targetMedia;
      updateFields.thumbnail =
        targetMedia[0]?.thumbnailUrl || targetMedia[0]?.url || "";
    }

    await samplesCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    const updated = await samplesCol.findOne({ _id: new ObjectId(id) });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin sample PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Could not update sample." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sample ID." }, { status: 400 });
    }

    const samplesCol = await getSamplesCollection();
    await samplesCol.deleteOne({ _id: new ObjectId(id) });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Admin sample DELETE error:", error);
    return NextResponse.json({ error: "Could not delete sample." }, { status: 500 });
  }
}
