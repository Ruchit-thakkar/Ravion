import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getSamplesCollection,
  getCategoriesCollection,
  getInquiriesCollection,
} from "@/lib/db";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard — Ravion",
  description: "Administrative workspace and studio overview for Ravion.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let stats = {
    totalSamples: 0,
    totalCategories: 0,
    totalInquiries: 0,
    newInquiries: 0,
  };
  let recentInquiries = [];
  let recentSamples = [];

  try {
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

    stats = {
      totalSamples,
      totalCategories,
      totalInquiries,
      newInquiries,
    };

    recentInquiries = recentInquiriesRaw.map((item) => ({
      _id: item._id.toString(),
      name: item.name || "Anonymous",
      email: item.email || "No email",
      phone: item.phone || "",
      service: item.service || "Creative Project",
      message: item.message || "",
      status: item.status || "new",
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
    }));

    recentSamples = recentSamplesRaw.map((item) => {
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
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("[ADMIN DASHBOARD] Server fetch error:", error);
  }

  const initialData = {
    stats,
    recentInquiries,
    recentSamples,
  };

  return <DashboardClient initialData={initialData} admin={admin} />;
}
