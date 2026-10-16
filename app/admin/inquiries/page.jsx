import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getInquiriesCollection } from "@/lib/db";
import InquiriesClient from "./InquiriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Inquiries — Ravion Admin",
  description: "Manage client leads, inquiries, and project requests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminInquiriesPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let inquiries = [];
  let counts = {
    total: 0,
    new: 0,
    read: 0,
    inProgress: 0,
    resolved: 0,
  };
  let pagination = {
    page: 1,
    limit: 25,
    totalFiltered: 0,
    totalPages: 1,
  };

  try {
    const inquiriesCol = await getInquiriesCollection();

    const [totalCount, newCount, readCount, inProgressCount, resolvedCount, rawInquiries] =
      await Promise.all([
        inquiriesCol.countDocuments(),
        inquiriesCol.countDocuments({
          $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }],
        }),
        inquiriesCol.countDocuments({ status: "read" }),
        inquiriesCol.countDocuments({ status: "in_progress" }),
        inquiriesCol.countDocuments({ status: "resolved" }),
        inquiriesCol.find({}).sort({ createdAt: -1 }).limit(25).toArray(),
      ]);

    counts = {
      total: totalCount,
      new: newCount,
      read: readCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    };

    pagination.totalFiltered = totalCount;
    pagination.totalPages = Math.ceil(totalCount / 25) || 1;

    inquiries = rawInquiries.map((item) => ({
      _id: item._id.toString(),
      name: item.name || "Anonymous",
      email: item.email || "No email",
      phone: item.phone || "",
      service: item.service || "Creative Project",
      message: item.message || "",
      status: (item.status || "new").toLowerCase(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[INQUIRIES PAGE] Error fetching initial inquiries:", err);
  }

  return (
    <InquiriesClient
      initialInquiries={inquiries}
      initialCounts={counts}
      initialPagination={pagination}
      admin={admin}
    />
  );
}
