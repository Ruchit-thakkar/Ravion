import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { getInquiriesCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body || {};

    const inquiries = await getInquiriesCollection();
    await inquiries.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(status ? { status } : {}),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_INQUIRY_PATCH_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to update inquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
    }

    const inquiries = await getInquiriesCollection();
    await inquiries.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_INQUIRY_DELETE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}
