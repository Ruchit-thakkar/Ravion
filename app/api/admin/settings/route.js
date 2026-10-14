import { NextResponse } from "next/server";
import { getSettingsCollection, seedDefaultBioAndSettingsIfMissing } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await seedDefaultBioAndSettingsIfMissing();
    const settingsCol = await getSettingsCollection();
    let settings = await settingsCol.findOne({ key: "default" });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
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

    const settingsCol = await getSettingsCollection();
    const existing = (await settingsCol.findOne({ key: "default" })) || {};

    // Merge sections securely (no sensitive secrets stored here)
    const updatedSettings = {
      key: "default",
      branding: {
        ...(existing.branding || {}),
        ...(body.branding || {}),
      },
      contact: {
        ...(existing.contact || {}),
        ...(body.contact || {}),
      },
      seo: {
        ...(existing.seo || {}),
        ...(body.seo || {}),
      },
      bioPage: {
        ...(existing.bioPage || {}),
        ...(body.bioPage || {}),
      },
      productDisplay: {
        ...(existing.productDisplay || {}),
        ...(body.productDisplay || {}),
      },
      updatedAt: new Date(),
    };

    await settingsCol.updateOne(
      { key: "default" },
      { $set: updatedSettings },
      { upsert: true }
    );

    const saved = await settingsCol.findOne({ key: "default" });
    return NextResponse.json({ settings: saved, message: "Settings saved successfully." });
  } catch (err) {
    console.error("PUT /api/admin/settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings." }, { status: 500 });
  }
}
