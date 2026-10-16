"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#051f1c] text-[#f5f0e8] border-t border-[#c99a55]/20 selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Top Pre-Footer Banner */}
      <div className="border-b border-white/10 bg-[#031513]/60 py-10">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-[#d1aa6b] uppercase">
              <Sparkles size={13} className="text-[#c99a55]" />
              Elevate Your Digital Presence
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Have an ambitious project in mind?
            </h2>
          </div>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#c99a55] px-6 py-3 font-medium text-[#031513] transition-all duration-300 hover:bg-white hover:shadow-lg active:scale-95"
          >
            <span>Start a project</span>
            <ArrowUpRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>

      {/* Main 4-Column Grid */}
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* COLUMN 1 — BRAND IDENTITY */}
          <div className="space-y-4 ">
            <Link
              href="/"
              className="inline-block transition-transform hover:opacity-95"
              aria-label="Ravion Home"
            >
              <img
                src="/assets/ravion_logo_svg-01.svg"
                alt={siteConfig.name}
                className="h-9 w-auto rounded-md bg-white px-2 py-1 shadow-sm"
              />
            </Link>

            <p className="font-mono text-[11px] font-medium tracking-[0.25em] text-[#d1aa6b] uppercase">
              BUILD · CREATE · INNOVATE
            </p>

            <p className="text-sm font-medium text-[#f5f0e8]/90">
              {siteConfig.subDescription}
            </p>

            <p className="text-xs leading-relaxed text-[#f5f0e8]/65">
              {siteConfig.footerDescription}
            </p>
          </div>

          {/* COLUMN 2 — QUICK LINKS (Explore) */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold tracking-wider text-[#d1aa6b] uppercase">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/samples"
                  className="inline-flex items-center gap-1 text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  <span>Our Work</span>
                  <span className="rounded bg-[#c99a55]/20 px-1.5 py-0.2 font-mono text-[9px] text-[#d1aa6b]">
                    Portfolio
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  About Ravion
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/#process"
                  className="text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  How We Work
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 — OUR SERVICES (What We Do) */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold tracking-wider text-[#d1aa6b] uppercase">
              What We Do
            </h3>
            <ul className="space-y-2.5 text-sm text-[#f5f0e8]/75">
              <li>
                <Link
                  href="/#services"
                  className="transition-colors hover:text-[#d1aa6b]"
                >
                  Website Development
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="transition-colors hover:text-[#d1aa6b]"
                >
                  AI Product Photography
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="transition-colors hover:text-[#d1aa6b]"
                >
                  Social Media Content
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="transition-colors hover:text-[#d1aa6b]"
                >
                  Graphic Design & Visual Direction
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="transition-colors hover:text-[#d1aa6b]"
                >
                  Short-Form Video Production
                </Link>
              </li>
              <li>
                <Link
                  href="/samples"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#d1aa6b] transition-colors hover:underline pt-1"
                >
                  <span>Browse Service Samples</span>
                  <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 — GET IN TOUCH (Let's Connect) */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold tracking-wider text-[#d1aa6b] uppercase">
              Let&apos;s Connect
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="group flex items-start gap-2.5 text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                  aria-label="Send email to Ravion"
                >
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0 text-[#d1aa6b] transition-transform group-hover:scale-110"
                  />
                  <span className="break-all">{siteConfig.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="group flex items-center gap-2.5 text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                  aria-label="Call Ravion phone"
                >
                  <Phone
                    size={16}
                    className="shrink-0 text-[#d1aa6b] transition-transform group-hover:scale-110"
                  />
                  <span>{siteConfig.contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-[#f5f0e8]/75 transition-colors hover:text-emerald-400"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle
                    size={16}
                    className="shrink-0 text-emerald-400 transition-transform group-hover:scale-110"
                  />
                  <span>WhatsApp ({siteConfig.contact.phone})</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-[#f5f0e8]/75 transition-colors hover:text-[#d1aa6b]"
                  aria-label="Follow Ravion on Instagram"
                >
                  <InstagramIcon
                    size={16}
                    className="shrink-0 text-[#d1aa6b] transition-transform group-hover:scale-110"
                  />
                  <span>{siteConfig.contact.instagram}</span>
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#d1aa6b] underline-offset-4 hover:underline"
              >
                <span>Client Terms & Policies</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Bar */}
      <div className="border-t border-white/10 bg-[#031513]/70 py-4">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-center justify-between gap-3 text-xs text-[#f5f0e8]/65 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:justify-start">
            <Link
              href="/terms"
              className="transition-colors hover:text-[#d1aa6b]"
            >
              Terms & Conditions
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/terms#refunds"
              className="transition-colors hover:text-[#d1aa6b]"
            >
              Refund Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/terms#payment"
              className="transition-colors hover:text-[#d1aa6b]"
            >
              Payment Terms
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/#contact"
              className="transition-colors hover:text-[#d1aa6b]"
            >
              Contact
            </Link>
          </div>

          <div className="font-mono text-[11px] text-[#d1aa6b]/80">
            India (भारत) · Global Studio
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 bg-[#020e0d] py-6">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#d1aa6b]">
            BUILD · CREATE · INNOVATE
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
