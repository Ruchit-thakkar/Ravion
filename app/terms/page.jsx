import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  MessageCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata = {
  title: "Terms & Policies | Ravion",
  description:
    "Read Ravion's terms and policies covering payments, revisions, delivery, refunds, website services, AI-assisted content and creative projects.",
  openGraph: {
    title: "Terms & Policies | Ravion",
    description:
      "Read Ravion's terms and policies covering payments, revisions, delivery, refunds, website services, AI-assisted content and creative projects.",
    url: `${siteConfig.url}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Policies | Ravion",
    description:
      "Read Ravion's terms and policies covering payments, revisions, delivery, refunds, website services, AI-assisted content and creative projects.",
  },
};

export default function TermsPage() {
  const quickLinks = [
    { name: "Payment", href: "#payment" },
    { name: "Revisions", href: "#revisions" },
    { name: "Delivery", href: "#delivery" },
    { name: "Cancellation & Refunds", href: "#refunds" },
    { name: "Websites", href: "#website" },
    { name: "AI Content", href: "#ai" },
    { name: "Source Files", href: "#source" },
    { name: "Portfolio", href: "#portfolio" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#082d2a] selection:bg-[#c99a55] selection:text-[#031513]">
      <Header />

      <main id="main-content" className="py-12 md:py-20">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          {/* Back to Home Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#836946] transition-colors hover:text-[#082d2a]"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Heading & Intro */}
          <div className="max-w-3xl border-b border-[#082d2a]/15 pb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c99a55]/40 bg-[#c99a55]/10 px-3.5 py-1 font-mono text-[11px] font-medium tracking-wider text-[#8b714e] uppercase">
              <Sparkles size={12} className="text-[#c99a55]" />
              Official Studio Guidelines
            </div>

            <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
              Terms & <em className="text-[#c99a55]">Policies</em>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-[#082d2a]/80 md:text-xl">
              Clear terms help us maintain a smooth, professional and transparent
              experience for every Ravion client.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#836946]">
              <span>Last Updated: August 2026</span>
              <span>·</span>
              <span>Applies to all active studio projects</span>
            </div>
          </div>

          {/* Page Body Grid: Sticky Quick Nav (Desktop) + Content */}
          <div className="mt-12 grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
            {/* Quick Navigation Sticky Sidebar */}
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-2xl border border-[#082d2a]/15 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
                <p className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                  Quick Navigation
                </p>
                <nav className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1.5" aria-label="Table of contents">
                  {quickLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-[#082d2a]/80 transition-colors hover:bg-[#082d2a]/5 hover:text-[#c99a55] lg:text-sm"
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 border-t border-[#082d2a]/10 pt-4 text-xs text-[#082d2a]/60">
                  <p>Questions? Reach out via WhatsApp or Email.</p>
                </div>
              </div>
            </aside>

            {/* All 12 Policy Sections */}
            <div className="space-y-16">
              {/* 01 — Payment Policy */}
              <section id="payment" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    01
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Payment Policy
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  To begin any project with Ravion, an advance payment is required to
                  reserve your project slot and start the work.
                </p>

                <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-5">
                  <p className="font-serif text-lg font-medium text-[#082d2a]">
                    <strong>50% advance payment is required before work begins.</strong>{" "}
                    The remaining 50% must be paid before final delivery of the completed work.
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm text-[#082d2a]/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Work begins only after the required advance payment is received.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>The remaining balance is due before final files are delivered.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>For orders under ₹1,000, Ravion may require 100% payment upfront.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Monthly packages are payable at the beginning of each billing month.</span>
                  </li>
                </ul>

                {/* Standard Project Flow Timeline */}
                <div className="mt-8 rounded-2xl border border-[#082d2a]/15 bg-white p-6 shadow-sm">
                  <h3 className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                    Standard Project Flow
                  </h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-5">
                    {[
                      { step: "01", title: "Order Confirmed", desc: "Scope & agreement locked" },
                      { step: "02", title: "50% Advance", desc: "Production slot booked" },
                      { step: "03", title: "Work Starts", desc: "Creative development" },
                      { step: "04", title: "Preview & Revisions", desc: "Refinement & feedback" },
                      { step: "05", title: "50% Balance → Final Files", desc: "Delivery & handover" },
                    ].map((item, idx) => (
                      <div
                        key={item.step}
                        className="relative flex flex-col justify-between rounded-xl bg-[#f5f0e8] p-4 text-left"
                      >
                        <span className="font-mono text-xs font-semibold text-[#c99a55]">
                          {item.step}
                        </span>
                        <h4 className="mt-3 text-xs font-semibold text-[#082d2a]">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-[#082d2a]/60">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 02 — Revision Policy */}
              <section id="revisions" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    02
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Revision Policy
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Every package includes a specific number of revisions. The included
                  revision count is mentioned clearly in the selected package.
                </p>

                <ul className="space-y-2.5 text-sm text-[#082d2a]/80">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>A revision means reasonable changes to the existing concept or design.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Completely new concepts are not considered revisions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Major changes after approval may be charged separately.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Additional revisions may be purchased at the applicable add-on price.</span>
                  </li>
                </ul>

                <div className="inline-flex items-center gap-2 rounded-xl border border-[#082d2a]/15 bg-white px-4 py-3 text-sm font-medium">
                  <span className="font-mono text-xs text-[#8b714e] uppercase">Add-on:</span>
                  <span><strong>Extra Revision: ₹100</strong> for applicable creative work unless agreed otherwise.</span>
                </div>
              </section>

              {/* 03 — Delivery Policy */}
              <section id="delivery" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    03
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Delivery Policy
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Delivery timelines depend on the selected service and package.
                </p>

                <ul className="space-y-2.5 text-sm text-[#082d2a]/80">
                  <li className="flex items-start gap-2.5">
                    <Clock size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Delivery time starts after payment and receipt of all required client information.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Client delays in providing assets, information or feedback may extend the delivery timeline.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Standard delivery timelines are estimates and may vary depending on project complexity.</span>
                  </li>
                </ul>

                <div className="rounded-xl border border-[#c99a55]/25 bg-white p-4 text-sm">
                  <span className="font-mono text-xs text-[#8b714e] uppercase">Express Option:</span>
                  <p className="mt-1 font-medium">
                    Urgent 24-hour delivery may be available for an additional <strong>₹399</strong>.
                  </p>
                </div>
              </section>

              {/* 04 — Preview & Final Files */}
              <section id="preview" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    04
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Preview & Final Files
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Ravion may provide preview files for review before final delivery.
                </p>

                <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5 text-center sm:text-left">
                  <p className="font-mono text-xs text-[#8b714e] uppercase">
                    Delivery Progression
                  </p>
                  <p className="mt-2 font-serif text-base font-semibold md:text-lg">
                    Preview → Client Approval → Remaining Payment → Final High-Resolution Files
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-[#082d2a]/80">
                  Preview files may contain a watermark or reduced resolution. Clean,
                  final-quality files are delivered after the applicable balance payment
                  has been received.
                </p>
              </section>

              {/* 05 — Cancellation & Refund Policy */}
              <section id="refunds" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    05
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Cancellation & Refund Policy
                </h2>

                <ul className="space-y-2.5 text-sm text-[#082d2a]/80">
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Advance payment is generally non-refundable once project work has started.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>The advance covers project preparation, creative work and reserved production time.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>If a client cancels before work begins, the refund will be considered on a case-by-case basis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Completed work, delivered work or approved work is not eligible for a refund.</span>
                  </li>
                </ul>

                <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-900">
                  <strong>Important:</strong> Please make sure the project requirements are clear before confirming the order.
                </div>
              </section>

              {/* 06 — Client Responsibilities */}
              <section id="responsibilities" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    06
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Client Responsibilities
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Clients are responsible for providing accurate information and required assets needed to complete the project:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Product images or references",
                    "Logo and brand assets",
                    "Product information",
                    "Business information",
                    "Required text and specifications",
                    "References or creative instructions",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-[#082d2a]/10 bg-white p-3 text-xs font-medium"
                    >
                      <CheckCircle2 size={14} className="text-[#c99a55]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[#082d2a]/70">
                  Ravion is not responsible for delays caused by missing, incomplete or late information from the client.
                </p>
              </section>

              {/* 07 — AI Content Policy */}
              <section id="ai" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    07
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  AI Content Policy
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Ravion may use AI-assisted tools and creative technologies to produce product images, promotional visuals and other content.
                </p>

                <ul className="space-y-2.5 text-sm text-[#082d2a]/80">
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>AI-generated visuals are created using the product/reference material supplied by the client.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Minor variations in reflections, packaging, labels, props, hands, models or backgrounds may occur.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Ravion will make reasonable efforts to maintain product accuracy and visual consistency.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-[#c99a55]" />
                    <span>Low-quality or unclear source images may affect the final result.</span>
                  </li>
                </ul>
              </section>

              {/* 08 — Website Services */}
              <section id="website" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    08
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Website Services
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Website projects follow the payment and approval process agreed upon before development begins.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5">
                    <h3 className="font-serif text-base font-semibold">Website Payment</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/75">
                      50% advance payment is required to start the website project. The remaining 50% is due before final launch or handover.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5">
                    <h3 className="font-serif text-base font-semibold">Domain & Hosting</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/75">
                      Domain, hosting, premium plugins, third-party services, APIs or other external costs are not included unless specifically mentioned in the selected package.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5">
                    <h3 className="font-serif text-base font-semibold">Scope Changes</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/75">
                      Major features or functionality added after the agreed scope may require an additional quotation.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5">
                    <h3 className="font-serif text-base font-semibold">Third-Party Services</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/75">
                      Ravion is not responsible for limitations, outages, policy changes or fees imposed by external platforms such as Google, hosting providers, payment gateways or other third-party services.
                    </p>
                  </div>
                </div>
              </section>

              {/* 09 — Source & Editable Files */}
              <section id="source" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    09
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Source & Editable Files
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Final exported files are included according to the selected package.
                </p>
                <div className="rounded-xl border border-[#082d2a]/15 bg-white p-5">
                  <p className="text-sm leading-relaxed text-[#082d2a]/80">
                    Editable/source files such as PSD, AI, Canva editable designs, project files,
                    video project files or development source files are <strong>not included</strong> unless
                    specifically agreed upon. Source files may be available for an additional fee depending on the project.
                  </p>
                </div>
              </section>

              {/* 10 — Portfolio & Promotion */}
              <section id="portfolio" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    10
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Portfolio & Promotion
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Ravion may showcase completed work on its website, Instagram, portfolio and other promotional channels.
                </p>
                <p className="text-sm text-[#082d2a]/75">
                  If a project is confidential or cannot be publicly displayed, the client should inform Ravion before the project begins.
                </p>
              </section>

              {/* 11 — Scope of Work */}
              <section id="scope" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    11
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Scope of Work
                </h2>
                <p className="text-base leading-relaxed text-[#082d2a]/80">
                  Only the services and deliverables mentioned in the selected package or agreed quotation are included.
                </p>
                <p className="text-sm text-[#082d2a]/75">
                  Additional services, features, designs, pages, revisions, content or functionality may be quoted separately.
                </p>
              </section>

              {/* 12 — Policy Acceptance */}
              <section id="acceptance" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#8b714e]">
                    12
                  </span>
                  <div className="h-px flex-1 bg-[#082d2a]/15" />
                </div>
                <h2 className="font-serif text-3xl font-semibold md:text-4xl">
                  Policy Acceptance
                </h2>
                <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-5">
                  <p className="text-sm leading-relaxed text-[#082d2a]">
                    By confirming an order, making an advance payment or proceeding with a project,
                    the client acknowledges that they have read and agreed to these Terms & Policies.
                  </p>
                </div>
                <p className="text-xs text-[#082d2a]/70">
                  Ravion reserves the right to update these policies when necessary. The latest version published on this page will apply to future projects.
                </p>
              </section>

              {/* Have a Question? CTA Box */}
              <section className="rounded-2xl border border-[#082d2a]/20 bg-[#062623] p-8 text-[#f5f0e8] shadow-xl md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-mono text-xs tracking-widest text-[#d1aa6b] uppercase">
                      Direct Support
                    </span>
                    <h3 className="mt-2 font-serif text-3xl md:text-4xl">
                      Have a Question?
                    </h3>
                    <p className="mt-2 max-w-lg text-sm text-[#f5f0e8]/75">
                      Need clarification before starting your project? Contact Ravion directly.
                      We will be glad to walk you through the details.
                    </p>
                    <p className="mt-3 font-mono text-xs text-[#d1aa6b]">
                      {siteConfig.name} · {siteConfig.tagline} · {siteConfig.subDescription}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                    <a
                      href={siteConfig.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-95"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp (7990774831)</span>
                    </a>

                    <a
                      href={siteConfig.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-95"
                    >
                      <InstagramIcon size={16} />
                      <span>Instagram (@ravion.ai)</span>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
