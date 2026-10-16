import { NextResponse } from "next/server";
import { getCategoriesCollection, getSamplesCollection } from "@/lib/db";
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
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const sortBy = (searchParams.get("sortBy") || "name").toLowerCase().trim();

    const [categoriesCol, samplesCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
    ]);

    // Build filter
    const filter = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: { $regex: regex } }, { slug: { $regex: regex } }, { description: { $regex: regex } }];
    }

    const sort =
      sortBy === "newest"
        ? { createdAt: -1 }
        : sortBy === "oldest"
        ? { createdAt: 1 }
        : { name: 1 };

    const rawCategories = await categoriesCol.find(filter).sort(sort).toArray();

    // Compute associated sample counts for each category
    const categories = await Promise.all(
      rawCategories.map(async (cat) => {
        const sampleCount = await samplesCol.countDocuments({ category: cat.name });
        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          isActive: cat.isActive !== false,
          sampleCount,
          createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories,
      totalCount: categories.length,
    });
  } catch (error) {
    console.error("[ADMIN CATEGORIES GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, slug, description, isActive } = body;

    const cleanName = String(name || "").trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
      return NextResponse.json(
        { error: "Category name is required (between 2 and 60 characters)." },
        { status: 400 }
      );
    }

    const categoriesCol = await getCategoriesCollection();

    // Check duplicate name (case-insensitive)
    const existingName = await categoriesCol.findOne({
      name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingName) {
      return NextResponse.json(
        { error: `A category named "${cleanName}" already exists.` },
        { status: 400 }
      );
    }

    // Resolve slug
    let cleanSlug = slugify(slug || cleanName);
    if (!cleanSlug) cleanSlug = `cat-${Date.now()}`;

    // Check duplicate slug
    const existingSlug = await categoriesCol.findOne({ slug: cleanSlug });
    if (existingSlug) {
      return NextResponse.json(
        { error: `A category with slug "${cleanSlug}" already exists. Please choose another slug.` },
        { status: 400 }
      );
    }

    const cleanDescription = String(description || "").trim();
    const now = new Date();

    const newCategory = {
      name: cleanName,
      slug: cleanSlug,
      description: cleanDescription,
      isActive: isActive !== false,
      createdAt: now,
      updatedAt: now,
      createdBy: admin.email,
    };

    const result = await categoriesCol.insertOne(newCategory);

    return NextResponse.json(
      {
        success: true,
        message: `Category "${cleanName}" created successfully.`,
        category: {
          ...newCategory,
          _id: result.insertedId.toString(),
          sampleCount: 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN CATEGORIES POST] error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
