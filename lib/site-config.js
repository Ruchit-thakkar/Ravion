/**
 * Centralized Site Configuration for RAVION
 * Preserves all official brand information, contact details, and social links.
 */

export const siteConfig = {
  name: "Ravion",
  tagline: "Build. Create. Innovate.",
  headline: "Build something worth feeling.",
  description: "Digital experiences, distinctly made. Ravion turns ambitious ideas into elevated digital experiences, visual worlds and work that gets remembered.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ravion.in",
  creator: "Ruchit Thakkar",
  contact: {
    email: "ruchitthakkar12@gmail.com",
    phone: "+91 79907 74831",
    phoneRaw: "+917990774831",
    phoneDisplay: "+91 79907 74831",
    whatsappUrl: "https://wa.me/917990774831",
    instagram: "@ravion.ai",
    instagramUrl: "https://www.instagram.com/ravion.ai/",
    termsAndPoliciesUrl: "/terms",
  },
  subDescription: "Your Growth Partner in Content & Digital World.",
  footerDescription: "We help businesses build a stronger digital presence through websites, creative content, product visuals, and digital experiences.",
  theme: {
    colors: {
      ink: "#082d2a",
      darkBg: "#031513",
      cream: "#f5f0e8",
      gold: "#c99a55",
      goldLight: "#d1aa6b",
      accent: "#dfb77b",
    },
  },
  services: [
    {
      id: "01",
      name: "Web experiences",
      description: "Websites, landing pages and link-in-bio spaces designed to convert attention into action.",
    },
    {
      id: "02",
      name: "Visual direction",
      description: "AI product imagery and visual systems that give your offering a point of view.",
    },
    {
      id: "03",
      name: "Content that travels",
      description: "Social content, campaign creative and motion that carries your brand further.",
    },
  ],
  categories: [
    "Web Services",
    "Link-in-Bio",
    "AI Product Photography",
    "Social Media Content",
    "Photoshop / Design",
    "Video",
    "Other",
  ],
};

export default siteConfig;
