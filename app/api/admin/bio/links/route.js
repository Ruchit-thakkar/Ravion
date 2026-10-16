import { NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

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

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const linksCol = await getLinksCollection();
    const rawLinks = await linksCol.find({}).sort({ order: 1, createdAt: -1 }).toArray();
    const links = rawLinks.map((l) => ({
      ...l,
      _id: l._id.toString(),
    }));

    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error("[ADMIN BIO LINKS GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch links." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, url, description, icon, thumbnail, isActive, isFeatured, order } = body;

    // Validate title
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle || cleanTitle.length < 1) {
      return NextResponse.json(
        { error: "Link title is required." },
        { status: 400 }
      );
    }
    if (cleanTitle.length > 120) {
      return NextResponse.json(
        { error: "Link title cannot exceed 120 characters." },
        { status: 400 }
      );
    }

    // Validate destination URL
    const cleanUrl = String(url || "").trim();
    if (!cleanUrl) {
      return NextResponse.json(
        { error: "Destination URL is required." },
        { status: 400 }
      );
    }
    if (!isValidUrl(cleanUrl)) {
      return NextResponse.json(
        { error: "Invalid or unsafe destination URL. Please provide a valid web URL (e.g. https://...), internal link (/...), mailto:, or tel:." },
        { status: 400 }
      );
    }

    const linksCol = await getLinksCollection();

    // Determine display order
    let linkOrder = typeof order === "number" ? order : null;
    if (linkOrder === null || isNaN(linkOrder)) {
      const highestOrderDoc = await linksCol.find({}).sort({ order: -1 }).limit(1).toArray();
      linkOrder = highestOrderDoc.length > 0 && typeof highestOrderDoc[0].order === "number"
        ? highestOrderDoc[0].order + 1
        : 1;
    }

    const now = new Date();
    const newLink = {
      title: cleanTitle,
      url: cleanUrl,
      description: String(description || "").trim(),
      icon: String(icon || "globe").trim(),
      thumbnail: String(thumbnail || "").trim(),
      isActive: isActive !== false,
      isFeatured: Boolean(isFeatured),
      order: linkOrder,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: admin.email,
    };

    const insertResult = await linksCol.insertOne(newLink);

    return NextResponse.json(
      {
        success: true,
        message: `Link "${cleanTitle}" added successfully.`,
        link: {
          ...newLink,
          _id: insertResult.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN BIO LINKS POST] error:", error);
    return NextResponse.json({ error: "Failed to create link." }, { status: 500 });
  }
}
