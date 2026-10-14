import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import MediaClient from "./MediaClient";

export const metadata = {
  title: "Media Library — RAVION Admin",
  description: "Central ImageKit media library for images, banners, and thumbnails.",
};

export default async function AdminMediaPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <MediaClient user={admin} />;
}
