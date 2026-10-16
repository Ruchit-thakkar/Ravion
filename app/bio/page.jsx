import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
} from "lucide-react";
import { getBioPageCollection, getLinksCollection } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const bioCol = await getBioPageCollection();
    const profile = await bioCol.findOne({ key: "default" });

    const title = profile?.seo?.title || profile?.displayName
      ? `${profile.displayName} — Bio & Official Links`
      : "Ravion — Bio & Digital Space";
    const description =
      profile?.seo?.description ||
      profile?.description ||
      "Elevated digital experiences, high-converting websites, creative content, and digital resources.";
    const ogImage = profile?.seo?.ogImage || profile?.avatarUrl || "/assets/ravion-logo.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImage }],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Ravion — Bio & Digital Space",
      description: "Official links and creative showcase for Ravion Studio.",
    };
  }
}

function resolveIcon(iconKey) {
  switch ((iconKey || "").toLowerCase()) {
    case "globe":
    case "website":
      return <Globe size={18} />;
    case "briefcase":
    case "portfolio":
    case "samples":
      return <Briefcase size={18} />;
    case "sparkles":
    case "featured":
      return <Sparkles size={18} />;
    case "phone":
    case "call":
      return <Phone size={18} />;
    case "message-circle":
    case "whatsapp":
      return <MessageCircle size={18} />;
    case "mail":
    case "email":
      return <Mail size={18} />;
    case "folder":
      return <FolderKanban size={18} />;
    default:
      return <ArrowUpRight size={18} />;
  }
}

