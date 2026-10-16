import { NextResponse } from "next/server";
import { getSamplesCollection, getCategoriesCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "all").trim();
    const status = (searchParams.get("status") || "all").trim();
    const sortBy = (searchParams.get("sortBy") || "newest").toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    const samplesCol = await getSamplesCollection();

    // 1. Calculate overall counts
    const [totalCount, publishedCount, draftCount] = await Promise.all([
      samplesCol.countDocuments(),
      samplesCol.countDocuments({ status: "Published" }),
      samplesCol.countDocuments({ status: "Draft" }),
    ]);

    // 2. Build filter conditions
    const conditions = [];

    if (status && status !== "all") {
      conditions.push({ status });
    }

    if (category && category !== "all" && category !== "All") {
      conditions.push({ category });
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      conditions.push({
        $or: [
          { title: { $regex: regex } },
          { slug: { $regex: regex } },
          { category: { $regex: regex } },
          { description: { $regex: regex } },
        ],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const sort = sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [totalFiltered, rawSamples] = await Promise.all([
      samplesCol.countDocuments(filter),
      samplesCol.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    ]);

    const samples = rawSamples.map((item) => ({
      _id: item._id.toString(),
      title: item.title || "Untitled Project",
      slug: item.slug || "",
      category: item.category || "General",
      description: item.description || "",
      status: item.status || "Published",
      thumbnail: item.thumbnail || item.media?.[0]?.thumbnailUrl || item.media?.[0]?.url || item.images?.[0]?.url || null,
      media: item.media || item.images || [],
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      samples,
      counts: {
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
      },
      pagination: {
        page,
        limit,
        totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN SAMPLES GET] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio samples." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, slug, category, description, status, media, thumbnail } = body;

    // 1. Validation
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.length > 120) {
      return NextResponse.json(
        { error: "Sample title is required (between 2 and 120 characters)." },
        { status: 400 }
      );
    }

    const cleanCategory = String(category || "").trim();
    if (!cleanCategory) {
      return NextResponse.json(
        { error: "Please select a valid category for this portfolio project." },
        { status: 400 }
      );
    }

    const cleanDescription = String(description || "").trim();
    if (!cleanDescription || cleanDescription.length < 3) {
      return NextResponse.json(
        { error: "Please provide a project description (at least 3 characters)." },
        { status: 400 }
      );
    }

    const cleanStatus = status === "Draft" ? "Draft" : "Published";

    // 2. Validate media
    const mediaArray = Array.isArray(media) ? media : [];
    if (mediaArray.length === 0 && !thumbnail) {
      return NextResponse.json(
        { error: "Please upload or provide at least one image or video for this sample." },
        { status: 400 }
      );
    }

    // Determine thumbnail URL
    const resolvedThumbnail =
      String(thumbnail || "").trim() ||
      mediaArray[0]?.thumbnailUrl ||
      mediaArray[0]?.url ||
      "";

    // 3. Slug resolution and uniqueness
    const samplesCol = await getSamplesCollection();
    let baseSlug = slugify(slug || cleanTitle);
    if (!baseSlug) baseSlug = `sample-${Date.now()}`;

    let resolvedSlug = baseSlug;
    let collision = await samplesCol.findOne({ slug: resolvedSlug });
    let counter = 1;
    while (collision) {
      resolvedSlug = `${baseSlug}-${counter}`;
      collision = await samplesCol.findOne({ slug: resolvedSlug });
      counter++;
    }

    const now = new Date();
    const newSample = {
      title: cleanTitle,
      slug: resolvedSlug,
      category: cleanCategory,
      description: cleanDescription,
      status: cleanStatus,
      thumbnail: resolvedThumbnail,
      media: mediaArray,
      images: mediaArray, // keep both media and images for backward compatibility
      createdAt: now,
      updatedAt: now,
      createdBy: admin.email,
    };

    const result = await samplesCol.insertOne(newSample);

    return NextResponse.json(
      {
        success: true,
        message: "Portfolio sample created successfully.",
        sample: {
          ...newSample,
          _id: result.insertedId.toString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN SAMPLES POST] error:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio sample." },
      { status: 500 }
    );
  }
}
