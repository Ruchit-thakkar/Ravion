import { getSamplesCollection } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600; // revalidate sitemap once per hour

export default async function sitemap() {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static core routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/samples`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ruchit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic published sample routes from MongoDB
  let sampleRoutes = [];
  try {
    const samplesCol = await getSamplesCollection();
    const published = await samplesCol
      .find({ status: "Published" }, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();

    sampleRoutes = published.map((sample) => ({
      url: `${baseUrl}/samples/${sample.slug}`,
      lastModified: sample.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Sitemap dynamic fetch error:", err);
  }

  return [...staticRoutes, ...sampleRoutes];
}
