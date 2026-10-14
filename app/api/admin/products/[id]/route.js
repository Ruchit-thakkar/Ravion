import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();
    const product = await productsCol.findOne({ _id: objId });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("GET product error:", err);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();
    const existing = await productsCol.findOne({ _id: objId });
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Check slug uniqueness if changed
    let finalSlug = existing.slug;
    if (body.slug && slugify(body.slug) !== existing.slug) {
      const candidateSlug = slugify(body.slug);
      const conflict = await productsCol.findOne({ slug: candidateSlug, _id: { $ne: objId } });
      if (conflict) {
        let counter = 2;
        let altSlug = `${candidateSlug}-${counter++}`;
        while (await productsCol.findOne({ slug: altSlug, _id: { $ne: objId } })) {
          altSlug = `${candidateSlug}-${counter++}`;
        }
        finalSlug = altSlug;
      } else {
        finalSlug = candidateSlug;
      }
    }

    const updatedDoc = {
      title: String(body.title).trim(),
      slug: finalSlug,
      type: body.type === "affiliate" ? "affiliate" : "digital",
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
      status: ["Draft", "Published", "Archived"].includes(body.status) ? body.status : existing.status,
      seo: {
        title: String(body.seo?.title || body.title).trim(),
        description: String(body.seo?.description || body.shortDescription || "").trim(),
        keywords: String(body.seo?.keywords || "").trim(),
      },
      updatedAt: new Date(),
    };

    await productsCol.updateOne({ _id: objId }, { $set: updatedDoc });
    return NextResponse.json({ product: { ...updatedDoc, _id: objId } });
  } catch (err) {
    console.error("PUT product error:", err);
    return NextResponse.json({ error: err.message || "Failed to update product." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();
    const result = await productsCol.deleteOne({ _id: objId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted." });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const productsCol = await getProductsCollection();
    const product = await productsCol.findOne({ _id: objId });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Action: duplicate
    if (body.action === "duplicate") {
      let baseSlug = `${product.slug}-copy`;
      let finalSlug = baseSlug;
      let counter = 2;
      while (await productsCol.findOne({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-${counter++}`;
      }

      const duplicateDoc = {
        ...product,
        _id: undefined,
        title: `${product.title} (Copy)`,
        slug: finalSlug,
        status: "Draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete duplicateDoc._id;

      const insertRes = await productsCol.insertOne(duplicateDoc);
      return NextResponse.json({
        success: true,
        product: { ...duplicateDoc, _id: insertRes.insertedId },
        message: "Product duplicated as draft.",
      });
    }

    // Action: status toggle or specific fields update
    const updateFields = { updatedAt: new Date() };
    if (body.status && ["Draft", "Published", "Archived"].includes(body.status)) {
      updateFields.status = body.status;
    }
    if (typeof body.featured === "boolean") {
      updateFields.featured = body.featured;
    }

    await productsCol.updateOne({ _id: objId }, { $set: updateFields });
    const updated = await productsCol.findOne({ _id: objId });
    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("PATCH product error:", err);
    return NextResponse.json({ error: "Failed to perform action." }, { status: 500 });
  }
}
