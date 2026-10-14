import { NextResponse } from "next/server";
import { getProductsCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "digital", "affiliate", or null
    const status = searchParams.get("status"); // "Draft", "Published", "Archived", or null
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));

    const filter = {};
    if (type && type !== "all") {
      filter.type = type;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const productsCol = await getProductsCollection();
    const total = await productsCol.countDocuments(filter);
    const products = await productsCol
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();

    // Auto-generate or sanitize slug
    let baseSlug = slugify(body.slug || body.title);
    if (!baseSlug) baseSlug = "product-" + Date.now();
    let finalSlug = baseSlug;
    let counter = 2;
    while (await productsCol.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const type = body.type === "affiliate" ? "affiliate" : "digital";
    const status = ["Draft", "Published", "Archived"].includes(body.status) ? body.status : "Draft";

    const doc = {
      title: String(body.title).trim(),
      slug: finalSlug,
      type,
      shortDescription: String(body.shortDescription || "").trim(),
      fullDescription: String(body.fullDescription || "").trim(),
      thumbnail: String(body.thumbnail || ""),
      previewImages: Array.isArray(body.previewImages) ? body.previewImages : [],
      category: String(body.category || "General"),
      price: typeof body.price === "number" ? body.price : parseFloat(body.price || 0) || 0,
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      currency: String(body.currency || "INR"),
      deliveryMethod: body.deliveryMethod === "file" ? "file" : "external",
      purchaseUrl: String(body.purchaseUrl || "").trim(),
      fileUrl: String(body.fileUrl || "").trim(),
      affiliateUrl: String(body.affiliateUrl || "").trim(),
      originalUrl: String(body.originalUrl || "").trim(),
      tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      featured: Boolean(body.featured),
      status,
      seo: {
        title: String(body.seo?.title || body.title).trim(),
        description: String(body.seo?.description || body.shortDescription || "").trim(),
        keywords: String(body.seo?.keywords || "").trim(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await productsCol.insertOne(doc);
    return NextResponse.json({ product: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ error: err.message || "Failed to create product." }, { status: 500 });
  }
}
