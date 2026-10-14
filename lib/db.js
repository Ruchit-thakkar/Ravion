import { MongoClient } from "mongodb";

let clientPromise;

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return await global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return await clientPromise;
  }
}

export async function getDatabase() {
  const dbName = process.env.MONGODB_DB || "ravion";
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getAdminsCollection() {
  const db = await getDatabase();
  return db.collection("admins");
}

export async function getInquiriesCollection() {
  const db = await getDatabase();
  return db.collection("inquiries");
}

export async function getCategoriesCollection() {
  const db = await getDatabase();
  return db.collection("categories");
}

export async function getSamplesCollection() {
  const db = await getDatabase();
  return db.collection("samples");
}

export async function getProductsCollection() {
  const db = await getDatabase();
  return db.collection("products");
}

export async function getLinksCollection() {
  const db = await getDatabase();
  return db.collection("links");
}

export async function getBioPageCollection() {
  const db = await getDatabase();
  return db.collection("bio_page");
}

export async function getBioSectionsCollection() {
  const db = await getDatabase();
  return db.collection("bio_sections");
}

export async function getMediaCollection() {
  const db = await getDatabase();
  return db.collection("media_assets");
}

export async function getSettingsCollection() {
  const db = await getDatabase();
  return db.collection("site_settings");
}

export async function getNewsletterCollection() {
  const db = await getDatabase();
  return db.collection("newsletter_subscribers");
}

export async function ensureDefaultCategories() {
  try {
    const categoriesCol = await getCategoriesCollection();
    const count = await categoriesCol.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: "Web Services", slug: "web-services", description: "Modern websites, web apps, and design systems.", order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Digital Products", slug: "digital-products", description: "Ebooks, templates, guides and resources.", order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Affiliate Picks", slug: "affiliate-picks", description: "Recommended tools, gear, and digital products.", order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Link-in-Bio", slug: "link-in-bio", description: "High-converting, brand-aligned link-in-bio spaces.", order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "AI Product Photography", slug: "ai-product-photography", description: "Photorealistic AI product imagery and commercial visuals.", order: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Social Media Content", slug: "social-media-content", description: "Thumb-stopping social media creatives and carousels.", order: 6, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Photoshop / Design", slug: "photoshop-design", description: "Creative retouching, poster design, and manipulations.", order: 7, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: "Video", slug: "video", description: "Short-form video editing, motion graphics, and reels.", order: 8, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      await categoriesCol.insertMany(defaultCategories);
    }
  } catch (err) {
    console.error("Could not seed default categories:", err);
  }
}

export async function ensureDatabaseIndexes() {
  try {
    const db = await getDatabase();
    await Promise.allSettled([
      db.collection("products").createIndex({ slug: 1 }, { unique: true }),
      db.collection("products").createIndex({ status: 1, type: 1 }),
      db.collection("products").createIndex({ featured: 1 }),
      db.collection("links").createIndex({ order: 1, isActive: 1 }),
      db.collection("bio_sections").createIndex({ order: 1, isVisible: 1 }),
      db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
      db.collection("media_assets").createIndex({ createdAt: -1 }),
      db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    ]);
  } catch (err) {
    console.warn("Database indexing notice:", err.message);
  }
}

