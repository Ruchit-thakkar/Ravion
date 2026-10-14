import { NextResponse } from "next/server";
import {
  getInquiriesCollection,
  getSamplesCollection,
  getCategoriesCollection,
  getProductsCollection,
  getLinksCollection,
  getBioSectionsCollection,
  getMediaCollection,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [
      inquiriesCol,
      samplesCol,
      categoriesCol,
      productsCol,
      linksCol,
      bioSectionsCol,
      mediaCol,
    ] = await Promise.all([
      getInquiriesCollection(),
      getSamplesCollection(),
      getCategoriesCollection(),
      getProductsCollection(),
      getLinksCollection(),
      getBioSectionsCollection(),
      getMediaCollection(),
    ]);

    const [
      totalInquiries,
      newInquiries,
      totalSamples,
      publishedSamples,
      totalCategories,
      totalDigitalProducts,
      totalAffiliateProducts,
      publishedProducts,
      draftProducts,
      totalPublishedLinks,
      totalBioSections,
      totalMediaAssets,
    ] = await Promise.all([
      inquiriesCol.countDocuments(),
      inquiriesCol.countDocuments({ $or: [{ status: "new" }, { status: "New" }, { status: { $exists: false } }] }),
      samplesCol.countDocuments(),
      samplesCol.countDocuments({ status: "Published" }),
      categoriesCol.countDocuments(),
      productsCol.countDocuments({ type: "digital" }),
      productsCol.countDocuments({ type: "affiliate" }),
      productsCol.countDocuments({ status: "Published" }),
      productsCol.countDocuments({ status: "Draft" }),
      linksCol.countDocuments({ isActive: true }),
      bioSectionsCol.countDocuments({ isVisible: true }),
      mediaCol.countDocuments(),
    ]);

    return NextResponse.json({
      summary: {
        totalDigitalProducts,
        totalAffiliateProducts,
        totalPublishedLinks,
        totalBioSections,
        draftProducts,
        publishedProducts,
      },
      digitalProducts: {
        total: totalDigitalProducts,
      },
      affiliateProducts: {
        total: totalAffiliateProducts,
      },
      products: {
        total: totalDigitalProducts + totalAffiliateProducts,
        published: publishedProducts,
        draft: draftProducts,
      },
      links: {
        published: totalPublishedLinks,
      },
      bioSections: {
        total: totalBioSections,
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
      },
      samples: {
        total: totalSamples,
        published: publishedSamples,
      },
      categories: {
        total: totalCategories,
      },
      media: {
        total: totalMediaAssets,
      },
    });
  } catch (error) {
    console.error("Admin metrics GET error:", error);
    return NextResponse.json(
      { error: "Could not fetch dashboard metrics." },
      { status: 500 }
    );
  }
}
