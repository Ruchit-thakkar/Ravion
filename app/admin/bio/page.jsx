import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import BioClient from "./BioClient";

export const metadata = {
  title: "Bio Page Builder — RAVION Admin",
  description: "Visual no-code builder for Ravion bio page.",
};

export default async function AdminBioPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <BioClient user={admin} />;
}
