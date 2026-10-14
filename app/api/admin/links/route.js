import { NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function isValidUrl(string) {
  try {
    const url = new URL(string, "https://ravion.in");
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (type && type !== "all") {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }

    const linksCol = await getLinksCollection();
    const links = await linksCol.find(filter).sort({ order: 1, createdAt: -1 }).toArray();

    return NextResponse.json({ links });
  } catch (err) {
    console.error("GET /api/admin/links error:", err);
    return NextResponse.json({ error: "Failed to fetch links." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.title || !body.url) {
      return NextResponse.json({ error: "Title and Destination URL are required." }, { status: 400 });
    }

    const cleanUrl = String(body.url).trim();
    if (!isValidUrl(cleanUrl)) {
      return NextResponse.json({ error: "Please enter a valid URL (https://..., mailto:..., or tel:...)." }, { status: 400 });
    }

    const linksCol = await getLinksCollection();

    // Auto-compute next order if not provided
    let order = typeof body.order === "number" ? body.order : null;
    if (order === null) {
      const highest = await linksCol.find({}).sort({ order: -1 }).limit(1).toArray();
      order = highest.length && typeof highest[0].order === "number" ? highest[0].order + 1 : 1;
    }

    const doc = {
      title: String(body.title).trim(),
      url: cleanUrl,
      description: String(body.description || "").trim(),
      thumbnail: String(body.thumbnail || "").trim(),
      icon: String(body.icon || "Globe").trim(),
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
        : "Custom Link",
      order,
      featured: Boolean(body.featured),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await linksCol.insertOne(doc);
    return NextResponse.json({ link: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/links error:", err);
    return NextResponse.json({ error: err.message || "Failed to create link." }, { status: 500 });
  }
}
