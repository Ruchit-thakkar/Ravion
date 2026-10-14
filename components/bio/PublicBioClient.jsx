"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Globe,
  Camera as Instagram,
  Sparkles,
  Download,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Tag,
  ShieldCheck,
  X,
  Share2,
} from "lucide-react";

export default function PublicBioClient({ initialData }) {
  const profile = initialData?.profile || {};
  const sections = (initialData?.sections || []).filter((s) => s.isVisible);
  const products = initialData?.products || [];
  const links = initialData?.links || [];
  const settings = initialData?.settings || {};

  // Interactive modal state for viewing a product
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState({ loading: false, msg: "", error: false });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      setNewsletterStatus({ loading: true, msg: "", error: false });
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "bio_page" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed.");

      setNewsletterStatus({
        loading: false,
        msg: data.message || "Thank you for subscribing!",
        error: false,
      });
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterStatus({
        loading: false,
        msg: err.message || "Something went wrong.",
        error: true,
      });
    }
  };

  const handleDownloadFree = async (product) => {
    try {
      setDownloadingId(product._id);
      window.location.href = `/api/products/download/${product._id}`;
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloadingId(null), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#062b28] text-[#f5f0e8] selection:bg-[#c99a55] selection:text-[#031513] px-4 py-10 sm:py-16">
      {/* Background radial aesthetics */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(201,154,85,0.12),rgba(0,0,0,0))]" />

      <div className="relative mx-auto w-full max-w-lg space-y-6">
        {/* Render Sections in Configured Order */}
        {sections.map((sec) => (
          <div key={sec._id || sec.sectionId}>
            {renderSection(sec, profile, products, links, {
              setSelectedProduct,
              handleDownloadFree,
              downloadingId,
              newsletterEmail,
              setNewsletterEmail,
              newsletterStatus,
              handleNewsletterSubmit,
            })}
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12">
            <h2 className="font-serif text-3xl">Made with imagination.</h2>
            <p className="mt-2 text-sm text-[#f5f0e8]/70">Ravion Creative Studio</p>
          </div>
        )}
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Thumbnail */}
            <div className="h-52 w-full rounded-2xl bg-[#031513] overflow-hidden border border-[#c99a55]/20">
              <img
                src={selectedProduct.thumbnail || "/assets/ravion-logo.png"}
                alt={selectedProduct.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#dfb77b] uppercase tracking-wider">
                  {selectedProduct.category} · {selectedProduct.type}
                </span>
                <span className="font-mono text-xs font-bold text-[#c99a55]">
                  {selectedProduct.price > 0
                    ? `${selectedProduct.currency} ${selectedProduct.price}`
                    : "Free Download"}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#f5f0e8]">
                {selectedProduct.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#f5f0e8]/80">
                {selectedProduct.fullDescription || selectedProduct.shortDescription}
              </p>
            </div>

            {/* Tags */}
            {selectedProduct.tags && selectedProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedProduct.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[#c99a55]/20 bg-[#031513] px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2">
              {selectedProduct.type === "affiliate" ? (
                <div>
                  <a
                    href={selectedProduct.affiliateUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c99a55] py-3 text-xs font-bold text-[#031513] shadow-lg shadow-[#c99a55]/20 hover:bg-[#d1aa6b] transition-all"
                  >
                    <span>View Product on Partner Store</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <p className="mt-2 text-center text-[10px] text-[#f5f0e8]/60 italic">
                    This page contains affiliate links. I may earn a commission from qualifying purchases at no additional cost to you.
                  </p>
                </div>
              ) : selectedProduct.price > 0 ? (
                <a
                  href={selectedProduct.purchaseUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c99a55] py-3 text-xs font-bold text-[#031513] shadow-lg shadow-[#c99a55]/20 hover:bg-[#d1aa6b] transition-all"
                >
                  <span>Purchase on Gumroad ({selectedProduct.currency} {selectedProduct.price})</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <button
                  onClick={() => handleDownloadFree(selectedProduct)}
                  disabled={downloadingId === selectedProduct._id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                >
                  {downloadingId === selectedProduct._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Download Free File Instantly</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function renderSection(sec, profile, products, links, handlers) {
  const cfg = sec.config || {};

  switch (sec.type) {
    case "profile_header":
      return (
        <div className="text-center pt-2 pb-4">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-[#c99a55] bg-cream p-1 mb-4 shadow-xl shadow-black/40">
            <img
              src={profile.avatarUrl || "/assets/ravion_logo_svg-01.svg"}
              alt={profile.displayName || "Ravion"}
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <p className="font-mono text-xs tracking-[.25em] text-[#dfb77b] uppercase">
            {cfg.badgeText || profile.shortBio || "BUILD · CREATE · INNOVATE"}
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-normal text-cream">
            {cfg.headline || "Made with imagination."}
          </h1>
          <p className="mt-3 text-sm text-cream/80 max-w-md mx-auto leading-relaxed">
            {profile.description || "Elevated digital experiences, visual direction, and digital products."}
          </p>
        </div>
      );

    case "announcement":
      return (
        <a
          href={cfg.linkUrl || "#"}
          className="group flex items-center justify-between rounded-xl border border-[#c99a55]/30 bg-[#041d1a]/90 p-3 text-xs shadow-md transition-all hover:border-[#c99a55] hover:bg-[#062623]"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className="rounded-md bg-[#c99a55] px-2 py-0.5 font-mono text-[9px] font-bold text-[#031513] uppercase shrink-0">
              {cfg.badgeText || "NEW"}
            </span>
            <span className="text-[#f5f0e8] truncate">{cfg.message}</span>
          </div>
          {cfg.linkText && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#d1aa6b] group-hover:translate-x-0.5 transition-transform shrink-0">
              {cfg.linkText}
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </a>
      );

    case "custom_links":
      return (
        <div className="grid gap-3 text-sm">
          {links.map((link) => (
            <a
              key={link._id || link.title}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex items-center justify-between rounded-2xl bg-white p-4 text-[#082d2a] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#082d2a]/5 text-[#082d2a] group-hover:bg-[#c99a55] group-hover:text-[#031513] transition-colors">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <span className="font-semibold block truncate">{link.title}</span>
                  {link.description && (
                    <span className="text-xs text-[#082d2a]/60 block truncate -mt-0.5">
                      {link.description}
                    </span>
                  )}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#082d2a]/60 group-hover:text-[#082d2a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </a>
          ))}
        </div>
      );

    case "featured_products":
    case "digital_products": {
      const isFeatured = sec.type === "featured_products";
      const items = products.filter((p) =>
        isFeatured ? p.featured : p.type === "digital"
      );

      if (!items.length) return null;

      return (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-medium text-cream">
              {cfg.headline || sec.title}
            </h3>
            <span className="font-mono text-[10px] text-[#dfb77b] uppercase">
              {items.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((prod) => (
              <div
                key={prod._id || prod.slug}
                onClick={() => handlers.setSelectedProduct(prod)}
                className="group cursor-pointer rounded-2xl border border-[#c99a55]/20 bg-[#041d1a]/80 p-3.5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a55] hover:bg-[#062623]"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-[#031513] mb-3">
                  <img
                    src={prod.thumbnail || "/assets/ravion-logo.png"}
                    alt={prod.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-md bg-[#031513]/80 px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b] backdrop-blur-sm">
                    {prod.price > 0 ? `${prod.currency} ${prod.price}` : "Free"}
                  </span>
                </div>

                <p className="font-serif text-sm font-semibold text-cream line-clamp-1 group-hover:text-[#d1aa6b] transition-colors">
                  {prod.title}
                </p>
                <p className="mt-1 text-xs text-cream/70 line-clamp-2 leading-relaxed">
                  {prod.shortDescription}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#c99a55]/10">
                  <span className="font-mono text-[10px] text-[#dfb77b]">View Details</span>
                  <ArrowRight className="h-3 w-3 text-[#c99a55] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "affiliate_recommendations": {
      const affiliateItems = products.filter((p) => p.type === "affiliate");
      if (!affiliateItems.length) return null;

      return (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-medium text-cream">
              {cfg.headline || "Curated Gear & Recommendations"}
            </h3>
            <span className="font-mono text-[10px] text-[#dfb77b] uppercase">Affiliate</span>
          </div>

          {cfg.showDisclosure !== false && (
            <div className="rounded-xl border border-[#c99a55]/20 bg-[#041d1a]/60 p-3 text-xs text-[#f5f0e8]/75 italic leading-relaxed">
              This page contains affiliate links. I may earn a commission from qualifying purchases at no additional cost to you.
            </div>
          )}

          <div className="space-y-2.5">
            {affiliateItems.map((prod) => (
              <div
                key={prod._id || prod.slug}
                onClick={() => handlers.setSelectedProduct(prod)}
                className="group cursor-pointer flex items-center gap-3.5 rounded-2xl border border-[#c99a55]/20 bg-[#041d1a]/80 p-3 shadow-lg transition-all hover:-translate-y-0.5 hover:border-[#c99a55] hover:bg-[#062623]"
              >
                <img
                  src={prod.thumbnail || "/assets/ravion-logo.png"}
                  alt={prod.title}
                  className="h-14 w-14 rounded-xl object-cover bg-black/40 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-cream truncate group-hover:text-[#d1aa6b] transition-colors">
                    {prod.title}
                  </p>
                  <p className="text-xs text-cream/65 line-clamp-1 mt-0.5">
                    {prod.shortDescription}
                  </p>
                  <p className="font-mono text-[10px] text-[#dfb77b] mt-1">
                    {prod.price ? `${prod.currency} ${prod.price}` : "Check Store"}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#c99a55] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "promotional_banner":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-[#c99a55]/30 bg-gradient-to-br from-[#082d2a] to-[#041d1a] p-6 text-center shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#c99a55]/10 blur-2xl" />
          <h3 className="font-serif text-2xl font-bold text-cream">
            {cfg.headline || "Work With Us"}
          </h3>
          <p className="mt-2 text-xs text-cream/75 leading-relaxed max-w-sm mx-auto">
            {cfg.description}
          </p>
          <a
            href={cfg.buttonUrl || "/#contact"}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c99a55] px-6 py-2.5 text-xs font-bold text-[#031513] shadow-lg shadow-[#c99a55]/20 hover:bg-[#d1aa6b] transition-all"
          >
            <span>{cfg.buttonText || "Get in Touch"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      );

    case "newsletter":
      return (
        <div className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/80 p-6 text-center shadow-xl space-y-3">
          <h3 className="font-serif text-xl font-semibold text-cream">
            {cfg.headline || "Join the VIP creative list"}
          </h3>
          <p className="text-xs text-cream/75 max-w-sm mx-auto leading-relaxed">
            {cfg.subheadline || "Receive monthly design drops and digital insights directly to your inbox."}
          </p>

          <form onSubmit={handlers.handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto pt-1">
            <input
              type="email"
              required
              value={handlers.newsletterEmail}
              onChange={(e) => handlers.setNewsletterEmail(e.target.value)}
              placeholder={cfg.placeholder || "Enter your email address..."}
              className="flex-1 rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#c99a55] focus:outline-none"
            />
            <button
              type="submit"
              disabled={handlers.newsletterStatus.loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-2.5 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b] transition-all"
            >
              {handlers.newsletterStatus.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span>{cfg.buttonText || "Subscribe"}</span>
              )}
            </button>
          </form>

          {handlers.newsletterStatus.msg && (
            <p
              className={`text-xs ${
                handlers.newsletterStatus.error ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {handlers.newsletterStatus.msg}
            </p>
          )}
        </div>
      );

    case "about_me":
      return (
        <div className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/70 p-6 shadow-xl space-y-2 text-left">
          <h3 className="font-serif text-lg font-semibold text-cream">
            {cfg.headline || "About Ravion"}
          </h3>
          <p className="text-xs text-cream/80 leading-relaxed">{cfg.story}</p>
        </div>
      );

    case "social_links":
      return (
        <div className="flex items-center justify-center gap-3 pt-3">
          <a
            href={profile.websiteUrl || "https://ravion.in"}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cream hover:bg-[#c99a55] hover:text-[#031513] transition-all"
            title="Website"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            href="https://www.instagram.com/ravion.ai/"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cream hover:bg-[#c99a55] hover:text-[#031513] transition-all"
            title="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://wa.me/917990774831"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cream hover:bg-[#c99a55] hover:text-[#031513] transition-all"
            title="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cream hover:bg-[#c99a55] hover:text-[#031513] transition-all"
            title="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      );

    case "custom_text":
      return (
        <div className="py-2 text-center text-xs text-cream/80 italic max-w-sm mx-auto leading-relaxed">
          &quot;{cfg.content}&quot;
        </div>
      );

    case "footer":
      return (
        <footer className="pt-6 pb-2 text-center font-mono text-xs text-cream/50 space-y-2 border-t border-[#c99a55]/15">
          <p>{cfg.copyrightText || "© 2026 Ravion. All rights reserved."}</p>
          {cfg.showTermsLink !== false && (
            <p>
              <Link href="/terms" className="hover:text-cream underline">
                Terms & Policies
              </Link>
            </p>
          )}
        </footer>
      );

    default:
      return null;
  }
}
