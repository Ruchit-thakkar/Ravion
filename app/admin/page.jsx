import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata = {
  title: "Link in Bio Hub — RAVION Admin",
  description: "Central command center for RAVION Link in Bio.",
};

export default async function AdminHomePage() {
  const admin = await getCurrentAdmin();

  // Route protection
  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  // Directly navigate to the unified Link in Bio command center
  redirect("/admin/bio");
}
