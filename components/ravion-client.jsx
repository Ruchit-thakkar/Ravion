"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Code2,
  Compass,
  Film,
  Layers,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { gsap, ScrollTrigger, isReducedMotion } from "@/lib/animations/gsap";
import { defaultAnimationConfig } from "@/lib/animations/config";
import { siteConfig } from "@/lib/site-config";

import { Header, Brand } from "./Header";
import { Footer } from "./Footer";
import { ContactSection } from "./ContactSection";
import { MediaCarousel } from "./MediaCarousel";
import { SelectedWorkCard } from "./SelectedWorkCard";
import { Art } from "./Art";
import { HeroVisual } from "./HeroVisual";

// Re-export for backward compatibility
export { Header, Brand, Footer, ContactSection, MediaCarousel, Art, SelectedWorkCard, HeroVisual };
export const ClientMediaCarousel = MediaCarousel;

export const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
};

// Card for /samples gallery page
export function Card({ sample }) {
  const mediaList =
    sample.media && sample.media.length > 0
      ? sample.media
      : sample.images && sample.images.length > 0
      ? sample.images
      : sample.thumbnail
      ? [{ url: sample.thumbnail, fileType: "image" }]
      : [];

  return (
    <div className="sample-card group relative block rounded-2xl border border-ink/10 bg-cream shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c99a55]/40 hover:shadow-xl">
      <div className="relative overflow-hidden rounded-t-2xl">
        <MediaCarousel media={mediaList} title={sample.title} />
      </div>

      <Link href={`/samples/${sample.slug}`} className="block p-5" aria-label={`View ${sample.title} details`}>
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
          {sample.description || "Ravion project"}
        </p>
      </Link>
    </div>
  );
}