export async function seedDefaultBioAndSettingsIfMissing() {
  try {
    const db = await getDatabase();
    const settingsCol = db.collection("site_settings");
    const bioPageCol = db.collection("bio_page");
    const bioSectionsCol = db.collection("bio_sections");
    const productsCol = db.collection("products");
    const linksCol = db.collection("links");

    // 1. Ensure site settings
    const existingSettings = await settingsCol.findOne({ key: "default" });
    if (!existingSettings) {
      await settingsCol.insertOne({
        key: "default",
        branding: {
          name: "Ravion",
          tagline: "Build. Create. Innovate.",
          headline: "Build something worth feeling.",
          logoUrl: "/assets/ravion_logo_svg-01.svg",
          faviconUrl: "/favicon.ico",
          brandColors: {
            ink: "#082d2a",
            darkBg: "#031513",
            cream: "#f5f0e8",
            gold: "#c99a55",
            accent: "#dfb77b",
          },
        },
        contact: {
          email: "ruchitthakkar12@gmail.com",
          phone: "+91 79907 74831",
          whatsappUrl: "https://wa.me/917990774831",
          instagram: "@ravion.ai",
          instagramUrl: "https://www.instagram.com/ravion.ai/",
        },
        seo: {
          defaultTitle: "Ravion — Creative Studio & Digital Experiences",
          defaultDescription: "Ravion turns ambitious ideas into elevated digital experiences, visual worlds, and work that gets remembered.",
          defaultOgImage: "/assets/ravion-logo.png",
          canonicalUrl: "https://ravion.in",
          indexSite: true,
          sitemapEnabled: true,
        },
        bioPage: {
          pageTitle: "Ravion — Bio & Digital Space",
          profileDescription: "Creative Designer & Digital Builder. Crafting elevated digital experiences, visual direction, and digital products.",
          defaultAvatar: "/assets/ravion_logo_svg-01.svg",
          footerText: "© 2026 Ravion. Crafted with passion and imagination.",
        },
        productDisplay: {
          defaultOrder: "newest",
          productsPerSection: 6,
          showCategoryFilter: true,
          showAffiliateDisclosure: true,
          affiliateDisclosureText: "This page contains affiliate links. I may earn a commission from qualifying purchases at no additional cost to you.",
        },
        updatedAt: new Date(),
      });
    }

    // 2. Ensure default bio page profile
    const existingBio = await bioPageCol.findOne({ key: "default" });
    if (!existingBio) {
      await bioPageCol.insertOne({
        key: "default",
        displayName: "Ravion Studio",
        title: "Creative Designer & Digital Builder",
        shortBio: "BUILD · CREATE · INNOVATE",
        description: "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.",
        avatarUrl: "/assets/ravion_logo_svg-01.svg",
        location: "India · Worldwide",
        email: "ruchitthakkar12@gmail.com",
        websiteUrl: "https://ravion.in",
        socialLinks: [
          { platform: "instagram", url: "https://www.instagram.com/ravion.ai/", label: "Instagram", isActive: true },
          { platform: "whatsapp", url: "https://wa.me/917990774831", label: "WhatsApp", isActive: true },
          { platform: "email", url: "mailto:ruchitthakkar12@gmail.com", label: "Email", isActive: true },
          { platform: "website", url: "https://ravion.in", label: "Website", isActive: true },
        ],
        status: "Published",
        updatedAt: new Date(),
      });
    }

    // 3. Ensure default bio sections
    const sectionsCount = await bioSectionsCol.countDocuments();
    if (sectionsCount === 0) {
      const defaultSections = [
        {
          sectionId: "sec-header",
          type: "profile_header",
          title: "Profile Header",
          subtitle: "Brand identity & headline",
          order: 1,
          isVisible: true,
          status: "Published",
          config: {
            showAvatar: true,
            showBadge: true,
            badgeText: "BUILD · CREATE · INNOVATE",
            headline: "Made with imagination.",
            subheadline: "Elevated digital experiences, products & visual systems.",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-announcement",
          type: "announcement",
          title: "Announcement Bar",
          subtitle: "Latest release or news",
          order: 2,
          isVisible: true,
          status: "Published",
          config: {
            badgeText: "NEW RELEASE",
            message: "Explore our latest digital design kits and templates.",
            linkText: "View Products",
            linkUrl: "#digital-products",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-quick-links",
          type: "custom_links",
          title: "Quick Links",
          subtitle: "Official destinations",
          order: 3,
          isVisible: true,
          status: "Published",
          config: {
            layout: "buttons",
            category: "all",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-featured-products",
          type: "featured_products",
          title: "Featured Products",
          subtitle: "Hand-picked essentials",
          order: 4,
          isVisible: true,
          status: "Published",
          config: {
            headline: "Featured Products & Guides",
            description: "High-value resources designed to elevate your craft.",
            layout: "grid",
            maxItems: 4,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-digital-products",
          type: "digital_products",
          title: "Digital Products & Templates",
          subtitle: "Downloadable resources",
          order: 5,
          isVisible: true,
          status: "Published",
          config: {
            headline: "Digital Downloads",
            description: "Instant access to templates, checklists, and guides.",
            layout: "grid",
            category: "all",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-affiliate",
          type: "affiliate_recommendations",
          title: "Recommended Gear & Tools",
          subtitle: "Curated affiliate picks",
          order: 6,
          isVisible: true,
          status: "Published",
          config: {
            headline: "Curated Recommendations",
            description: "Tools, books, and software we personally use and trust.",
            layout: "grid",
            showDisclosure: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-promo-banner",
          type: "promotional_banner",
          title: "Work With Us",
          subtitle: "Client project inquiry banner",
          order: 7,
          isVisible: true,
          status: "Published",
          config: {
            headline: "Have a project in mind?",
            description: "Let's build a standout web experience or visual direction together.",
            buttonText: "Get in Touch",
            buttonUrl: "/#contact",
            bgColor: "#082d2a",
            textColor: "#f5f0e8",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-newsletter",
          type: "newsletter",
          title: "Newsletter Signup",
          subtitle: "Join the VIP creative list",
          order: 8,
          isVisible: true,
          status: "Published",
          config: {
            headline: "Stay in the creative loop.",
            subheadline: "Get monthly design drops, new templates, and digital insights directly to your inbox.",
            buttonText: "Subscribe",
            placeholder: "Enter your email address...",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          sectionId: "sec-footer",
          type: "footer",
          title: "Footer & Socials",
          subtitle: "Closing copyright and links",
          order: 9,
          isVisible: true,
          status: "Published",
          config: {
            copyrightText: "© 2026 Ravion. All rights reserved.",
            showTermsLink: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await bioSectionsCol.insertMany(defaultSections);
    }

    // Note: Products and Links collections are left empty by default so user can manage their own data
  } catch (err) {
    console.error("Could not seed default bio/settings:", err);
  }
}


