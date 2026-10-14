import { NextResponse } from "next/server";
import { getSettingsCollection, seedDefaultBioAndSettingsIfMissing } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await seedDefaultBioAndSettingsIfMissing();
    const settingsCol = await getSettingsCollection();
    const settings = await settingsCol.findOne({ key: "default" });

    if (!settings) {
      return NextResponse.json({ settings: null });
    }

    // Public sanitized version
    const sanitized = {
      branding: settings.branding,
      contact: settings.contact,
      seo: settings.seo,
      bioPage: settings.bioPage,
      productDisplay: settings.productDisplay,
    };

    return NextResponse.json(
      { settings: sanitized },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ error: "Could not fetch settings." }, { status: 500 });
  }
}
