import { NextResponse } from "next/server";
import { getInquiriesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const VALID_STATUSES = ["new", "read", "in_progress", "resolved"];

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "all").toLowerCase().trim();
    const sortBy = (searchParams.get("sortBy") || "newest").toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const inquiriesCol = await getInquiriesCollection();

    // 1. Calculate overall counts for filter tabs
    const [totalCount, newCount, readCount, inProgressCount, resolvedCount] = await Promise.all([
      inquiriesCol.countDocuments(),
      inquiriesCol.countDocuments({
        $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }],
      }),
      inquiriesCol.countDocuments({ status: "read" }),
      inquiriesCol.countDocuments({ status: "in_progress" }),
      inquiriesCol.countDocuments({ status: "resolved" }),
    ]);

    // 2. Build filter query
    const conditions = [];

    // Status filter
    if (status && status !== "all") {
      if (status === "new") {
        conditions.push({
          $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }],
        });
      } else if (VALID_STATUSES.includes(status)) {
        conditions.push({ status });
      }
    }

    // Search query filter (search across name, email, service, message)
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      conditions.push({
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { phone: { $regex: regex } },
          { service: { $regex: regex } },
          { message: { $regex: regex } },
        ],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    // 3. Sorting
    const sort = sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // 4. Fetch total filtered count and documents
    const [totalFiltered, rawInquiries] = await Promise.all([
      inquiriesCol.countDocuments(filter),
      inquiriesCol.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    ]);

    const inquiries = rawInquiries.map((item) => ({
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

    return NextResponse.json({
      success: true,
      inquiries,
      counts: {
        total: totalCount,
        new: newCount,
        read: readCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      pagination: {
        page,
        limit,
        totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN INQUIRIES] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client inquiries." },
      { status: 500 }
    );
  }
}
