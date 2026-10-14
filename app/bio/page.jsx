import PublicBioClient from "@/components/bio/PublicBioClient";
import {
  getBioPageCollection,
  getBioSectionsCollection,
  getProductsCollection,
  getLinksCollection,
  getSettingsCollection,
  seedDefaultBioAndSettingsIfMissing,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const settingsCol = await getSettingsCollection();
    const settings = await settingsCol.findOne({ key: "default" });
    return {
      title: settings?.bioPage?.pageTitle || "Ravion — Bio & Digital Space",
      description:
        settings?.bioPage?.profileDescription ||
        "Official links, digital products, and contact channels for Ravion.",
    };
  } catch {
    return {
      title: "Ravion — Bio & Digital Space",
      description: "Official links, digital products, and contact channels for Ravion.",
    };
  }
}

async function getBioData() {
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

  const profile = profileDoc
    ? {
        ...profileDoc,
        _id: profileDoc._id.toString(),
      }
    : {
        displayName: "Ravion",
        title: "Creative Designer & Digital Builder",
        shortBio: "BUILD · CREATE · INNOVATE",
        description: "Elevated digital experiences, high-converting websites, creative content, and digital resources.",
        avatarUrl: "/assets/ravion_logo_svg-01.svg",
        location: "Worldwide",
        email: "ruchitthakkar12@gmail.com",
        websiteUrl: "https://ravion.in",
        socialLinks: [],
      };

  const sections = sectionsDocs.map((s) => ({
    ...s,
    _id: s._id.toString(),
  }));

  const settings = settingsDoc
    ? {
        branding: settingsDoc.branding,
        contact: settingsDoc.contact,
        bioPage: settingsDoc.bioPage,
        productDisplay: settingsDoc.productDisplay,
      }
    : null;

  return {
    profile,
    sections,
    products,
    links,
    settings,
  };
}

export default async function BioPage() {
  const bioData = await getBioData();
  return <PublicBioClient initialData={bioData} />;
}
