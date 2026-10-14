import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import LinksClient from "./LinksClient";

export const metadata = {
  title: "Link Management — RAVION Admin",
  description: "Manage unlimited bio links, social media channels, and external destinations.",
};

export default async function AdminLinksPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <LinksClient user={admin} />;
}
