import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });
    }

    const { name, description } = await request.json();
    const categoriesCol = await getCategoriesCollection();
    const existing = await categoriesCol.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const updateFields = { updatedAt: new Date() };

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json({ error: "Category name cannot be empty." }, { status: 400 });
      }

      // Check if duplicate name on another category
      const duplicate = await categoriesCol.findOne({
        _id: { $ne: new ObjectId(id) },
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Another category with this name already exists." }, { status: 409 });
      }

      updateFields.name = trimmedName;
      updateFields.slug = slugify(trimmedName);

      // If category name changed, update existing samples with this category
      if (existing.name !== trimmedName) {
        const samplesCol = await getSamplesCollection();
        await samplesCol.updateMany(
          { category: existing.name },
          { $set: { category: trimmedName, updatedAt: new Date() } }
        );
      }
    }

    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    await categoriesCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    const updated = await categoriesCol.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Admin category PATCH error:", error);
    return NextResponse.json({ error: "Could not update category." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });
    }

    const categoriesCol = await getCategoriesCollection();
    const category = await categoriesCol.findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    await categoriesCol.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ error: "Could not delete category." }, { status: 500 });
  }
}
