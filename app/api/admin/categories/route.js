import { NextResponse } from "next/server";
import {
  getCategoriesCollection,
  getSamplesCollection,
  getProductsCollection,
  getLinksCollection,
  ensureDefaultCategories,
} from "@/lib/db";
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

    await ensureDefaultCategories();
    const [categoriesCol, samplesCol, productsCol, linksCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
      getProductsCollection(),
      getLinksCollection(),
    ]);

    const categories = await categoriesCol.find({}).sort({ order: 1, name: 1 }).toArray();

    // Attach usage counts across samples, products, and links
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const [sampleCount, productCount, linkCount] = await Promise.all([
          samplesCol.countDocuments({ category: cat.name }),
          productsCol.countDocuments({ category: cat.name }),
          linksCol.countDocuments({ category: cat.name }),
        ]);

        return {
          ...cat,
          sampleCount,
          productCount,
          linkCount,
          totalUsage: sampleCount + productCount + linkCount,
        };
      })
    );

    return NextResponse.json({ categories: enriched });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Could not fetch categories." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const trimmedName = String(body.name || "").trim();

    if (!trimmedName) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const categoriesCol = await getCategoriesCollection();
    let slug = slugify(body.slug || trimmedName);

    // Check if category name already exists
    const existing = await categoriesCol.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });
    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    }

    // Ensure unique slug
    let n = 2;
    let baseSlug = slug;
    while (await categoriesCol.findOne({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const highest = await categoriesCol.find({}).sort({ order: -1 }).limit(1).toArray();
    const nextOrder = highest.length && typeof highest[0].order === "number" ? highest[0].order + 1 : 1;

    const newCategory = {
      name: trimmedName,
      slug,
      description: String(body.description || "").trim(),
      icon: String(body.icon || "Folder").trim(),
      order: typeof body.order === "number" ? body.order : nextOrder,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await categoriesCol.insertOne(newCategory);
    return NextResponse.json({ category: { ...newCategory, _id: res.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
