import { Detail } from "@/components/ravion-client";
import { getSamplesCollection } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const samplesCol = await getSamplesCollection();
    const sample = await samplesCol.findOne({ slug: slug?.trim(), status: "Published" });

    if (!sample) {
      return {
        title: `Project Not Found — ${siteConfig.name}`,
        description: "The requested project could not be found.",
      };
    }

    const title = `${sample.title} — ${siteConfig.name}`;
    const description = sample.description || `${sample.title} by ${siteConfig.name}. Digital experience and creative showcase.`;
    const imageUrl = sample.thumbnail || sample.media?.[0]?.url || "/assets/ravion-logo.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `${siteConfig.url}/samples/${sample.slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: sample.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: `Project — ${siteConfig.name}`,
      description: siteConfig.description,
    };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <Detail slug={slug} />;
}
