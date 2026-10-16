import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getSettingsCollection } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Website Settings — Ravion Admin",
  description: "Manage official studio branding, contact channels, and website settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "admin") {
    redirect("/admin/login");
  }

  let settings = null;

  try {
    const settingsCol = await getSettingsCollection();
    let doc = await settingsCol.findOne({ key: "default" });

    if (!doc) {
      doc = {
        key: "default",
        branding: {
          name: siteConfig.name,
          tagline: siteConfig.tagline,
          headline: siteConfig.headline,
          logoUrl: "/assets/ravion_logo_svg-01.svg",
          faviconUrl: "/favicon.ico",
        },
        contact: {
          email: siteConfig.contact.email,
          phone: siteConfig.contact.phone,
          phoneRaw: siteConfig.contact.phoneRaw,
          whatsappUrl: siteConfig.contact.whatsappUrl,
          instagram: siteConfig.contact.instagram,
          instagramUrl: siteConfig.contact.instagramUrl,
          location: "India • Available Worldwide",
        },
        social: {
          instagramUrl: siteConfig.contact.instagramUrl,
          linkedinUrl: "",
          twitterUrl: "",
          youtubeUrl: "",
        },
        footer: {
          footerDescription: siteConfig.footerDescription,
          copyrightText: `© ${new Date().getFullYear()} Ravion. All rights reserved.`,
          turnaroundNote:
            "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await settingsCol.insertOne(doc);
    }

    settings = {
      _id: doc._id?.toString(),
      key: doc.key || "default",
      branding: {
        name: doc.branding?.name || siteConfig.name,
        tagline: doc.branding?.tagline || siteConfig.tagline,
        headline: doc.branding?.headline || siteConfig.headline,
        logoUrl: doc.branding?.logoUrl || "/assets/ravion_logo_svg-01.svg",
        faviconUrl: doc.branding?.faviconUrl || "/favicon.ico",
      },
      contact: {
        email: doc.contact?.email || siteConfig.contact.email,
        phone: doc.contact?.phone || siteConfig.contact.phone,
        phoneRaw: doc.contact?.phoneRaw || siteConfig.contact.phoneRaw,
        whatsappUrl: doc.contact?.whatsappUrl || siteConfig.contact.whatsappUrl,
        instagram: doc.contact?.instagram || siteConfig.contact.instagram,
        instagramUrl: doc.contact?.instagramUrl || siteConfig.contact.instagramUrl,
        location: doc.contact?.location || "India • Available Worldwide",
      },
      social: {
        instagramUrl: doc.social?.instagramUrl || doc.contact?.instagramUrl || siteConfig.contact.instagramUrl,
        linkedinUrl: doc.social?.linkedinUrl || "",
        twitterUrl: doc.social?.twitterUrl || "",
        youtubeUrl: doc.social?.youtubeUrl || "",
      },
      footer: {
        footerDescription: doc.footer?.footerDescription || siteConfig.footerDescription,
        copyrightText: doc.footer?.copyrightText || `© ${new Date().getFullYear()} Ravion. All rights reserved.`,
        turnaroundNote:
          doc.footer?.turnaroundNote ||
          "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
      },
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (err) {
    console.error("[SETTINGS PAGE] Error fetching settings:", err);
    // Safe fallback to siteConfig
    settings = {
      key: "default",
      branding: {
        name: siteConfig.name,
        tagline: siteConfig.tagline,
        headline: siteConfig.headline,
        logoUrl: "/assets/ravion_logo_svg-01.svg",
        faviconUrl: "/favicon.ico",
      },
      contact: {
        email: siteConfig.contact.email,
        phone: siteConfig.contact.phone,
        phoneRaw: siteConfig.contact.phoneRaw,
        whatsappUrl: siteConfig.contact.whatsappUrl,
        instagram: siteConfig.contact.instagram,
        instagramUrl: siteConfig.contact.instagramUrl,
        location: "India • Available Worldwide",
      },
      social: {
        instagramUrl: siteConfig.contact.instagramUrl,
        linkedinUrl: "",
        twitterUrl: "",
        youtubeUrl: "",
      },
      footer: {
        footerDescription: siteConfig.footerDescription,
        copyrightText: `© ${new Date().getFullYear()} Ravion. All rights reserved.`,
        turnaroundNote:
          "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
      },
    };
  }

  return <SettingsClient initialSettings={settings} admin={admin} />;
}
