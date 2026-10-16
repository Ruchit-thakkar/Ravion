import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getSamplesCollection, getCategoriesCollection, ensureDefaultCategories } from "@/lib/db";
import SamplesClient from "./SamplesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio Samples — Ravion Admin",
  description: "Manage portfolio showcase items, media galleries, and publication status.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSamplesPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let samples = [];
  let categories = [];
  let counts = {
    total: 0,
    published: 0,
    draft: 0,
  };
  let pagination = {
    page: 1,
    limit: 30,
    totalFiltered: 0,
    totalPages: 1,
  };

  try {
    await ensureDefaultCategories();
    const [samplesCol, categoriesCol] = await Promise.all([
      getSamplesCollection(),
      getCategoriesCollection(),
    ]);

    const [totalCount, publishedCount, draftCount, rawSamples, rawCategories] =
      await Promise.all([
        samplesCol.countDocuments(),
        samplesCol.countDocuments({ status: "Published" }),
        samplesCol.countDocuments({ status: "Draft" }),
        samplesCol.find({}).sort({ createdAt: -1 }).limit(30).toArray(),
        categoriesCol.find({}).sort({ name: 1 }).toArray(),
      ]);

    counts = {
      total: totalCount,
      published: publishedCount,
      draft: draftCount,
    };

    pagination.totalFiltered = totalCount;
    pagination.totalPages = Math.ceil(totalCount / 30) || 1;

    categories = rawCategories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    }));

    samples = rawSamples.map((item) => ({
      _id: item._id.toString(),
      title: item.title || "Untitled Project",
      slug: item.slug || "",
      category: item.category || "General",
      description: item.description || "",
      status: item.status || "Published",
      thumbnail:
        item.thumbnail ||
        item.media?.[0]?.thumbnailUrl ||
        item.media?.[0]?.url ||
        item.images?.[0]?.url ||
        null,
      media: item.media || item.images || [],
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[SAMPLES PAGE] Error fetching initial portfolio samples:", err);
  }

  return (
    <SamplesClient
      initialSamples={samples}
      initialCategories={categories}
      initialCounts={counts}
      initialPagination={pagination}
      admin={admin}
    />
  );
}
