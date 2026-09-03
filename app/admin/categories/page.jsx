import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import CategoriesClient from "./CategoriesClient";

export const metadata = {
  title: "Categories — RAVION Admin",
  description: "Manage portfolio service categories.",
};

export default async function AdminCategoriesPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <CategoriesClient user={admin} />;
}
