"use client";

import Link from "next/link";
import { ArrowUpRight, Camera, Code2, Sparkles, Terminal } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function HeroVisual({ sample }) {
  // If a live sample is available, extract thumbnail or title
  const sampleTitle = sample?.title || "Bespoke Digital Design";
  const sampleCategory = sample?.category || "Website & Creative";
  const sampleSlug = sample?.slug;
  const sampleThumb =
    sample?.thumbnail ||
    (sample?.images && sample?.images[0]?.url) ||
    (sample?.media && sample?.media[0]?.url);

  return (
    <div className="hero-visual relative mx-auto w-full max-w-[500px] lg:max-w-none">
      {/* Background Ambient Glow & Orbital Ring */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(201, 154, 85, 0.28) 0%, rgba(8, 45, 42, 0.15) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl border border-[#c99a55]/15"
        aria-hidden="true"
      />

      {/* Main Centerpiece Card — Web Architecture & Digital Experience */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-[#c99a55]/30 bg-gradient-to-br from-[#062623] via-[#082d2a] to-[#041a18] p-5 sm:p-6 text-[#f5f0e8] shadow-2xl shadow-[#082d2a]/30 transition-transform duration-500 hover:border-[#c99a55]/50">
        {/* Card Header Chrome */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#c99a55]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600/70" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-[#f5f0e8]/80">
            <span className="text-[#c99a55]">https://</span>
            <span>ravion.ai</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Card Body */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold tracking-widest text-[#d1aa6b] uppercase">
              Digital Architecture
            </span>
            <span className="font-mono text-[11px] text-white/50">Next.js • GSAP</span>
          </div>

          <h3 className="font-serif text-2xl font-medium sm:text-3xl text-white">
            High-Performance <em className="text-[#d1aa6b] not-italic">Websites</em> &amp; Visuals
          </h3>

          <p className="text-xs leading-relaxed text-[#f5f0e8]/75">
            Custom engineered websites, seamless motion, and conversion-focused architectures built to elevate ambitious brands.
          </p>

          {/* Technical Capability Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
              <span className="block font-semibold text-[#d1aa6b]">99.8%</span>
              <span className="text-white/60">Speed Score</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
              <span className="block font-semibold text-emerald-300">Fluid</span>
              <span className="text-white/60">GSAP Motion</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
              <span className="block font-semibold text-white">Bespoke</span>
              <span className="text-white/60">Identity</span>
            </div>
          </div>

          {/* Micro Preview Viewport */}
          <div className="relative mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#031513]/70 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Code2 size={13} className="text-[#d1aa6b]" />
                <span className="font-mono text-[11px] text-white/80">
                  {sampleSlug ? sampleTitle : "Ravion Digital Studio"}
                </span>
              </div>
              <Link
                href="/samples"
                className="group/link inline-flex items-center gap-1 font-mono text-[10px] text-[#d1aa6b] transition-colors hover:text-white"
              >
                <span>View Portfolio</span>
                <ArrowUpRight
                  size={12}
                  className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping Floating Card 1: AI Product Photography & Cinematic Visuals (Bottom-Left) */}
      <div className="animate-float-gentle relative z-20 -mt-8 -ml-3 sm:-ml-6 max-w-[280px] sm:max-w-[310px] rounded-2xl border border-[#c99a55]/40 bg-[#fdfbf7] p-4 text-[#082d2a] shadow-2xl shadow-black/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c99a55]/40 bg-[#c99a55]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#8b714e]">
            <Sparkles size={11} className="text-[#c99a55]" />
            <span>AI PRODUCT VISUALS</span>
          </div>
          <Camera size={13} className="text-[#8b714e]" />
        </div>

        <h4 className="mt-2.5 font-serif text-lg font-semibold text-[#082d2a]">
          Photorealistic Studio Imagery
        </h4>

        <p className="mt-1 text-[11px] leading-relaxed text-[#082d2a]/70">
          Studio lighting, realistic reflections, and commercial-grade product visuals tailored for e-commerce.
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-[#082d2a]/10 pt-2 text-[10px] font-mono text-[#8b714e]">
          <span>E-Commerce Ready</span>
          <span className="text-[#c99a55] font-semibold">8K Resolution</span>
        </div>
      </div>

      {/* Overlapping Floating Card 2: Brand Strategy & Creative Direction (Top-Right) */}
      <div className="animate-float-reverse absolute -top-5 -right-3 sm:-right-6 z-20 hidden sm:block max-w-[240px] rounded-xl border border-[#c99a55]/40 bg-[#051f1c]/95 p-3.5 text-[#f5f0e8] shadow-2xl shadow-black/30 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
          <span className="font-mono text-[9px] font-semibold tracking-wider text-[#d1aa6b] uppercase">
            CREATIVE DIRECTION
          </span>
        </div>

        <p className="mt-1.5 text-xs font-medium text-white">
          BUILD · CREATE · INNOVATE
        </p>

        <p className="mt-1 font-mono text-[10px] text-white/60">
          100% Bespoke Craft
        </p>
      </div>

      {/* If live sample exists, show mini live pill */}
      {sampleSlug && (
        <div className="mt-3 text-right">
          <Link
            href={`/samples/${sampleSlug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white/70 px-3 py-1 font-mono text-[10px] text-[#082d2a] shadow-sm backdrop-blur-sm transition-colors hover:border-[#c99a55] hover:text-[#c99a55]"
          >
            <span className="text-[#8b714e]">Featured Sample:</span>
            <span className="font-semibold">{sampleTitle}</span>
            <ArrowUpRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default HeroVisual;
