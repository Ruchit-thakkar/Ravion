import { NextResponse } from "next/server";
import {
  getSamplesCollection,
  getCategoriesCollection,
  getInquiriesCollection,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const [samplesCol, categoriesCol, inquiriesCol] = await Promise.all([
      getSamplesCollection(),
      getCategoriesCollection(),
      getInquiriesCollection(),
    ]);

    const [
      totalSamples,
      totalCategories,
      totalInquiries,
      newInquiries,
      recentInquiriesRaw,
      recentSamplesRaw,
    ] = await Promise.all([
      samplesCol.countDocuments(),
      categoriesCol.countDocuments(),
      inquiriesCol.countDocuments(),
      inquiriesCol.countDocuments({
        $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }],
      }),
      inquiriesCol.find({}).sort({ createdAt: -1 }).limit(6).toArray(),
      samplesCol.find({}).sort({ createdAt: -1 }).limit(6).toArray(),
    ]);

    const recentInquiries = recentInquiriesRaw.map((item) => ({
      _id: item._id.toString(),
      name: item.name || "Anonymous",
      email: item.email || "No email",
      phone: item.phone || "",
      service: item.service || "Creative Project",
      message: item.message || "",
      status: item.status || "new",
      createdAt: item.createdAt || new Date(),
    }));

    const recentSamples = recentSamplesRaw.map((item) => {
      // Resolve thumbnail or first media image
      let thumbnail = item.thumbnail || null;
      if (!thumbnail && Array.isArray(item.media) && item.media.length > 0) {
        thumbnail = item.media[0]?.thumbnailUrl || item.media[0]?.url || null;
      }
      if (!thumbnail && Array.isArray(item.images) && item.images.length > 0) {
        thumbnail = item.images[0]?.thumbnailUrl || item.images[0]?.url || null;
      }

      return {
        _id: item._id.toString(),
        title: item.title || "Untitled Project",
        slug: item.slug || "",
        category: item.category || "General",
        status: item.status || "Published",
        thumbnail,
        createdAt: item.createdAt || new Date(),
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSamples,
        totalCategories,
        totalInquiries,
        newInquiries,
      },
      recentInquiries,
      recentSamples,
    });
  } catch (error) {
    console.error("[ADMIN METRICS] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics." },
      { status: 500 }
    );
  }
}
