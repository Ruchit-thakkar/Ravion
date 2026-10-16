"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";
import { gsap, ScrollTrigger, isReducedMotion } from "@/lib/animations/gsap";
import { defaultAnimationConfig } from "@/lib/animations/config";
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

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Website Development",
    message: "",
    hp: "", // Honeypot field for bot protection
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const sectionRef = useRef(null);

  // Dynamic settings from Phase 3 with siteConfig as default fallback
  const [contactData, setContactData] = useState({
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    phoneRaw: siteConfig.contact.phoneRaw,
    whatsappUrl: siteConfig.contact.whatsappUrl,
    instagram: siteConfig.contact.instagram,
    instagramUrl: siteConfig.contact.instagramUrl,
    turnaroundNote:
      "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res?.settings?.contact) {
          setContactData((prev) => ({
            ...prev,
            ...res.settings.contact,
            turnaroundNote: res.settings.footer?.turnaroundNote || prev.turnaroundNote,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion()) return;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-left",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".contact-form",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const send = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validations
    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const rawDigits = formData.phone.replace(/[^0-9]/g, "");
    if (!formData.phone.trim() || rawDigits.length < 7) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.service) {
      setError("Please select a service.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter your project message.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess("Thank you — your inquiry has been received! We will respond within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "Website Development",
        message: "",
        hp: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit inquiry. Please reach out via WhatsApp or email directly.");
    } finally {
      setBusy(false);
    }
  };

  const contactServices = [
    "Website Development",
    "AI Product Photography",
    "Social Media Content",
    "Graphic Design & Direction",
    "Video Production",
    "Digital Experience Strategy",
    "Other Creative Project",
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="mx-auto grid w-[min(1180px,calc(100%-32px))] scroll-mt-28 gap-12 py-24 sm:py-32 md:grid-cols-2"
    >
      {/* Left Column — Context & Direct Channels */}
      <div className="contact-left space-y-8">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-[#836946] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a55]" />
            06 / LET&apos;S TALK
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-[#082d2a]">
            Let&apos;s make the{" "}
            <em className="text-[#c99a55] italic">next thing matter.</em>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#082d2a]/75 sm:text-lg">
            Start with a project goal, a brand vision, or a rough sketch. We bring structure, technical precision, and an unmistakable creative direction.
          </p>
        </div>

        {/* Direct Verified Contact Channels */}
        <div className="space-y-3 pt-2">
          <p className="font-mono text-[11px] font-semibold tracking-wider text-[#8b714e] uppercase">
            Direct Contact Channels
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <a
              href={contactData.whatsappUrl || siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-[#082d2a]/12 bg-white/70 p-3.5 shadow-sm transition-all hover:border-emerald-600/40 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 transition-transform group-hover:scale-110">
                <MessageCircle size={18} />
              </div>
              <div className="text-xs">
                <span className="block font-medium text-[#082d2a]">WhatsApp Direct</span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">+{String(contactData.phoneRaw || siteConfig.contact.phoneRaw).replace(/[^0-9]/g, "")}</span>
              </div>
            </a>

            <a
              href={`mailto:${contactData.email || siteConfig.contact.email}`}
              className="group flex items-center gap-3 rounded-xl border border-[#082d2a]/12 bg-white/70 p-3.5 shadow-sm transition-all hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a55]/15 text-[#8b714e] transition-transform group-hover:scale-110">
                <Mail size={18} />
              </div>
              <div className="text-xs">
                <span className="block font-medium text-[#082d2a]">Email Us</span>
                <span className="truncate block font-mono text-[11px] text-[#082d2a]/60">{contactData.email || siteConfig.contact.email}</span>
              </div>
            </a>

            <a
              href={`tel:${contactData.phoneRaw || siteConfig.contact.phoneRaw}`}
              className="group flex items-center gap-3 rounded-xl border border-[#082d2a]/12 bg-white/70 p-3.5 shadow-sm transition-all hover:border-[#c99a55]/40 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#082d2a]/10 text-[#082d2a] transition-transform group-hover:scale-110">
                <Phone size={18} />
              </div>
              <div className="text-xs">
                <span className="block font-medium text-[#082d2a]">Direct Call</span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">{contactData.phone || siteConfig.contact.phone}</span>
              </div>
            </a>

            <a
              href={contactData.instagramUrl || siteConfig.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-[#082d2a]/12 bg-white/70 p-3.5 shadow-sm transition-all hover:border-pink-500/40 hover:bg-white hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-700 transition-transform group-hover:scale-110">
                <InstagramIcon size={18} />
              </div>
              <div className="text-xs">
                <span className="block font-medium text-[#082d2a]">Instagram</span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">{contactData.instagram || siteConfig.contact.instagram}</span>
              </div>
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-4 text-xs leading-relaxed text-[#082d2a]/80">
          <p className="flex items-center gap-1.5 font-semibold text-[#8b714e]">
            <Sparkles size={14} className="text-[#c99a55]" />
            Project Turnaround Commitment
          </p>
          <p className="mt-1">
            {contactData.turnaroundNote || "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work."}
          </p>
        </div>
      </div>

      {/* Right Column — Inquiry Form */}
      <div className="contact-form rounded-2xl border border-[#082d2a]/15 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <h3 className="font-serif text-2xl font-semibold text-[#082d2a]">
          Start a Project Inquiry
        </h3>
        <p className="mt-1 text-xs text-[#082d2a]/70">
          Tell us about your brand, what you need, and your target timeline.
        </p>

        <form onSubmit={send} className="mt-6 space-y-4">
          {/* Honeypot field for bot protection */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="contact-hp">Website</label>
            <input
              id="contact-hp"
              name="hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={formData.hp}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-[#082d2a]/80">
              Your Name *
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ruchit Thakkar"
                disabled={busy}
                required
                suppressHydrationWarning
                className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
              />
            </label>

            <label className="block text-xs font-medium text-[#082d2a]/80">
              Email Address *
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@brand.com"
                disabled={busy}
                required
                suppressHydrationWarning
                className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-[#082d2a]/80">
              Phone / WhatsApp Number *
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 79907 74831"
                disabled={busy}
                required
                suppressHydrationWarning
                className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
              />
            </label>

            <label className="block text-xs font-medium text-[#082d2a]/80">
              Service Needed *
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                disabled={busy}
                className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
              >
                {contactServices.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-medium text-[#082d2a]/80">
            Project Description &amp; Requirements *
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your brand, what deliverables you need, and any inspirations or target deadlines…"
              disabled={busy}
              required
              className="mt-1.5 w-full resize-y rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={busy}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#082d2a] px-8 py-3.5 text-sm font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{busy ? "Submitting Inquiry…" : "Submit Inquiry"}</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactSection;
