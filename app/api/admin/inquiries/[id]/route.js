import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getInquiriesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const VALID_STATUSES = ["new", "read", "in_progress", "resolved"];

function isValidObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID format." }, { status: 400 });
    }

    const inquiriesCol = await getInquiriesCollection();
    const doc = await inquiriesCol.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        _id: doc._id.toString(),
        name: doc.name || "Anonymous",
        email: doc.email || "No email",
        phone: doc.phone || "",
        service: doc.service || "Creative Project",
        message: doc.message || "",
        status: (doc.status || "new").toLowerCase(),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN INQUIRY GET] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve inquiry details." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID format." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const rawStatus = (body.status || "").toLowerCase().trim();

    if (!VALID_STATUSES.includes(rawStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }

    const inquiriesCol = await getInquiriesCollection();
    const now = new Date();

    const updateResult = await inquiriesCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: rawStatus,
          updatedAt: now,
          updatedBy: admin.email,
        },
      },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Inquiry status updated to "${rawStatus}".`,
      inquiry: {
        _id: updateResult._id.toString(),
        name: updateResult.name || "Anonymous",
        email: updateResult.email || "No email",
        phone: updateResult.phone || "",
        service: updateResult.service || "Creative Project",
        message: updateResult.message || "",
        status: (updateResult.status || "new").toLowerCase(),
        createdAt: updateResult.createdAt ? new Date(updateResult.createdAt).toISOString() : now.toISOString(),
        updatedAt: updateResult.updatedAt ? new Date(updateResult.updatedAt).toISOString() : now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN INQUIRY PATCH] error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry status." },
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
      return NextResponse.json({ error: "Invalid inquiry ID format." }, { status: 400 });
    }

    const inquiriesCol = await getInquiriesCollection();
    const result = await inquiriesCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Inquiry not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("[ADMIN INQUIRY DELETE] error:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}
