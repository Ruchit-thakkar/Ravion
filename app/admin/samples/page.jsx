import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import SamplesClient from "./SamplesClient";

export const metadata = {
  title: "Samples — RAVION Admin",
  description: "Manage portfolio project samples and showcase work.",
};

export default async function AdminSamplesPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <SamplesClient user={admin} />;
}
