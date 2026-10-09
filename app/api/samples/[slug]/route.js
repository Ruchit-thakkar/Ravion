import { NextResponse } from "next/server";
import { getSamplesCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Invalid project slug." }, { status: 400 });
    }

    const samplesCol = await getSamplesCollection();
    const item = await samplesCol.findOne({ slug: slug.trim(), status: "Published" });

    if (!item) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Single sample GET error:", error);
    return NextResponse.json({ error: "Failed to fetch project." }, { status: 500 });
  }
}
