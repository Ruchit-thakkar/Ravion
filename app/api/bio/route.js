import { NextResponse } from "next/server";
import { getBioPageCollection, getLinksCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const [bioCol, linksCol] = await Promise.all([
      getBioPageCollection(),
      getLinksCollection(),
    ]);

    const profile = await bioCol.findOne({ key: "default" });

    // If profile doesn't exist or is unpublished/draft
    if (!profile) {
      return NextResponse.json(
        { error: "Bio profile not found." },
        { status: 404 }
      );
    }

    const isPublished = profile.status === "Published";

    // Only active links for public
    const rawLinks = await linksCol
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    const sanitizedLinks = rawLinks.map((l) => ({
      _id: l._id.toString(),
      title: l.title,
      url: l.url,
      description: l.description || "",
      icon: l.icon || "globe",
      thumbnail: l.thumbnail || "",
      isFeatured: Boolean(l.isFeatured),
      order: l.order,
    }));

    // Filter active social links
    const socialLinks = Array.isArray(profile.socialLinks)
      ? profile.socialLinks.filter((s) => s.isActive !== false)
      : [];

    return NextResponse.json({
      success: true,
      isPublished,
      profile: {
        displayName: profile.displayName || "Ravion",
        title: profile.title || "",
        shortBio: profile.shortBio || "",
        description: profile.description || "",
        avatarUrl: profile.avatarUrl || "/assets/ravion-logo.png",
        slug: profile.slug || "bio",
        location: profile.location || "",
        email: profile.email || "",
        phone: profile.phone || "",
        whatsappUrl: profile.whatsappUrl || "",
        websiteUrl: profile.websiteUrl || "",
        socialLinks,
        seo: profile.seo || {},
        footerText: profile.footerText || "© 2026 Ravion. Crafted with passion and imagination.",
        status: profile.status || "Published",
      },
      links: sanitizedLinks,
    });
  } catch (error) {
    console.error("[PUBLIC BIO GET] error:", error);
    return NextResponse.json({ error: "Failed to load public bio." }, { status: 500 });
  }
}
