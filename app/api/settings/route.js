import { NextResponse } from "next/server";
import { getSettingsCollection, seedDefaultBioAndSettingsIfMissing } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

export async function GET() {
  try {
    await seedDefaultBioAndSettingsIfMissing();
    const settingsCol = await getSettingsCollection();
    const settings = await settingsCol.findOne({ key: "default" });

    if (!settings) {
      return NextResponse.json({ settings: null });
    }

    // Public sanitized version with resilient fallbacks
    const sanitized = {
      branding: {
        name: settings.branding?.name || siteConfig.name,
        tagline: settings.branding?.tagline || siteConfig.tagline,
        headline: settings.branding?.headline || siteConfig.headline,
        logoUrl: settings.branding?.logoUrl || "/assets/ravion_logo_svg-01.svg",
        faviconUrl: settings.branding?.faviconUrl || "/favicon.ico",
      },
      contact: {
        email: settings.contact?.email || siteConfig.contact.email,
        phone: settings.contact?.phone || siteConfig.contact.phone,
        phoneRaw: settings.contact?.phoneRaw || siteConfig.contact.phoneRaw,
        whatsappUrl: settings.contact?.whatsappUrl || siteConfig.contact.whatsappUrl,
        instagram: settings.contact?.instagram || siteConfig.contact.instagram,
        instagramUrl: settings.contact?.instagramUrl || siteConfig.contact.instagramUrl,
        location: settings.contact?.location || "India • Available Worldwide",
      },
      social: {
        instagramUrl: settings.social?.instagramUrl || settings.contact?.instagramUrl || siteConfig.contact.instagramUrl,
        linkedinUrl: settings.social?.linkedinUrl || "",
        twitterUrl: settings.social?.twitterUrl || "",
        youtubeUrl: settings.social?.youtubeUrl || "",
      },
      footer: {
        footerDescription: settings.footer?.footerDescription || siteConfig.footerDescription,
        copyrightText: settings.footer?.copyrightText || `© ${new Date().getFullYear()} Ravion. All rights reserved.`,
        turnaroundNote:
          settings.footer?.turnaroundNote ||
          "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
      },
      seo: settings.seo,
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
