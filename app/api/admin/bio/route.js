import { NextResponse } from "next/server";
import { getBioPageCollection, getLinksCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULT_BIO_PROFILE = {
  key: "default",
  displayName: "Ravion Studio",
  title: "Creative Designer & Digital Builder",
  shortBio: "BUILD · CREATE · INNOVATE",
  description: "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.",
  avatarUrl: "https://ik.imagekit.io/ruchit/ravion/samples/1792054787783-elegant-ravion-serif-wordmark_306aWE0aA.png",
  slug: "bio",
  location: "India · Worldwide",
  email: "ruchitthakkar12@gmail.com",
  phone: "+91 79907 74831",
  whatsappUrl: "https://wa.me/917990774831",
  websiteUrl: "https://ravion.in",
  socialLinks: [
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/ravion.ai/", isActive: true, order: 1 },
    { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/917990774831", isActive: true, order: 2 },
    { platform: "email", label: "Email", url: "mailto:ruchitthakkar12@gmail.com", isActive: true, order: 3 },
    { platform: "website", label: "Website", url: "https://ravion.in", isActive: true, order: 4 },
  ],
  status: "Published",
  seo: {
    title: "Ravion — Bio & Digital Space",
    description: "Creative Designer & Digital Builder. Crafting elevated digital experiences, visual direction, and digital products.",
    ogImage: "/assets/ravion-logo.png",
  },
  footerText: "© 2026 Ravion. Crafted with passion and imagination.",
};

const DEFAULT_STARTER_LINKS = [
  {
    title: "Official Website",
    url: "/",
    description: "Explore bespoke digital craftsmanship, philosophy & services",
    icon: "globe",
    thumbnail: "",
    order: 1,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Selected Work & Case Studies",
    url: "/samples",
    description: "Browse curated client deliverables, websites & creative direction",
    icon: "briefcase",
    thumbnail: "",
    order: 2,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Start a Project — Client Inquiries",
    url: "/#contact",
    description: "Hire Ravion for high-performance web development & design",
    icon: "sparkles",
    thumbnail: "",
    order: 3,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "WhatsApp Direct Connect",
    url: "https://wa.me/917990774831",
    description: "Chat directly with our team for quick discussions & pricing",
    icon: "message-circle",
    thumbnail: "",
    order: 4,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const [bioCol, linksCol] = await Promise.all([
      getBioPageCollection(),
      getLinksCollection(),
    ]);

    // 1. Fetch or initialize profile
    let profile = await bioCol.findOne({ key: "default" });
    if (!profile) {
      const now = new Date();
      profile = {
        ...DEFAULT_BIO_PROFILE,
        createdAt: now,
        updatedAt: now,
      };
      await bioCol.insertOne(profile);
    }

    // 2. Fetch or initialize starter links if empty
    const linkCount = await linksCol.countDocuments();
    if (linkCount === 0) {
      await linksCol.insertMany(DEFAULT_STARTER_LINKS);
    }

    const rawLinks = await linksCol.find({}).sort({ order: 1, createdAt: -1 }).toArray();
    const links = rawLinks.map((l) => ({
      ...l,
      _id: l._id.toString(),
    }));

    const totalLinks = links.length;
    const activeLinks = links.filter((l) => l.isActive).length;

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        _id: profile._id?.toString(),
      },
      links,
      stats: {
        totalLinks,
        activeLinks,
        status: profile.status || "Published",
      },
    });
  } catch (error) {
    console.error("[ADMIN BIO GET] error:", error);
    return NextResponse.json({ error: "Failed to load Link in Bio settings." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      displayName,
      title,
      shortBio,
      description,
      avatarUrl,
      slug,
      status,
      location,
      email,
      phone,
      whatsappUrl,
      websiteUrl,
      socialLinks,
      seo,
      footerText,
    } = body;

    // Validate displayName
    const cleanDisplayName = String(displayName || "").trim();
    if (!cleanDisplayName || cleanDisplayName.length < 2) {
      return NextResponse.json(
        { error: "Profile name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }
    if (cleanDisplayName.length > 100) {
      return NextResponse.json(
        { error: "Profile name cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    // Validate status
    const cleanStatus = status === "Draft" ? "Draft" : "Published";

    // Normalize slug
    const cleanSlug = String(slug || "bio")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "") || "bio";

    // Validate social links if provided
    let cleanSocialLinks = [];
    if (Array.isArray(socialLinks)) {
      cleanSocialLinks = socialLinks.map((s, idx) => ({
        platform: String(s.platform || "website").toLowerCase().trim(),
        label: String(s.label || s.platform || "Link").trim(),
        url: String(s.url || "").trim(),
        isActive: s.isActive !== false,
        order: typeof s.order === "number" ? s.order : idx + 1,
      }));
    }

    const now = new Date();
    const updateDoc = {
      displayName: cleanDisplayName,
      title: String(title || "").trim(),
      shortBio: String(shortBio || "").trim(),
      description: String(description || "").trim(),
      avatarUrl: String(avatarUrl || "").trim(),
      slug: cleanSlug,
      status: cleanStatus,
      location: String(location || "").trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      whatsappUrl: String(whatsappUrl || "").trim(),
      websiteUrl: String(websiteUrl || "").trim(),
      socialLinks: cleanSocialLinks,
      seo: {
        title: String(seo?.title || cleanDisplayName || "Ravion — Bio & Digital Space").trim(),
        description: String(seo?.description || description || "").trim(),
        ogImage: String(seo?.ogImage || avatarUrl || "").trim(),
      },
      footerText: String(footerText || "").trim(),
      updatedAt: now,
      updatedBy: admin.email,
    };

    const bioCol = await getBioPageCollection();
    await bioCol.updateOne(
      { key: "default" },
      { $set: updateDoc },
      { upsert: true }
    );

    const updatedProfile = await bioCol.findOne({ key: "default" });

    return NextResponse.json({
      success: true,
      message: "Bio profile updated successfully.",
      profile: {
        ...updatedProfile,
        _id: updatedProfile._id?.toString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN BIO PUT] error:", error);
    return NextResponse.json({ error: "Failed to update Bio profile." }, { status: 500 });
  }
}
