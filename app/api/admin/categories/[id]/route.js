import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCategoriesCollection, getSamplesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID format." }, { status: 400 });
    }

    const [categoriesCol, samplesCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
    ]);

    const doc = await categoriesCol.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const associatedSamples = await samplesCol
      .find({ category: doc.name }, { projection: { title: 1, slug: 1, status: 1, thumbnail: 1 } })
      .toArray();

    return NextResponse.json({
      success: true,
      category: {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description || "",
        isActive: doc.isActive !== false,
        sampleCount: associatedSamples.length,
        associatedSamples: associatedSamples.map((s) => ({
          _id: s._id.toString(),
          title: s.title,
          slug: s.slug,
          status: s.status,
          thumbnail: s.thumbnail || null,
        })),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN CATEGORY GET] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve category details." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID format." }, { status: 400 });
    }

    const [categoriesCol, samplesCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
    ]);

    const existing = await categoriesCol.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, slug, description, isActive } = body;

    const cleanName = name !== undefined ? String(name).trim() : existing.name;
    if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
      return NextResponse.json(
        { error: "Category name must be between 2 and 60 characters." },
        { status: 400 }
      );
    }

    // Check duplicate name excluding current record
    const duplicateName = await categoriesCol.findOne({
      _id: { $ne: new ObjectId(id) },
      name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (duplicateName) {
      return NextResponse.json(
        { error: `Another category named "${cleanName}" already exists.` },
        { status: 400 }
      );
    }

    // Resolve slug
    let cleanSlug = slug !== undefined ? slugify(slug) : existing.slug;
    if (!cleanSlug) cleanSlug = slugify(cleanName) || `cat-${Date.now()}`;

    // Check duplicate slug excluding current record
    const duplicateSlug = await categoriesCol.findOne({
      _id: { $ne: new ObjectId(id) },
      slug: cleanSlug,
    });
    if (duplicateSlug) {
      return NextResponse.json(
        { error: `Slug "${cleanSlug}" is already in use by another category.` },
        { status: 400 }
      );
    }

    const cleanDescription = description !== undefined ? String(description).trim() : (existing.description || "");
    const cleanIsActive = isActive !== undefined ? Boolean(isActive) : (existing.isActive !== false);

    const now = new Date();
    const updatePayload = {
      $set: {
        name: cleanName,
        slug: cleanSlug,
        description: cleanDescription,
        isActive: cleanIsActive,
        updatedAt: now,
        updatedBy: admin.email,
      },
    };

    const updateResult = await categoriesCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updatePayload,
      { returnDocument: "after" }
    );

    // If name changed, update associated samples to preserve relationship
    if (cleanName !== existing.name) {
      await samplesCol.updateMany(
        { category: existing.name },
        { $set: { category: cleanName, updatedAt: now } }
      );
    }

    const sampleCount = await samplesCol.countDocuments({ category: cleanName });

    return NextResponse.json({
      success: true,
      message: `Category "${cleanName}" updated successfully.`,
      category: {
        ...updateResult,
        _id: updateResult._id.toString(),
        sampleCount,
        createdAt: updateResult.createdAt ? new Date(updateResult.createdAt).toISOString() : now.toISOString(),
        updatedAt: updateResult.updatedAt ? new Date(updateResult.updatedAt).toISOString() : now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN CATEGORY PUT] error:", error);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID format." }, { status: 400 });
    }

    const [categoriesCol, samplesCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
    ]);

    const existing = await categoriesCol.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Category not found or already deleted." }, { status: 404 });
    }

    // Dependency check: count associated samples
    const sampleCount = await samplesCol.countDocuments({ category: existing.name });

    // Check if reassignToCategory was provided in body or query param
    const { searchParams } = new URL(request.url);
    let reassignTo = searchParams.get("reassignTo");

    if (!reassignTo) {
      const body = await request.json().catch(() => ({}));
      reassignTo = body?.reassignToCategory;
    }

    if (sampleCount > 0) {
      if (!reassignTo) {
        return NextResponse.json(
          {
            error: `Cannot delete category "${existing.name}" because it is currently assigned to ${sampleCount} portfolio sample(s). Please choose a replacement category to reassign them to.`,
            sampleCount,
            requiresReassignment: true,
          },
          { status: 409 }
        );
      }

      // Validate destination category exists and is not the one being deleted
      const destCategory = await categoriesCol.findOne({ name: reassignTo });
      if (!destCategory || destCategory._id.toString() === id) {
        return NextResponse.json(
          { error: `The reassignment target category "${reassignTo}" is invalid.` },
          { status: 400 }
        );
      }

      // Reassign samples
      await samplesCol.updateMany(
        { category: existing.name },
        { $set: { category: destCategory.name, updatedAt: new Date() } }
      );
    }

    // Delete category
    await categoriesCol.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message:
        sampleCount > 0
          ? `Category "${existing.name}" deleted successfully. ${sampleCount} sample(s) reassigned to "${reassignTo}".`
          : `Category "${existing.name}" deleted successfully.`,
      deletedId: id,
      reassignedCount: sampleCount,
    });
  } catch (error) {
    console.error("[ADMIN CATEGORY DELETE] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
