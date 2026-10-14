import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getBioSectionsCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function parseFilter(id) {
  try {
    return { _id: new ObjectId(id) };
  } catch {
    return { sectionId: id };
  }
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const filter = parseFilter(id);
    const bioSectionsCol = await getBioSectionsCollection();
    const section = await bioSectionsCol.findOne(filter);

    if (!section) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (err) {
    console.error("GET section error:", err);
    return NextResponse.json({ error: "Failed to fetch section." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const filter = parseFilter(id);
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Missing body." }, { status: 400 });
    }

    const bioSectionsCol = await getBioSectionsCollection();
    const existing = await bioSectionsCol.findOne(filter);
    if (!existing) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    const updateDoc = {
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : existing.subtitle,
      order: typeof body.order === "number" ? body.order : existing.order,
      isVisible: typeof body.isVisible === "boolean" ? body.isVisible : existing.isVisible,
      status: body.status === "Draft" ? "Draft" : body.status === "Published" ? "Published" : existing.status,
      config: typeof body.config === "object" && body.config !== null ? { ...existing.config, ...body.config } : existing.config,
      updatedAt: new Date(),
    };

    await bioSectionsCol.updateOne(filter, { $set: updateDoc });
    const updated = await bioSectionsCol.findOne(filter);
    return NextResponse.json({ section: updated });
  } catch (err) {
    console.error("PUT section error:", err);
    return NextResponse.json({ error: err.message || "Failed to update section." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const filter = parseFilter(id);
    const bioSectionsCol = await getBioSectionsCollection();
    const result = await bioSectionsCol.deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Section deleted." });
  } catch (err) {
    console.error("DELETE section error:", err);
    return NextResponse.json({ error: "Failed to delete section." }, { status: 500 });
  }
}
