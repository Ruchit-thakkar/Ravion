import { NextResponse } from "next/server";
import { getSettingsCollection } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(string) {
  if (!string || typeof string !== "string") return false;
  // Allow relative internal paths like /assets/logo.png
  if (string.startsWith("/")) return true;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const settingsCol = await getSettingsCollection();
    let doc = await settingsCol.findOne({ key: "default" });

    if (!doc) {
      // Seed default settings from siteConfig
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

    return NextResponse.json({
      success: true,
      settings: doc,
    });
  } catch (error) {
    console.error("[ADMIN SETTINGS] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { branding, contact, social, footer } = body || {};

    // 1. Validation
    if (!branding || typeof branding !== "object") {
      return NextResponse.json(
        { error: "Branding configuration is required." },
        { status: 400 }
      );
    }

    const brandName = String(branding.name || "").trim();
    if (!brandName || brandName.length > 80) {
      return NextResponse.json(
        { error: "Website name is required (max 80 characters)." },
        { status: 400 }
      );
    }

    if (branding.logoUrl && !isValidUrl(branding.logoUrl)) {
      return NextResponse.json(
        { error: "Please provide a valid URL or path for the website logo." },
        { status: 400 }
      );
    }

    if (!contact || typeof contact !== "object") {
      return NextResponse.json(
        { error: "Contact details are required." },
        { status: 400 }
      );
    }

    const contactEmail = String(contact.email || "").trim().toLowerCase();
    if (!contactEmail || !EMAIL_REGEX.test(contactEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid business email address." },
        { status: 400 }
      );
    }

    const contactPhone = String(contact.phone || "").trim();
    if (!contactPhone || contactPhone.length < 5) {
      return NextResponse.json(
        { error: "Please provide a valid contact phone number." },
        { status: 400 }
      );
    }

    if (contact.whatsappUrl && !isValidUrl(contact.whatsappUrl)) {
      return NextResponse.json(
        { error: "WhatsApp URL must be a valid link (e.g. https://wa.me/917990774831)." },
        { status: 400 }
      );
    }

    if (contact.instagramUrl && !isValidUrl(contact.instagramUrl)) {
      return NextResponse.json(
        { error: "Instagram URL must be a valid link." },
        { status: 400 }
      );
    }

    // Validate optional social links
    if (social?.linkedinUrl && !isValidUrl(social.linkedinUrl)) {
      return NextResponse.json(
        { error: "LinkedIn URL must be a valid web link." },
        { status: 400 }
      );
    }
    if (social?.twitterUrl && !isValidUrl(social.twitterUrl)) {
      return NextResponse.json(
        { error: "Twitter / X URL must be a valid web link." },
        { status: 400 }
      );
    }
    if (social?.youtubeUrl && !isValidUrl(social.youtubeUrl)) {
      return NextResponse.json(
        { error: "YouTube URL must be a valid web link." },
        { status: 400 }
      );
    }

    // 2. Prepare Clean Updated Settings
    const updatedBranding = {
      name: brandName,
      tagline: String(branding.tagline || "").trim(),
      headline: String(branding.headline || "").trim(),
      logoUrl: String(branding.logoUrl || "/assets/ravion_logo_svg-01.svg").trim(),
      faviconUrl: String(branding.faviconUrl || "/favicon.ico").trim(),
    };

    const updatedContact = {
      email: contactEmail,
      phone: contactPhone,
      phoneRaw: String(contact.phoneRaw || contactPhone.replace(/[^0-9+]/g, "")).trim(),
      whatsappUrl: String(contact.whatsappUrl || "").trim(),
      instagram: String(contact.instagram || "").trim(),
      instagramUrl: String(contact.instagramUrl || "").trim(),
      location: String(contact.location || "").trim(),
    };

    const updatedSocial = {
      instagramUrl: String(social?.instagramUrl || updatedContact.instagramUrl || "").trim(),
      linkedinUrl: String(social?.linkedinUrl || "").trim(),
      twitterUrl: String(social?.twitterUrl || "").trim(),
      youtubeUrl: String(social?.youtubeUrl || "").trim(),
    };

    const updatedFooter = {
      footerDescription: String(footer?.footerDescription || "").trim(),
      copyrightText: String(footer?.copyrightText || "").trim(),
      turnaroundNote: String(footer?.turnaroundNote || "").trim(),
    };

    const settingsCol = await getSettingsCollection();
    const now = new Date();

    const updatePayload = {
      $set: {
        branding: updatedBranding,
        contact: updatedContact,
        social: updatedSocial,
        footer: updatedFooter,
        updatedAt: now,
        updatedBy: admin.email,
      },
      $setOnInsert: {
        key: "default",
        createdAt: now,
      },
    };

    await settingsCol.updateOne({ key: "default" }, updatePayload, { upsert: true });

    const freshDoc = await settingsCol.findOne({ key: "default" });

    return NextResponse.json({
      success: true,
      message: "Website settings saved successfully.",
      settings: freshDoc,
    });
  } catch (error) {
    console.error("[ADMIN SETTINGS] PUT error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving website settings." },
      { status: 500 }
    );
  }
}
