import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import DashboardClient from "../DashboardClient";

export const metadata = {
  title: "Admin Dashboard — RAVION",
  description: "Administrative dashboard for RAVION website.",
};

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <DashboardClient user={admin} />;
}
