import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Products Management — RAVION Admin",
  description: "Manage digital products, templates, and affiliate recommendations.",
};

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <ProductsClient user={admin} />;
}
