import { NextResponse } from "next/server";
import { getProductsCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();
    const product = await productsCol.findOne({ slug, status: "Published" });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const isPaid = (product.price || 0) > 0;
    const sanitized = {
      _id: product._id,
      title: product.title,
      slug: product.slug,
      type: product.type,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      thumbnail: product.thumbnail,
      previewImages: product.previewImages,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      deliveryMethod: product.deliveryMethod,
      purchaseUrl: product.purchaseUrl,
      affiliateUrl: product.affiliateUrl,
      originalUrl: product.originalUrl,
      tags: product.tags,
      featured: product.featured,
      isFree: !isPaid,
      downloadUrl: !isPaid && product.fileUrl ? `/api/products/download/${product._id}` : null,
      seo: product.seo,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json({ product: sanitized });
  } catch (err) {
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ error: "Could not fetch product." }, { status: 500 });
  }
}
