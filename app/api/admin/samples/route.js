import { NextResponse } from "next/server";
import { getSamplesCollection } from "@/lib/db";
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const samplesCol = await getSamplesCollection();
    const samples = await samplesCol.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(samples);
  } catch (error) {
    console.error("Admin samples GET error:", error);
    return NextResponse.json({ error: "Could not fetch samples." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category,
      description = "",
      status = "Published",
      media = [],
      images = [], // backward compatibility if passed
    } = body;

    const trimmedTitle = (title || "").trim();
    const trimmedCategory = (category || "").trim();

    if (!trimmedTitle || !trimmedCategory) {
      return NextResponse.json(
        { error: "Title and Category are required." },
        { status: 400 }
      );
    }

    const combinedMedia = media.length > 0 ? media : images;

    const samplesCol = await getSamplesCollection();
    let slug = slugify(trimmedTitle);
    let n = 2;
    let baseSlug = slug;
    while (await samplesCol.findOne({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const primaryThumbnail =
      combinedMedia[0]?.thumbnailUrl || combinedMedia[0]?.url || "";

    const newSample = {
      title: trimmedTitle,
      slug,
      category: trimmedCategory,
      description: description.trim(),
      status: status === "Draft" ? "Draft" : "Published",
      media: combinedMedia,
      images: combinedMedia, // keep images for backward compatibility
      thumbnail: primaryThumbnail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await samplesCol.insertOne(newSample);

    return NextResponse.json(
      { ...newSample, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin samples POST error:", error);
    return NextResponse.json(
      { error: error.message || "Could not save sample." },
      { status: 500 }
    );
  }
}
