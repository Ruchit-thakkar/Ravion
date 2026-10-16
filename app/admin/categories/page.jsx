import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getCategoriesCollection, getSamplesCollection, ensureDefaultCategories } from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories Management — Ravion Admin",
  description: "Manage portfolio categories, service taxonomies, and associated project showcases.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCategoriesPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let categories = [];

  try {
    await ensureDefaultCategories();
    const [categoriesCol, samplesCol] = await Promise.all([
      getCategoriesCollection(),
      getSamplesCollection(),
    ]);

    const rawCategories = await categoriesCol.find({}).sort({ name: 1 }).toArray();

    categories = await Promise.all(
      rawCategories.map(async (cat) => {
        const sampleCount = await samplesCol.countDocuments({ category: cat.name });
        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          isActive: cat.isActive !== false,
          sampleCount,
          createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString(),
        };
      })
    );
  } catch (err) {
    console.error("[CATEGORIES PAGE] Error fetching categories:", err);
  }

  return <CategoriesClient initialCategories={categories} admin={admin} />;
}
