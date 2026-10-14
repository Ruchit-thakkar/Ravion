import { NextResponse } from "next/server";
import { getProductsCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "digital", "affiliate", or null
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const filter = { status: "Published" };
    if (type && ["digital", "affiliate"].includes(type)) {
      filter.type = type;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (featured === "true") {
      filter.featured = true;
    }

    const productsCol = await getProductsCollection();
    // Do not return raw internal file links for paid products directly
    const rawProducts = await productsCol
      .find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    const sanitizedProducts = rawProducts.map((p) => {
      const isPaid = (p.price || 0) > 0;
      return {
        _id: p._id,
        title: p.title,
        slug: p.slug,
        type: p.type,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        thumbnail: p.thumbnail,
        previewImages: p.previewImages,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        deliveryMethod: p.deliveryMethod,
        purchaseUrl: p.purchaseUrl,
        affiliateUrl: p.affiliateUrl,
        originalUrl: p.originalUrl,
        tags: p.tags,
        featured: p.featured,
        // Only provide direct file download url if product is explicitly free
        downloadUrl: !isPaid && p.fileUrl ? `/api/products/download/${p._id}` : null,
        isFree: !isPaid,
        seo: p.seo,
      };
    });

    return NextResponse.json({ products: sanitizedProducts });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Could not fetch products." }, { status: 500 });
  }
}
