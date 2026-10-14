import { NextResponse } from "next/server";
import {
  getBioPageCollection,
  getBioSectionsCollection,
  getProductsCollection,
  getLinksCollection,
  getSettingsCollection,
  seedDefaultBioAndSettingsIfMissing,
} from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Ensure default initial bio exists if first run
    await seedDefaultBioAndSettingsIfMissing();

    const [
      bioPageCol,
      bioSectionsCol,
      productsCol,
      linksCol,
      settingsCol,
    ] = await Promise.all([
      getBioPageCollection(),
      getBioSectionsCollection(),
      getProductsCollection(),
      getLinksCollection(),
      getSettingsCollection(),
    ]);

    const [profileDoc, sectionsDocs, rawProducts, rawLinks, settingsDoc] = await Promise.all([
      bioPageCol.findOne({ key: "default" }),
      bioSectionsCol.find({ isVisible: true }).sort({ order: 1 }).toArray(),
      productsCol.find({ status: "Published" }).sort({ featured: -1, createdAt: -1 }).toArray(),
      linksCol.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray(),
      settingsCol.findOne({ key: "default" }),
    ]);

    // Sanitize products for public view
    const products = rawProducts.map((p) => {
      const isPaid = (p.price || 0) > 0;
      return {
        _id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        type: p.type,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        thumbnail: p.thumbnail,
        previewImages: p.previewImages,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        deliveryMethod: p.deliveryMethod,
        purchaseUrl: p.purchaseUrl,
        affiliateUrl: p.affiliateUrl,
        originalUrl: p.originalUrl,
        tags: p.tags,
        featured: p.featured,
        isFree: !isPaid,
        downloadUrl: !isPaid && p.fileUrl ? `/api/products/download/${p._id}` : null,
      };
    });

    const links = rawLinks.map((l) => ({
      _id: l._id.toString(),
      title: l.title,
      url: l.url,
      description: l.description,
      thumbnail: l.thumbnail,
      icon: l.icon,
      category: l.category,
      buttonText: l.buttonText,
      type: l.type,
      order: l.order,
      featured: l.featured,
    }));

    const profile = profileDoc || {
      displayName: "Ravion",
      title: "Creative Studio & Digital Builder",
      shortBio: "BUILD · CREATE · INNOVATE",
      description: "Crafting elevated digital experiences and visual direction.",
      avatarUrl: "/assets/ravion_logo_svg-01.svg",
      location: "India · Worldwide",
      email: "ruchitthakkar12@gmail.com",
      websiteUrl: "https://ravion.in",
      socialLinks: [],
    };

    const settings = settingsDoc
      ? {
          branding: settingsDoc.branding,
          contact: settingsDoc.contact,
          bioPage: settingsDoc.bioPage,
          productDisplay: settingsDoc.productDisplay,
        }
      : null;

    return NextResponse.json(
      {
        profile,
        sections: sectionsDocs,
        products,
        links,
        settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/bio error:", err);
    return NextResponse.json({ error: "Failed to load bio data." }, { status: 500 });
  }
}
