import "./globals.css";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Ravion — Build. Create. Innovate.",
    template: "%s — Ravion",
  },
  description: siteConfig.description,
  keywords: [
    "Ravion",
    "Creative Studio",
    "Digital Experiences",
    "Web Development",
    "AI Product Photography",
    "Visual Identity",
    "Social Media Content",
    "Video Production",
    "Ruchit Thakkar",
  ],
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Ravion — Build. Create. Innovate.",
    description: siteConfig.description,
    images: [
      {
        url: "/assets/ravion-logo.png",
        width: 1200,
        height: 630,
        alt: "Ravion — Build. Create. Innovate.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ravion — Build. Create. Innovate.",
    description: siteConfig.description,
    images: ["/assets/ravion-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/assets/ravion-logo.png`,
  image: `${siteConfig.url}/assets/ravion-logo.png`,
  description: siteConfig.description,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  founder: {
    "@type": "Person",
    name: siteConfig.creator,
  },
  sameAs: [
    siteConfig.contact.instagramUrl,
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
