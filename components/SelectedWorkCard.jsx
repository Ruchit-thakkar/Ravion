"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { MediaCarousel } from "./MediaCarousel";
import { siteConfig } from "@/lib/site-config";

export function SelectedWorkCard({ sample }) {
  const router = useRouter();

  const mediaList =
    sample.media && sample.media.length > 0
      ? sample.media
      : sample.images && sample.images.length > 0
      ? sample.images
      : sample.thumbnail
      ? [{ url: sample.thumbnail, fileType: "image" }]
      : [];

  const handleCardClick = () => {
    if (sample.slug) {
      router.push(`/samples/${sample.slug}`);
    } else {
      router.push("/samples");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="sample-card group relative block cursor-pointer overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c99a55]/40 hover:shadow-xl"
    >
      {/* Media carousel */}
      <div className="relative overflow-hidden">
        <MediaCarousel media={mediaList} title={sample.title} />

        {/* 4 Call To Action Icons Overlay: Hover on desktop, always visible on mobile */}
        <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5 opacity-95 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100">
          {/* 1. Contact Section */}
          <a
            href="#contact"
            onClick={(e) => {
              e.stopPropagation();
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-[#f5f0e8] shadow-md backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-110 active:scale-95"
            title="Let's Talk (Contact)"
            aria-label="Go to contact section"
          >
            <MessageSquare size={14} />
          </a>

          {/* 2. Call */}
          <a
            href={`tel:${siteConfig.contact.phoneRaw}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-[#f5f0e8] shadow-md backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-110 active:scale-95"
            title={`Direct Call (${siteConfig.contact.phone})`}
            aria-label="Call Ravion"
          >
            <Phone size={14} />
          </a>

          {/* 3. WhatsApp */}
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-emerald-400 shadow-md backdrop-blur-md transition-all hover:bg-emerald-500 hover:text-white hover:scale-110 active:scale-95"
            title="Chat on WhatsApp"
            aria-label="WhatsApp Ravion"
          >
            <MessageCircle size={14} />
          </a>

          {/* 4. Email */}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-[#f5f0e8] shadow-md backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-110 active:scale-95"
            title={`Email us (${siteConfig.contact.email})`}
            aria-label="Email Ravion"
          >
            <Mail size={14} />
          </a>
        </div>
      </div>

      {/* Card Info */}
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider text-[#8b714e] uppercase">
            {sample.category}
          </span>
          <ArrowUpRight
            className="text-ink/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
            size={17}
          />
        </div>

        <h3 className="mt-1.5 font-serif text-2xl font-semibold transition-colors duration-300 group-hover:text-gold">
          {sample.title}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-ink/70 line-clamp-2">
          {sample.description || "Distinctive digital experience and visual project by Ravion."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
          <span className="font-mono text-[10px] text-ink/40">
            Click to view project
          </span>
          <span className="font-mono text-xs font-semibold text-gold">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}

export default SelectedWorkCard;
