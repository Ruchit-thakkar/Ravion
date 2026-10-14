import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Website Settings — RAVION Admin",
  description: "Configure website branding, SEO, bio page defaults, and product display preferences.",
};

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <SettingsClient user={admin} />;
}