export function Home() {
  const [samples, setSamples] = useState([]);
  const homeRef = useRef(null);

  useEffect(() => {
    api("/api/samples")
      .then(setSamples)
      .catch(() => setSamples([]));
  }, []);

  // Initialize cohesive, safe GSAP ScrollTrigger animations across all sections
  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion()) return;
    const el = homeRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. HERO SECTION ENHANCED ENTRANCE
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .fromTo(
          ".hero-badge",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, clearProps: "transform,opacity" }
        )
        .fromTo(
          ".hero-title",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, clearProps: "transform,opacity" },
          "-=0.35"
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" },
          "-=0.45"
        )
        .fromTo(
          ".hero-actions",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" },
          "-=0.45"
        )
        .fromTo(
          ".hero-trust",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: "transform,opacity" },
          "-=0.4"
        )
        .fromTo(
          ".hero-visual",
          { scale: 0.94, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.95, ease: "power2.out", clearProps: "opacity" },
          "-=0.6"
        );

      // 2. ABOUT SECTION SCROLL REVEAL
      gsap.fromTo(
        ".about-label",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#about",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".about-content",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#about",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".about-pillar-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // 3. SERVICES SECTION
      gsap.fromTo(
        ".services-label",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#services",
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".service-card-item",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#services",
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );

      // 4. WHY CHOOSE RAVION
      gsap.fromTo(
        ".why-card-item",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#why-us",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // 5. PROCESS SECTION
      gsap.fromTo(
        ".process-step-item",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#process",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // 6. SELECTED WORK SECTION STAGGERED REVEAL
      gsap.fromTo(
        ".work-header",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#work",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      if (el.querySelectorAll(".work-card-item").length > 0) {
        gsap.fromTo(
          ".work-card-item",
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: "#work",
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      ScrollTrigger.refresh();
    }, homeRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [samples]);

  return (
    <div ref={homeRef}>
      <Header />
      <main id="main-content">
        {/* HERO SECTION */}
        <section
          id="hero"
          className="hero-section relative mx-auto min-h-[640px] w-[min(1180px,calc(100%-32px))] scroll-mt-28 py-14 sm:py-20 lg:py-24"
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left side — Content */}
            <div className="lg:col-span-7">
              {/* Eyebrow label */}
              <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[#c99a55]/35 bg-[#c99a55]/10 px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-widest text-[#8b714e] uppercase">
                <Sparkles size={13} className="text-[#c99a55]" />
                <span>CREATIVE STUDIO • DIGITAL GROWTH</span>
              </div>

              {/* Bold, premium headline */}
              <h1 className="hero-title mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-[80px]">
                Your Vision.
                <br />
                <span className="text-[#c99a55] italic">Our Creativity.</span>
                <br />
                Digital Impact.
              </h1>

              {/* Supporting text */}
              <p className="hero-desc mt-6 max-w-xl text-base leading-relaxed text-[#082d2a]/80 sm:text-lg">
                We help ambitious businesses stand out through powerful websites, compelling product visuals, and creative digital experiences designed to make their brand unforgettable.
              </p>

              {/* Two prominent CTA buttons */}
              <div className="hero-actions mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("contact");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-[#082d2a] px-7 py-3.5 text-sm font-medium text-[#f5f0e8] shadow-lg shadow-[#082d2a]/20 transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Let&apos;s Work Together</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <Link
                  href="/samples"
                  className="group inline-flex items-center gap-2 rounded-full border border-[#082d2a]/25 bg-white/70 px-6 py-3.5 text-sm font-medium text-[#082d2a] backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55] hover:bg-white hover:text-[#c99a55] hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Explore Our Work</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              {/* Capability & Trust indicator */}
              <div className="hero-trust mt-10 border-t border-[#082d2a]/15 pt-6">
                <p className="font-mono text-[10px] font-semibold tracking-widest text-[#8b714e] uppercase">
                  CORE CAPABILITIES
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#082d2a]/75">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    Website Development
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    AI Product Photography
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    Social Media &amp; Design
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                    Video Production
                  </span>
                </div>
                <p className="mt-3 font-mono text-[11px] font-medium tracking-[0.2em] text-[#082d2a]/55 uppercase">
                  BUILD · CREATE · INNOVATE
                </p>
              </div>
            </div>

            {/* Right side — Hero Visual with Layered 3D Depth */}
            <div className="lg:col-span-5">
              <HeroVisual sample={samples[0]} />
            </div>
          </div>
        </section>

        {/* 01 / ABOUT SECTION */}
        <section
          id="about"
          className="mx-auto w-[min(1180px,calc(100%-32px))] scroll-mt-28 border-t border-[#082d2a]/15 py-24 sm:py-32"
        >
          <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
            <div>
              <p className="about-label flex items-center gap-2 font-mono text-xs tracking-widest text-[#836946] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                01 / ABOUT RAVION
              </p>
              <div className="mt-6 hidden lg:block">
                <p className="font-mono text-[11px] leading-relaxed text-[#082d2a]/60">
                  ESTABLISHED TO ELEVATE AMBITIOUS DIGITAL IDENTITIES
                </p>
                <div className="mt-4 h-px w-20 bg-[#c99a55]/40" />
              </div>
            </div>

            <div className="about-content space-y-12">
              <div className="max-w-3xl">
                <h2 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl text-[#082d2a]">
                  We make brands feel{" "}
                  <em className="text-[#c99a55] italic">impossible to ignore.</em>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-[#082d2a]/80 sm:text-xl">
                  RAVION is an integrated digital craft studio dedicated to helping ambitious businesses, forward-thinking founders, and modern brands build an elevated digital presence.
                </p>
                <p className="mt-4 text-base leading-relaxed text-[#082d2a]/70">
                  We unite bespoke web development, commercial-grade AI product photography, and high-impact digital content into one cohesive ecosystem. Every line of code, rendered reflection, and design asset is built with intention — engineered to earn credibility and turn visitors into loyal clients.
                </p>
              </div>

              {/* 3 Core Studio Pillars */}
              <div className="grid gap-6 sm:grid-cols-3 pt-4">
                <div className="about-pillar-card group rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/50 hover:bg-white hover:shadow-md hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99a55]/15 text-[#8b714e]">
                    <Palette size={20} />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#082d2a]">
                    Bespoke Craft
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                    Zero generic templates. Every visual system and website is custom-tailored to your exact business positioning and commercial objectives.
                  </p>
                </div>

                <div className="about-pillar-card group rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/50 hover:bg-white hover:shadow-md hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/10 text-[#082d2a]">
                    <Code2 size={20} />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#082d2a]">
                    Modern Engineering
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                    Engineered with Next.js App Router, clean semantic architecture, fluid motion, and responsive performance tested on all screen sizes.
                  </p>
                </div>

                <div className="about-pillar-card group rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/50 hover:bg-white hover:shadow-md hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99a55]/15 text-[#8b714e]">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#082d2a]">
                    Commercial Impact
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                    Design backed by purpose. We craft experiences and visuals that capture customer attention, build confidence, and generate inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 / SERVICES SECTION */}
        <section id="services" className="scroll-mt-28 bg-[#062623] py-24 sm:py-32 text-[#f5f0e8]">
          <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="services-label flex items-center gap-2 font-mono text-xs tracking-widest text-[#d1aa6b] uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d1aa6b]" />
                  02 / WHAT WE DO
                </p>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-white">
                  Specialized services built for{" "}
                  <em className="text-[#d1aa6b] italic">real brand impact.</em>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                End-to-end creative and technical solutions designed to make your business stand out, engage audiences, and scale with clarity.
              </p>
            </div>

            {/* 6 Studio Services Grid */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Service 01: Website Development */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">01</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <Code2 size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    Website Development
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Bespoke Next.js websites, high-converting landing pages, and responsive web applications engineered for speed, clean SEO, and fluid motion.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Next.js App Router", "Fluid Motion", "SEO & Speed", "Mobile First"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss website project</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>

              {/* Service 02: AI Product Photography */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">02</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <Camera size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    AI Product Photography
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Commercial-grade 8K product imagery with photorealistic reflections, studio lighting, and tailored environments that make e-commerce products stand out.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Photorealistic 8K", "Studio Lighting", "Packshots", "Lifestyle Context"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss product visuals</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>

              {/* Service 03: Social Media Content */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">03</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <Layers size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    Social Media Content
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Strategic visual content, promotional reels, and multi-slide carousels engineered to captivate audiences and increase brand engagement across digital channels.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Brand Carousels", "Reel Graphics", "Campaign Creatives", "Story Systems"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss social content</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>

              {/* Service 04: Graphic Design & Direction */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">04</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <Palette size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    Graphic Design &amp; Direction
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Comprehensive visual identity systems, marketing collateral, promotional banners, and bespoke typography that establish a unified, unforgettable market presence.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Visual Identity", "Digital Banners", "Typography", "Marketing Collateral"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss graphic design</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>

              {/* Service 05: Video Production */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">05</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <Film size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    Video Production
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Dynamic short-form product videos, promotional showcase edits, kinetic typography, and motion assets designed for digital campaigns and social media.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Product Motion", "Short-Form Edits", "Kinetic Typography", "Audio Sync"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss video project</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>

              {/* Service 06: Digital Experience Strategy */}
              <article className="service-card-item group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-[#c99a55]/60 hover:bg-white/[0.08] hover:-translate-y-1.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#d1aa6b]">06</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#d1aa6b] transition-transform group-hover:scale-110">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-white transition-colors group-hover:text-[#d1aa6b]">
                    Digital Growth &amp; Strategy
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Integrated digital consultation, link-in-bio hub optimization, and creative direction to help your business build an interconnected digital ecosystem.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Link-in-Bio Setup", "Brand Structure", "Conversion Flow", "Strategic Direction"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-1.5 font-mono text-xs text-[#d1aa6b] transition-colors hover:text-white"
                  >
                    <span>Discuss digital strategy</span>
                    <ArrowRight size={13} className="transition-transform group-hover/cta:translate-x-1" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 03 / WHY CHOOSE RAVION */}
        <section id="why-us" className="scroll-mt-28 border-t border-[#082d2a]/15 bg-[#f5f0e8] py-24 sm:py-32 text-[#082d2a]">
          <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
            <div className="max-w-2xl">
              <p className="why-label flex items-center gap-2 font-mono text-xs tracking-widest text-[#836946] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                03 / WHY RAVION
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-[#082d2a]">
                Thoughtful design. Technical precision.{" "}
                <em className="text-[#c99a55] italic">Real business impact.</em>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#082d2a]/75 sm:text-lg">
                We combine creative visual excellence with engineering rigor to deliver practical digital solutions that help modern businesses thrive.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="why-card-item rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/10 text-[#082d2a]">
                  <Compass size={20} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-[#082d2a]">
                  Direct Collaboration
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                  Work directly with the creative and technical lead. No account managers or communication silos — just fast, clear feedback and agility.
                </p>
              </div>

              <div className="why-card-item rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99a55]/15 text-[#8b714e]">
                  <Zap size={20} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-[#082d2a]">
                  Modern Engineering
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                  Built on modern Next.js foundations. Fast load times, responsive ergonomics, and smooth transitions tested for optimum user engagement.
                </p>
              </div>

              <div className="why-card-item rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/10 text-[#082d2a]">
                  <Layers size={20} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-[#082d2a]">
                  Unified Brand Aesthetic
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                  From websites to commercial product visuals and social media assets, every piece aligns into one unmistakable, premium identity.
                </p>
              </div>

              <div className="why-card-item rounded-2xl border border-[#082d2a]/12 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99a55]/15 text-[#8b714e]">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-[#082d2a]">
                  Transparent Terms
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                  Clear terms: 50% advance project reservation, clear revision allowances, defined timelines, and complete honesty at every stage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 04 / OUR PROCESS SECTION */}
        <section id="process" className="scroll-mt-28 border-t border-[#082d2a]/15 bg-[#efe8dc] py-24 sm:py-32 text-[#082d2a]">
          <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
            <div className="max-w-2xl">
              <p className="process-label flex items-center gap-2 font-mono text-xs tracking-widest text-[#836946] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
                04 / OUR PROCESS
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-[#082d2a]">
                A transparent, 5-step journey from{" "}
                <em className="text-[#c99a55] italic">concept to launch.</em>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#082d2a]/75 sm:text-lg">
                Structured milestones, clear communication, and defined delivery ensure every project is completed smoothly and on schedule.
              </p>
            </div>

            {/* 5-Step Process Timeline Grid */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  step: "01",
                  title: "Discovery & Scope",
                  desc: "We discuss your project requirements, creative references, and brand assets to define a crystal-clear scope and quotation.",
                },
                {
                  step: "02",
                  title: "Agreement & 50% Advance",
                  desc: "Milestones are locked, and a 50% advance payment reserves your dedicated production slot in our schedule.",
                },
                {
                  step: "03",
                  title: "Design & Build",
                  desc: "We build your website, generate high-resolution visuals, or produce your content with meticulous attention to detail.",
                },
                {
                  step: "04",
                  title: "Preview & Revisions",
                  desc: "We share draft previews for your review, applying reasonable revisions included with your package to perfect the work.",
                },
                {
                  step: "05",
                  title: "50% Balance & Launch",
                  desc: "Upon final balance payment, clean production files, high-res assets, or live website deployments are handed over.",
                },
              ].map((p, idx) => (
                <div
                  key={p.step}
                  className="process-step-item group relative flex flex-col justify-between rounded-2xl border border-[#082d2a]/15 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/50 hover:bg-white hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-widest text-[#8b714e]">
                        {p.step}
                      </span>
                      <span className="font-mono text-[10px] text-[#082d2a]/50">
                        Phase {idx + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-semibold text-[#082d2a]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
                      {p.desc}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-[#082d2a]/10 pt-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#8b714e]">
                      <CheckCircle2 size={12} className="text-[#c99a55]" />
                      Milestone Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 05 / SELECTED WORK SECTION */}
        <section id="work" className="mx-auto w-[min(1180px,calc(100%-32px))] scroll-mt-28 py-24 sm:py-32">
          <div className="work-header mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs tracking-widest text-[#836946] uppercase">
                05 / SELECTED WORK
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-[#082d2a]">
                Made to make a <em className="text-[#c99a55] italic">mark.</em>
              </h2>
              <p className="mt-3 max-w-lg text-base text-[#082d2a]/70">
                A selection of recent projects spanning bespoke websites, commercial product imagery, and creative digital assets.
              </p>
            </div>
            <Link
              href="/samples"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-[#082d2a]/20 bg-white/70 px-5 py-2.5 text-xs font-medium text-[#082d2a] shadow-sm transition-all duration-300 hover:border-[#c99a55] hover:bg-[#082d2a] hover:text-[#f5f0e8] hover:-translate-y-0.5 active:scale-95"
            >
              <span>Explore all projects</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {samples.slice(0, 6).map((s) => (
              <div className="work-card-item" key={s._id || s.slug}>
                <SelectedWorkCard sample={s} />
              </div>
            ))}
          </div>

          {!samples.length && (
            <div className="mt-8 rounded-2xl border border-dashed border-[#082d2a]/20 bg-white/40 p-12 text-center">
              <Sparkles size={24} className="mx-auto text-[#c99a55]" />
              <h3 className="mt-3 font-serif text-xl font-medium text-[#082d2a]">
                Portfolio Projects Loading
              </h3>
              <p className="mt-2 text-xs text-[#082d2a]/60">
                Published projects from the studio database will appear here automatically.
              </p>
              <Link
                href="/samples"
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-[#c99a55] hover:underline"
              >
                <span>Browse Full Gallery</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
        </section>
      </main>

      <ContactSection />
      <Footer />
    </div>
  );
}

export function Samples() {
  const [samples, setSamples] = useState([]);
  const [categoriesList, setCategoriesList] = useState(["All"]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const samplesRef = useRef(null);

  useEffect(() => {
    // Dynamic categories from admin side
    api("/api/categories")
      .then((data) => {
        const catNames = (data.categories || []).map((c) => c.name);
        if (catNames.length > 0) {
          setCategoriesList(["All", ...catNames]);
        }
      })
      .catch(() => {});

    api("/api/samples")
      .then(setSamples)
      .catch(() => setSamples([]));
  }, []);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion()) return;
    const el = samplesRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".samples-header",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );

      if (el.querySelectorAll(".samples-grid-item").length > 0) {
        gsap.fromTo(
          ".samples-grid-item",
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.75,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }
    }, samplesRef);

    return () => ctx.revert();
  }, [filter, samples, searchQuery]);

  // Combined Category Filter & Keyword Search
  const filteredList = samples.filter((s) => {
    const matchesCategory = filter === "All" || s.category === filter;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = s.title?.toLowerCase().includes(query);
    const descMatch = s.description?.toLowerCase().includes(query);
    const catMatch = s.category?.toLowerCase().includes(query);

    return titleMatch || descMatch || catMatch;
  });

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <>
      <Header />
      <main
        ref={samplesRef}
        id="main-content"
        className="mx-auto w-[min(1180px,calc(100%-32px))] py-22"
      >
        {/* Back Button matching Ravion aesthetic */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="group inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-[#836946] transition-all hover:text-ink cursor-pointer"
            aria-label="Go back to previous page"
          >
            <ChevronLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>Back</span>
          </button>
        </div>

        <div className="samples-header">
          <p className="font-mono text-xs tracking-widest text-[#836946]">
            RAVION / PORTFOLIO
          </p>
          <h1 className="mt-5 font-serif text-6xl md:text-8xl">
            Work with a <em className="text-gold">pulse.</em>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink/70">
            Explore our curated showcase of digital experiences, visual worlds, and brand systems.
          </p>
        </div>

        {/* Search Bar & Category Filters Toolbar */}
        <div className="my-10 space-y-6">
          {/* Frontend Keyword Search Bar */}
          <div className="relative max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by keyword, service, or topic…"
              className="w-full rounded-full border border-ink/20 bg-white/70 py-2.5 pl-10 pr-10 text-xs text-ink placeholder:text-ink/40 transition-all focus:border-[#c99a55] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
              aria-label="Search portfolio projects"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink"
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((c) => (
              <button
                onClick={() => setFilter(c)}
                className={`rounded-full border border-ink/20 px-4 py-2 text-xs md:text-sm transition-all duration-300 hover:border-ink cursor-pointer ${
                  filter === c ? "bg-ink text-white" : "hover:bg-ink/5 text-ink"
                }`}
                key={c}
                aria-pressed={filter === c}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredList.length > 0 ? (
          <div className="grid gap-x-5 gap-y-9 md:grid-cols-3">
            {filteredList.map((s) => (
              <div className="samples-grid-item" key={s._id || s.slug}>
                <Card sample={s} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/20 p-12 text-center">
            <p className="font-serif text-2xl text-ink">No projects found</p>
            <p className="mt-2 text-xs text-ink/60">
              {searchQuery
                ? `No results matching "${searchQuery}" in ${filter === "All" ? "any category" : filter}.`
                : "No published work in this category yet."}
            </p>
            {(searchQuery || filter !== "All") && (
              <button
                onClick={() => {
                  setFilter("All");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-ink px-4 py-2 text-xs text-white transition-all hover:bg-[#c18e4d]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export function Detail({ slug }) {
  const [sample, setSample] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    api(`/api/samples/${slug}`)
      .then(setSample)
      .catch(() => setSample(false));
  }, [slug]);

  useEffect(() => {
    if (!sample || !defaultAnimationConfig.animationEnabled || isReducedMotion())
      return;
    const el = detailRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".detail-hero",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );

      gsap.fromTo(
        ".detail-art-box",
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.85,
          delay: 0.1,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );
    }, detailRef);

    return () => ctx.revert();
  }, [sample]);

  if (sample === null)
    return (
      <>
        <Header />
        <main id="main-content" className="mx-auto w-[min(1180px,calc(100%-32px))] py-28">
          <p className="font-mono text-sm text-ink/60">Loading project…</p>
        </main>
      </>
    );

  if (!sample)
    return (
      <>
        <Header />
        <main id="main-content" className="mx-auto w-[min(1180px,calc(100%-32px))] py-28">
          <h1 className="font-serif text-6xl">Project not found.</h1>
          <Link
            href="/samples"
            className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-[#836946]"
          >
            <ChevronLeft size={16} /> Back to all projects
          </Link>
        </main>
      </>
    );

  return (
    <div ref={detailRef}>
      <Header />
      <main id="main-content" className="mx-auto w-[min(1180px,calc(100%-32px))] py-16">
        <Link
          href="/samples"
          className="group inline-flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-gold"
          aria-label="Back to all projects"
        >
          <ChevronLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>All work</span>
        </Link>
        <div className="detail-hero my-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#836946]">
              {sample.category}
            </p>
            <h1 className="mt-3 font-serif text-6xl md:text-8xl">
              {sample.title}
            </h1>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-ink/70">
            {sample.description}
          </p>
        </div>
        <div className="detail-art-box">
          <Art sample={sample} />
        </div>
        <div className="mx-auto my-18 grid max-w-2xl gap-5 md:grid-cols-[160px_1fr]">
          <span className="font-mono text-xs text-[#836946]">THE BRIEF</span>
          <p className="font-serif text-3xl">
            {sample.description || "A considered project made with intent."}
          </p>
        </div>
        <div className="my-14 text-center">
          <a
            href="/#contact"
            className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#c18e4d]"
          >
            <span>Start a project like this</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </main>
      <ContactSection />
      <Footer />
    </div>
  );
}

export default Home;
