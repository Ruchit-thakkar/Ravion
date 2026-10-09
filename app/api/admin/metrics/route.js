import { NextResponse } from "next/server";
import { getInquiriesCollection, getSamplesCollection, getCategoriesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [inquiriesCol, samplesCol, categoriesCol] = await Promise.all([
      getInquiriesCollection(),
      getSamplesCollection(),
      getCategoriesCollection(),
    ]);

    const [
      totalInquiries,
      newInquiries,
      totalSamples,
      publishedSamples,
      totalCategories,
    ] = await Promise.all([
      inquiriesCol.countDocuments(),
      inquiriesCol.countDocuments({ $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }] }),
      samplesCol.countDocuments(),
      samplesCol.countDocuments({ status: "Published" }),
      categoriesCol.countDocuments(),
    ]);

    return NextResponse.json({
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
      },
      samples: {
        total: totalSamples,
        published: publishedSamples,
      },
      categories: {
        total: totalCategories,
      },
    });
  } catch (error) {
    console.error("Admin metrics GET error:", error);
    return NextResponse.json(
      { error: "Could not fetch dashboard metrics." },
      { status: 500 }
    );
  }
}
