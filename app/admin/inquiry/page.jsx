import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import InquiryClient from "./InquiryClient";

export const metadata = {
  title: "Inquiries — RAVION Admin",
  description: "Client inquiries submitted to RAVION.",
};

export default async function AdminInquiryPage() {
  const admin = await getCurrentAdmin();

  // Protected route check
  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  return <InquiryClient user={admin} />;
}
