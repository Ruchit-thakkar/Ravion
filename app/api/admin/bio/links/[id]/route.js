import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

function isValidUrl(string) {
  if (!string || typeof string !== "string") return false;
  const trimmed = string.trim();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return false;
  }
  // Internal relative paths or anchors
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }
  // mailto: or tel:
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed) || /^tel:[+0-9\s\-()]+$/i.test(trimmed)) {
    return true;
  }
  // Full HTTP / HTTPS URL
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid link ID format." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const link = await linksCol.findOne({ _id: new ObjectId(id) });
    if (!link) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      link: {
        ...link,
        _id: link._id.toString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN BIO LINK GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch link." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid link ID format." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const existing = await linksCol.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Link not found or already deleted." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, url, description, icon, thumbnail, isActive, isFeatured, order } = body;

    // Validate title if provided
    let cleanTitle = existing.title;
    if (title !== undefined) {
      cleanTitle = String(title).trim();
      if (!cleanTitle || cleanTitle.length < 1) {
        return NextResponse.json(
          { error: "Link title cannot be empty." },
          { status: 400 }
        );
      }
      if (cleanTitle.length > 120) {
        return NextResponse.json(
          { error: "Link title cannot exceed 120 characters." },
          { status: 400 }
        );
      }
    }

    // Validate URL if provided
    let cleanUrl = existing.url;
    if (url !== undefined) {
      cleanUrl = String(url).trim();
      if (!cleanUrl) {
        return NextResponse.json(
          { error: "Destination URL cannot be empty." },
          { status: 400 }
        );
      }
      if (!isValidUrl(cleanUrl)) {
        return NextResponse.json(
          { error: "Invalid or unsafe destination URL format." },
          { status: 400 }
        );
      }
    }

    const cleanDescription = description !== undefined ? String(description).trim() : (existing.description || "");
    const cleanIcon = icon !== undefined ? String(icon).trim() : (existing.icon || "globe");
    const cleanThumbnail = thumbnail !== undefined ? String(thumbnail).trim() : (existing.thumbnail || "");
    const cleanIsActive = isActive !== undefined ? Boolean(isActive) : (existing.isActive !== false);
    const cleanIsFeatured = isFeatured !== undefined ? Boolean(isFeatured) : Boolean(existing.isFeatured);
    const cleanOrder = typeof order === "number" ? order : existing.order;

    const now = new Date();
    const updatePayload = {
      $set: {
        title: cleanTitle,
        url: cleanUrl,
        description: cleanDescription,
        icon: cleanIcon,
        thumbnail: cleanThumbnail,
        isActive: cleanIsActive,
        isFeatured: cleanIsFeatured,
        order: cleanOrder,
        updatedAt: now,
        updatedBy: admin.email,
      },
    };

    await linksCol.updateOne({ _id: new ObjectId(id) }, updatePayload);
    const updated = await linksCol.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: `Link "${cleanTitle}" updated successfully.`,
      link: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN BIO LINK PUT] error:", error);
    return NextResponse.json({ error: "Failed to update link." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid link ID format." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();
    const existing = await linksCol.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Link not found or already deleted." }, { status: 404 });
    }

    await linksCol.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: `Link "${existing.title}" deleted successfully.`,
      deletedId: id,
    });
  } catch (error) {
    console.error("[ADMIN BIO LINK DELETE] error:", error);
    return NextResponse.json({ error: "Failed to delete link." }, { status: 500 });
  }
}
