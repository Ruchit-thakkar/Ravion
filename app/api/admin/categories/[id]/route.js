import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getCategoriesCollection,
  getSamplesCollection,
  getProductsCollection,
  getLinksCollection,
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

export async function PUT(request, context) {
  return handleUpdate(request, context);
}

export async function PATCH(request, context) {
  return handleUpdate(request, context);
}

async function handleUpdate(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const categoriesCol = await getCategoriesCollection();
    const existing = await categoriesCol.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const updateFields = { updatedAt: new Date() };

    if (body.name !== undefined) {
      const trimmedName = String(body.name).trim();
      if (!trimmedName) {
        return NextResponse.json({ error: "Category name cannot be empty." }, { status: 400 });
      }

      const duplicate = await categoriesCol.findOne({
        _id: { $ne: new ObjectId(id) },
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Another category with this name already exists." }, { status: 409 });
      }

      updateFields.name = trimmedName;
      updateFields.slug = slugify(body.slug || trimmedName);

      // Cascade name change to samples, products, links
      if (existing.name !== trimmedName) {
        const [samplesCol, productsCol, linksCol] = await Promise.all([
          getSamplesCollection(),
          getProductsCollection(),
          getLinksCollection(),
        ]);

        await Promise.allSettled([
          samplesCol.updateMany({ category: existing.name }, { $set: { category: trimmedName } }),
          productsCol.updateMany({ category: existing.name }, { $set: { category: trimmedName } }),
          linksCol.updateMany({ category: existing.name }, { $set: { category: trimmedName } }),
        ]);
      }
    }

    if (body.description !== undefined) {
      updateFields.description = String(body.description).trim();
    }
    if (body.icon !== undefined) {
      updateFields.icon = String(body.icon).trim();
    }
    if (typeof body.order === "number") {
      updateFields.order = body.order;
    }
    if (typeof body.isActive === "boolean") {
      updateFields.isActive = body.isActive;
    }

    await categoriesCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    const updated = await categoriesCol.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Admin category update error:", error);
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

    const [categoriesCol, samplesCol, productsCol, linksCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
      getProductsCollection(),
      getLinksCollection(),
    ]);

    const category = await categoriesCol.findOne({ _id: new ObjectId(id) });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Safety check: Prevent deletion if still used by samples, products, or links
    const [sampleCount, productCount, linkCount] = await Promise.all([
      samplesCol.countDocuments({ category: category.name }),
      productsCol.countDocuments({ category: category.name }),
      linksCol.countDocuments({ category: category.name }),
    ]);

    const totalUsage = sampleCount + productCount + linkCount;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (totalUsage > 0 && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}". It is currently assigned to ${productCount} product(s), ${linkCount} link(s), and ${sampleCount} sample(s). Please reassign them first or delete them.`,
          inUse: true,
          details: { sampleCount, productCount, linkCount, totalUsage },
        },
        { status: 409 }
      );
    }

    await categoriesCol.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ error: "Could not delete category." }, { status: 500 });
  }
}
