import { NextResponse } from "next/server";
import { getBioSectionsCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const VALID_SECTION_TYPES = [
  "profile_header",
  "about_me",
  "featured_products",
  "digital_products",
  "affiliate_recommendations",
  "custom_links",
  "social_links",
  "promotional_banner",
  "announcement",
  "newsletter",
  "custom_text",
  "footer",
];

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.type) {
      return NextResponse.json({ error: "Section type is required." }, { status: 400 });
    }

    if (!VALID_SECTION_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid section type. Must be one of: ${VALID_SECTION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const bioSectionsCol = await getBioSectionsCollection();
    const highest = await bioSectionsCol.find({}).sort({ order: -1 }).limit(1).toArray();
    const nextOrder = highest.length && typeof highest[0].order === "number" ? highest[0].order + 1 : 1;

    const doc = {
      sectionId: `sec-${Date.now()}`,
      type: body.type,
      title: String(body.title || body.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).trim(),
      subtitle: String(body.subtitle || "").trim(),
      order: typeof body.order === "number" ? body.order : nextOrder,
      isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : true,
      status: body.status === "Draft" ? "Draft" : "Published",
      config: typeof body.config === "object" && body.config !== null ? body.config : {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await bioSectionsCol.insertOne(doc);
    return NextResponse.json({ section: { ...doc, _id: res.insertedId } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/bio/sections error:", err);
    return NextResponse.json({ error: err.message || "Failed to create bio section." }, { status: 500 });
  }
}
