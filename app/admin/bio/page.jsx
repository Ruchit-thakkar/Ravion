import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getBioPageCollection,
  getLinksCollection,
  seedDefaultBioAndSettingsIfMissing,
} from "@/lib/db";
import BioClient from "./BioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Link in Bio Management — Ravion Admin",
  description: "Manage public profile, custom links, social channels, and live mobile preview.",
  robots: {
    index: false,
    follow: false,
  },
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

export default async function AdminBioPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let profile = null;
  let links = [];

  try {
    await seedDefaultBioAndSettingsIfMissing();

    const [bioCol, linksCol] = await Promise.all([
      getBioPageCollection(),
      getLinksCollection(),
    ]);

    let rawProfile = await bioCol.findOne({ key: "default" });
    if (!rawProfile) {
      const now = new Date();
      rawProfile = {
        key: "default",
        displayName: "Ravion Studio",
        title: "Creative Designer & Digital Builder",
        shortBio: "BUILD · CREATE · INNOVATE",
        description:
          "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.",
        avatarUrl:
          "https://ik.imagekit.io/ruchit/ravion/samples/1792054787783-elegant-ravion-serif-wordmark_306aWE0aA.png",
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
        createdAt: now,
        updatedAt: now,
      };
      await bioCol.insertOne(rawProfile);
    }

    profile = {
      ...rawProfile,
      _id: rawProfile._id ? rawProfile._id.toString() : "default",
    };

    // Check links
    const linkCount = await linksCol.countDocuments();
    if (linkCount === 0) {
      await linksCol.insertMany(DEFAULT_STARTER_LINKS);
    }

    const rawLinks = await linksCol.find({}).sort({ order: 1, createdAt: -1 }).toArray();
    links = rawLinks.map((l) => ({
      _id: l._id.toString(),
      title: l.title,
      url: l.url,
      description: l.description || "",
      icon: l.icon || "globe",
      thumbnail: l.thumbnail || "",
      order: l.order || 1,
      isActive: l.isActive !== false,
      isFeatured: Boolean(l.isFeatured),
      clicks: l.clicks || 0,
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[ADMIN BIO PAGE] Error fetching bio data:", err);
  }

  return (
    <BioClient
      initialProfile={profile}
      initialLinks={links}
      admin={admin}
    />
  );
}
