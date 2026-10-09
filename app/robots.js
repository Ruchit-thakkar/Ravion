import { siteConfig } from "@/lib/site-config";

export default function robots() {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/samples", "/samples/*", "/bio", "/ruchit", "/terms"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
