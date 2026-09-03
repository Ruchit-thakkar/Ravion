import { NextResponse } from "next/server";
import { getCategoriesCollection, getSamplesCollection, ensureDefaultCategories } from "@/lib/db";
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
    const categoriesCol = await getCategoriesCollection();
    const samplesCol = await getSamplesCollection();

    const categories = await categoriesCol.find({}).sort({ name: 1 }).toArray();

    // Attach sample counts to categories
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await samplesCol.countDocuments({ category: cat.name });
        return {
          ...cat,
          sampleCount: count,
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

    const { name, description = "" } = await request.json();
    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const categoriesCol = await getCategoriesCollection();
    let slug = slugify(trimmedName);
    
    // Check if category name already exists (case-insensitive)
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

    const newCategory = {
      name: trimmedName,
      slug,
      description: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await categoriesCol.insertOne(newCategory);
    return NextResponse.json(
      { category: { ...newCategory, _id: result.insertedId, sampleCount: 0 } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
