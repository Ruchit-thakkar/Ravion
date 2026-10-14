import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function isValidUrl(string) {
  try {
    const url = new URL(string, "https://ravion.in");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const objId = parseObjectId(id);
    if (!objId) {
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const link = await linksCol.findOne({ _id: objId });
    if (!link) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    return NextResponse.json({ link });
  } catch (err) {
    console.error("GET link error:", err);
    return NextResponse.json({ error: "Failed to fetch link." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const objId = parseObjectId(id);
    if (!objId) {
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.title || !body.url) {
      return NextResponse.json({ error: "Title and destination URL are required." }, { status: 400 });
    }

    const cleanUrl = String(body.url).trim();
    if (!isValidUrl(cleanUrl)) {
      return NextResponse.json({ error: "Please enter a valid URL." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const existing = await linksCol.findOne({ _id: objId });
    if (!existing) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    const updateDoc = {
      title: String(body.title).trim(),
      url: cleanUrl,
      description: String(body.description || "").trim(),
      thumbnail: String(body.thumbnail || "").trim(),
      icon: String(body.icon || existing.icon || "Globe").trim(),
      category: String(body.category || "General").trim(),
      buttonText: String(body.buttonText || "Open Link").trim(),
      type: [
        "Website",
        "Social Media",
        "Affiliate Link",
        "Digital Product",
        "Blog Article",
        "External Resource",
        "Custom Link",
      ].includes(body.type)
        ? body.type
        : existing.type,
      order: typeof body.order === "number" ? body.order : existing.order,
      featured: typeof body.featured === "boolean" ? body.featured : existing.featured,
      isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      updatedAt: new Date(),
    };

    await linksCol.updateOne({ _id: objId }, { $set: updateDoc });
    return NextResponse.json({ link: { ...updateDoc, _id: objId } });
  } catch (err) {
    console.error("PUT link error:", err);
    return NextResponse.json({ error: err.message || "Failed to update link." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const objId = parseObjectId(id);
    if (!objId) {
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const result = await linksCol.deleteOne({ _id: objId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Link deleted." });
  } catch (err) {
    console.error("DELETE link error:", err);
    return NextResponse.json({ error: "Failed to delete link." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const objId = parseObjectId(id);
    if (!objId) {
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const linksCol = await getLinksCollection();
    const link = await linksCol.findOne({ _id: objId });
    if (!link) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    // Duplicate action
    if (body.action === "duplicate") {
      const highest = await linksCol.find({}).sort({ order: -1 }).limit(1).toArray();
      const nextOrder = highest.length ? highest[0].order + 1 : 1;

      const duplicate = {
        ...link,
        _id: undefined,
        title: `${link.title} (Copy)`,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete duplicate._id;

      const res = await linksCol.insertOne(duplicate);
      return NextResponse.json({
        success: true,
        link: { ...duplicate, _id: res.insertedId },
        message: "Link duplicated.",
      });
    }

    // Toggle active / featured / reorder
    const updateFields = { updatedAt: new Date() };
    if (typeof body.isActive === "boolean") {
      updateFields.isActive = body.isActive;
    }
    if (typeof body.featured === "boolean") {
      updateFields.featured = body.featured;
    }
    if (typeof body.order === "number") {
      updateFields.order = body.order;
    }

    await linksCol.updateOne({ _id: objId }, { $set: updateFields });
    const updated = await linksCol.findOne({ _id: objId });
    return NextResponse.json({ link: updated });
  } catch (err) {
    console.error("PATCH link error:", err);
    return NextResponse.json({ error: "Failed to perform action." }, { status: 500 });
  }
}
