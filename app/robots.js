import { siteConfig } from "@/lib/site-config";

export default function robots() {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/samples", "/samples/*", "/ruchit", "/terms"],
        disallow: ["/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