function renderSocialIcon(platform) {
  const p = (platform || "").toLowerCase();
  if (p === "instagram") {
    return (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (p === "whatsapp") {
    return <MessageCircle size={16} />;
  }
  if (p === "email" || p === "mail") {
    return <Mail size={16} />;
  }
  if (p === "phone" || p === "call") {
    return <Phone size={16} />;
  }
  if (p === "twitter" || p === "x") {
    return (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <Globe size={16} />;
}

export default async function BioPage() {
  const [bioCol, linksCol] = await Promise.all([
    getBioPageCollection(),
    getLinksCollection(),
  ]);

  const profile = await bioCol.findOne({ key: "default" });
  const activeLinks = await linksCol
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const isPublished = profile?.status === "Published";
  const displayName = profile?.displayName || "Ravion Studio";
  const title = profile?.title || "Creative Designer & Digital Builder";
  const shortBio = profile?.shortBio || "BUILD · CREATE · INNOVATE";
  const description =
    profile?.description ||
    "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.";
  const avatarUrl =
    profile?.avatarUrl ||
    "https://ik.imagekit.io/ruchit/ravion/samples/1792054787783-elegant-ravion-serif-wordmark_306aWE0aA.png";
  const socialLinks = Array.isArray(profile?.socialLinks)
    ? profile.socialLinks.filter((s) => s.isActive !== false)
    : [];
  const footerText = profile?.footerText || "© 2026 Ravion. Crafted with passion and imagination.";

  // If status is Draft and not published, show a graceful under construction state
  if (!isPublished) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#031513] px-4 py-16 text-[#f5f0e8] selection:bg-[#c99a55] selection:text-[#031513]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,154,85,0.12),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#c99a55]/20 bg-[#082d2a]/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#c99a55]/60 bg-[#031513] text-[#c99a55] shadow-lg shadow-[#c99a55]/20">
            <Sparkles size={32} />
          </div>
          <span className="mt-5 inline-block font-mono text-[11px] font-semibold tracking-[0.25em] text-[#c99a55] uppercase">
            COMING SOON
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[#f5f0e8]">
            {displayName}
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-[#f5f0e8]/70">
            Our official Link in Bio space is currently being crafted with precision. Check back shortly or visit our main experience below.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-5 py-3 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95"
            >
              <span>Explore Main Website</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#031513] text-[#f5f0e8] selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c99a55]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#082d2a]/60 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(3,21,19,0.85))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 py-12 sm:py-16">
        {/* Top Header & Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="group relative">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#c99a55] via-[#dfb77b] to-[#082d2a] opacity-60 blur-sm transition-opacity group-hover:opacity-100" />
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#c99a55] bg-[#082d2a] shadow-2xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-[#c99a55]">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Verified / Badge */}
          <div className="mt-4 flex items-center gap-1.5 rounded-full border border-[#c99a55]/30 bg-[#082d2a]/80 px-3 py-1 backdrop-blur-md shadow-sm">
            <Sparkles size={12} className="text-[#c99a55]" />
            <span className="font-mono text-[10.5px] font-semibold tracking-wider text-[#c99a55] uppercase">
              {shortBio}
            </span>
          </div>

          {/* Profile Name & Title */}
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#f5f0e8] sm:text-4xl">
            {displayName}
          </h1>
          <p className="mt-1 font-mono text-xs text-[#c99a55]/90">
            {title}
          </p>

          {/* Bio Description */}
          {description && (
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#f5f0e8]/75">
              {description}
            </p>
          )}

          {/* Social Links Bar */}
          {socialLinks.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {socialLinks.map((s, idx) => (
                <a
                  key={`${s.platform}-${idx}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label || s.platform}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c99a55]/30 bg-[#082d2a]/80 text-[#f5f0e8] shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:border-[#c99a55] hover:text-[#c99a55] hover:shadow-md hover:shadow-[#c99a55]/20 active:scale-95"
                >
                  {renderSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links Stack */}
        <div className="mt-8 space-y-3.5">
          {activeLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c99a55]/30 bg-[#082d2a]/50 p-8 text-center backdrop-blur-sm">
              <p className="font-serif text-sm text-[#f5f0e8]/70">No links published yet.</p>
              <p className="mt-1 text-xs text-[#c99a55]/80">Check back soon for new updates.</p>
            </div>
          ) : (
            activeLinks.map((link) => {
              const isExternal = link.url.startsWith("http://") || link.url.startsWith("https://");
              return (
                <a
                  key={link._id.toString()}
                  href={link.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`group relative flex items-center justify-between gap-3.5 rounded-2xl p-4 transition-all duration-300 active:scale-[0.99] ${
                    link.isFeatured
                      ? "border-2 border-[#c99a55] bg-gradient-to-r from-[#c99a55]/20 via-[#082d2a]/95 to-[#c99a55]/20 shadow-[0_0_25px_rgba(201,154,85,0.2)] hover:border-[#dfb77b] hover:shadow-[0_0_35px_rgba(201,154,85,0.3)]"
                      : "border border-[#c99a55]/25 bg-[#082d2a]/80 shadow-md backdrop-blur-md hover:-translate-y-0.5 hover:border-[#c99a55] hover:bg-[#082d2a]"
                  }`}
                >
                  {/* Left Icon or Thumbnail */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c99a55]/30 bg-[#031513]/60 text-[#c99a55] shadow-inner transition-transform group-hover:scale-105">
                    {link.thumbnail ? (
                      <img
                        src={link.thumbnail}
                        alt={link.title}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      resolveIcon(link.icon)
                    )}
                  </div>

                  {/* Middle Content */}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-sm font-semibold text-[#f5f0e8] group-hover:text-[#dfb77b] transition-colors truncate">
                        {link.title}
                      </h2>
                      {link.isFeatured && (
                        <span className="shrink-0 rounded-full bg-[#c99a55]/25 border border-[#c99a55]/60 px-2 py-0.5 font-mono text-[9px] font-bold text-[#c99a55] uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="mt-0.5 text-xs text-[#f5f0e8]/65 line-clamp-1">
                        {link.description}
                      </p>
                    )}
                  </div>

                  {/* Right Arrow */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c99a55]/10 text-[#c99a55] transition-all group-hover:bg-[#c99a55] group-hover:text-[#082d2a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={16} />
                  </div>
                </a>
              );
            })
          )}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-8 rounded-2xl border border-[#c99a55]/30 bg-gradient-to-b from-[#082d2a]/90 to-[#031513]/90 p-5 text-center shadow-xl backdrop-blur-md">
          <h3 className="font-serif text-base font-medium text-[#f5f0e8]">
            Have a project in mind?
          </h3>
          <p className="mt-1 text-xs text-[#f5f0e8]/65">
            Let&apos;s build an elevated web experience or digital product together.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-5 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95"
            >
              <span>Start an Inquiry</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c99a55]/40 bg-[#082d2a]/60 px-5 py-2.5 font-mono text-xs font-medium text-[#f5f0e8] transition-all hover:border-[#c99a55] hover:bg-[#082d2a] active:scale-95"
            >
              <span>Visit Website</span>
            </Link>
          </div>
        </div>

        {/* Footer Credit */}
        <footer className="mt-10 text-center">
          <p className="font-mono text-[11px] text-[#c99a55]/70">
            {footerText}
          </p>
        </footer>
      </div>
    </main>
  );
}
