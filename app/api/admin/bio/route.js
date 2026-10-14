import { NextResponse } from "next/server";
import { getBioPageCollection, getBioSectionsCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [bioPageCol, bioSectionsCol] = await Promise.all([
      getBioPageCollection(),
      getBioSectionsCollection(),
    ]);

    const profile = (await bioPageCol.findOne({ key: "default" })) || {
      displayName: "Ravion",
      title: "Creative Studio & Digital Builder",
      shortBio: "BUILD · CREATE · INNOVATE",
      description: "Crafting elevated digital experiences and visual direction.",
      avatarUrl: "/assets/ravion_logo_svg-01.svg",
      location: "India · Worldwide",
      email: "ruchitthakkar12@gmail.com",
      websiteUrl: "https://ravion.in",
      socialLinks: [],
      status: "Published",
    };

    const sections = await bioSectionsCol.find({}).sort({ order: 1 }).toArray();

    return NextResponse.json({
      profile,
      sections,
    });
  } catch (err) {
    console.error("GET /api/admin/bio error:", err);
    return NextResponse.json({ error: "Failed to fetch bio configuration." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing body." }, { status: 400 });
    }

    const bioPageCol = await getBioPageCollection();

    const updateDoc = {
      displayName: String(body.displayName || "Ravion").trim(),
      title: String(body.title || "").trim(),
      shortBio: String(body.shortBio || "").trim(),
      description: String(body.description || "").trim(),
      avatarUrl: String(body.avatarUrl || "").trim(),
      location: String(body.location || "").trim(),
      email: String(body.email || "").trim(),
      websiteUrl: String(body.websiteUrl || "").trim(),
      socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : [],
      status: body.status === "Draft" ? "Draft" : "Published",
      updatedAt: new Date(),
    };

    await bioPageCol.updateOne(
      { key: "default" },
      { $set: updateDoc },
      { upsert: true }
    );

    const saved = await bioPageCol.findOne({ key: "default" });
    return NextResponse.json({ profile: saved, message: "Profile information updated." });
  } catch (err) {
    console.error("PUT /api/admin/bio error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile." }, { status: 500 });
  }
}
