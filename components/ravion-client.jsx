"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Sparkles,
  X,
  Film,
} from "lucide-react";
import { gsap, ScrollTrigger, isReducedMotion } from "@/lib/animations/gsap";
import { defaultAnimationConfig } from "@/lib/animations/config";

const logo = "/assets/ravion-logo.png";
const categories = [
  "All",
  "Web Services",
  "AI Product Photography",
  "Social Media",
  "Photoshop / Design",
  "Video",
];

export const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
};

function Brand({ light = false }) {
  return (
    <Link href="/" className="block w-32 transition-transform duration-300 hover:opacity-90">
      <img
        className={light ? "brightness-0 invert" : "logo-img"}
        src={logo}
        alt="Ravion"
      />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20">
      <nav className="mx-auto flex h-21 w-[min(1180px,calc(100%-32px))] items-center justify-between border-b border-ink/15">
        <Brand />
        <button
          onClick={() => setOpen(!open)}
          className="p-2 transition-transform active:scale-95 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute top-21 left-0 right-0 flex-col gap-5 bg-cream p-6 shadow-lg md:static md:flex md:flex-row md:items-center md:bg-transparent md:p-0 md:shadow-none`}
        >
          <a
            href="/#about"
            className="text-ink/75 transition-colors hover:text-ink hover:text-gold"
          >
            About
          </a>
          <a
            href="/#services"
            className="text-ink/75 transition-colors hover:text-ink hover:text-gold"
          >
            Services
          </a>
          <a
            href="/#work"
            className="text-ink/75 transition-colors hover:text-ink hover:text-gold"
          >
            Work
          </a>
          <a
            href="/#contact"
            className="text-ink/75 transition-colors hover:text-ink hover:text-gold"
          >
            Contact
          </a>
          <Link
            href="/samples"
            className="group inline-flex items-center gap-2 bg-ink px-4 py-3 text-sm text-white transition-all duration-300 hover:bg-[#c18e4d] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Explore work</span>
            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function Art({ sample = {} }) {
  const mediaList =
    sample.media && sample.media.length > 0
      ? sample.media
      : sample.images && sample.images.length > 0
      ? sample.images
      : sample.thumbnail
      ? [{ url: sample.thumbnail, fileType: "image" }]
      : [];

  if (mediaList.length > 0) {
    return (
      <div className="overflow-hidden rounded-2xl shadow-xl">
        <ClientMediaCarousel media={mediaList} title={sample.title} />
      </div>
    );
  }

  return (
    <div className="sample-art relative isolate h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-[#c99a55] to-[#103733]">
      <span className="absolute left-5 top-2 text-6xl font-serif text-white/65">
        R
      </span>
      <div className="sample-shape absolute left-1/2 top-20 -translate-x-1/2 -rotate-12" />
    </div>
  );
}

export function ClientMediaCarousel({ media = [], title = "" }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const items =
    Array.isArray(media) && media.length > 0
      ? media
      : [{ url: "/assets/sample-1.jpg", fileType: "image" }];

  // Auto-slides every 3.5 seconds when not hovered/touched
  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prev) => (prev + 1) % items.length);
  };

  const handleTouchStart = (e) => {
    setIsHovered(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left -> next
      setIndex((prev) => (prev + 1) % items.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setIndex((prev) => (prev - 1 + items.length) % items.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const currentItem = items[index] || items[0];
  const isVideo =
    currentItem?.fileType === "video" ||
    (typeof currentItem?.url === "string" &&
      (currentItem.url.endsWith(".mp4") ||
        currentItem.url.endsWith(".mkv") ||
        currentItem.url.endsWith(".webm") ||
        currentItem.url.endsWith(".mov")));

  return (
    <div
      className="relative aspect-[16/11] w-full overflow-hidden bg-[#082d2a]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isVideo ? (
        <video
          key={currentItem.url}
          src={currentItem.url}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          key={currentItem.url}
          src={currentItem.url}
          alt={title || "Portfolio sample"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Video Indicator */}
      {isVideo && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-sm">
          <Film size={12} className="text-[#d1aa6b]" />
          <span>Video</span>
        </span>
      )}

      {/* Desktop < > Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95 group-hover:flex"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95 group-hover:flex"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1">
            {items.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1 rounded-full transition-all ${
                  index === dotIdx ? "w-4 bg-[#c99a55]" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// SELECTED WORK Card on Home Page:
// - Multi-media carousel with desktop < > controls, mobile swipe & auto-sliding
// - On hover (and always on mobile): shows 4 Call to Action icons (Contact, Call, WhatsApp, Email)
// - Displays category and short description
// - Clicking card navigates to /samples
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
    router.push("/samples");
  };

  return (
    <div
      onClick={handleCardClick}
      className="sample-card group relative block cursor-pointer overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c99a55]/40 hover:shadow-xl"
    >
      {/* Media carousel */}
      <div className="relative overflow-hidden">
        <ClientMediaCarousel media={mediaList} title={sample.title} />

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
            href="tel:+917990774831"
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-[#f5f0e8] shadow-md backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-110 active:scale-95"
            title="Direct Call (+91 79907 74831)"
            aria-label="Call Ravion"
          >
            <Phone size={14} />
          </a>

          {/* 3. WhatsApp */}
          <a
            href="https://wa.me/917990774831"
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
            href="mailto:ruchitthakkar12@gmail.com"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = "mailto:ruchitthakkar12@gmail.com";
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#031513]/90 text-[#f5f0e8] shadow-md backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-110 active:scale-95"
            title="Email us (ruchitthakkar12@gmail.com)"
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
            Click to view all work
          </span>
          <span className="font-mono text-xs font-semibold text-gold">
            Explore →
          </span>
        </div>
      </div>
    </div>
  );
}

// Card for /samples page
function Card({ sample }) {
  const mediaList =
    sample.media && sample.media.length > 0
      ? sample.media
      : sample.images && sample.images.length > 0
      ? sample.images
      : sample.thumbnail
      ? [{ url: sample.thumbnail, fileType: "image" }]
      : [];

  return (
    <Link
      href={`/samples/${sample.slug}`}
      className="sample-card group block overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c99a55]/40 hover:shadow-xl"
    >
      <ClientMediaCarousel media={mediaList} title={sample.title} />
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
          {sample.description || "Ravion project"}
        </p>
      </div>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="bg-[#062623] text-cream">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <div className="flex min-h-80 flex-col justify-end gap-8 border-b border-white/20 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Brand light />
            <h2 className="mt-10 font-serif text-5xl leading-none md:text-6xl">
              Build. Create.
              <br />
              <em className="text-[#d5ad6d]">Innovate.</em>
            </h2>
          </div>
          <a
            className="group inline-flex w-fit items-center gap-2 bg-[#d5ad6d] px-5 py-3 text-ink transition-all duration-300 hover:bg-white hover:-translate-y-0.5 active:scale-95"
            href="#contact"
          >
            <span>Start a project</span>
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
        <div className="flex flex-col gap-4 py-6 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Ravion. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://ravion-terms-policies.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#d5ad6d]"
            >
              Terms & Conditions
            </a>
            <a
              href="https://www.instagram.com/ravion.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#d5ad6d]"
            >
              @ravion.ai
            </a>
            <a
              href="tel:+917990774831"
              className="transition-colors hover:text-[#d5ad6d]"
            >
              +91 79907 74831
            </a>
            <a
              href="mailto:ruchitthakkar12@gmail.com"
              onClick={() => {
                window.location.href = "mailto:ruchitthakkar12@gmail.com";
              }}
              className="transition-colors hover:text-[#d5ad6d]"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Web Services",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const sectionRef = useRef(null);

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
      setError("Please enter your message.");
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

      setSuccess("Inquiry sent successfully.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "Web Services",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 py-28 md:grid-cols-2"
    >
      <div className="contact-left">
        <p className="font-mono text-xs tracking-widest text-[#836946]">
          05 / LET&apos;S TALK
        </p>
        <h2 className="mt-5 font-serif text-5xl leading-none md:text-6xl">
          Let&apos;s make the
          <br />
          <em className="text-gold">next thing matter.</em>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
          Start with a thought, a challenge or a rough sketch. We will bring
          structure, energy and a point of view.
        </p>
        <div className="mt-8 grid gap-3 text-sm">
          <a
            className="group flex items-center gap-2 text-ink/85 transition-colors hover:text-gold"
            href="tel:+917990774831"
          >
            <Phone size={17} className="transition-transform group-hover:scale-110" />
            <span>Call +91 79907 74831</span>
          </a>
          <a
            className="group flex items-center gap-2 text-ink/85 transition-colors hover:text-gold"
            href="https://wa.me/917990774831"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} className="transition-transform group-hover:scale-110" />
            <span>WhatsApp +91 79907 74831</span>
          </a>
          <a
            className="group flex items-center gap-2 text-ink/85 transition-colors hover:text-gold"
            href="mailto:ruchitthakkar12@gmail.com"
            onClick={() => {
              window.location.href = "mailto:ruchitthakkar12@gmail.com";
            }}
          >
            <Mail size={17} className="transition-transform group-hover:scale-110" />
            <span>ruchitthakkar12@gmail.com</span>
          </a>
        </div>
      </div>

      <form onSubmit={send} className="contact-form grid gap-5">
        <label className="grid gap-2 text-xs tracking-wide">
          Full Name
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            disabled={busy}
            className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
          />
        </label>

        <label className="grid gap-2 text-xs tracking-wide">
          Email
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            disabled={busy}
            className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
          />
        </label>

        <label className="grid gap-2 text-xs tracking-wide">
          Phone Number
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            disabled={busy}
            className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
          />
        </label>

        <label className="grid gap-2 text-xs tracking-wide">
          Service
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            disabled={busy}
            className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
          >
            <option value="Web Services">Web Services</option>
            <option value="Link-in-Bio">Link-in-Bio</option>
            <option value="AI Product Photography">AI Product Photography</option>
            <option value="Social Media Content">Social Media Content</option>
            <option value="Photoshop / Design">Photoshop / Design</option>
            <option value="Video">Video</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="grid gap-2 text-xs tracking-wide">
          Message
          <textarea
            name="message"
            rows="3"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your project, goals and timeline…"
            disabled={busy}
            className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink resize-y"
          />
        </label>

        {error && (
          <p className="text-xs font-mono text-red-700 bg-red-100/50 p-2.5 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        {success && (
          <p className="text-xs font-mono text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-300">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="group inline-flex w-fit items-center gap-2 bg-ink px-5 py-3 text-white transition-all duration-300 hover:bg-[#c18e4d] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{busy ? "Sending…" : "Send Inquiry"}</span>
          <ArrowRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </form>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="grid gap-2 text-xs tracking-wide">
      {label}
      <input
        {...props}
        required={props.name !== "phone"}
        className="border-b border-ink/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
      />
    </label>
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
          { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" }
        )
        .fromTo(
          ".hero-title",
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, clearProps: "transform,opacity" },
          "-=0.4"
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, clearProps: "transform,opacity" },
          "-=0.5"
        )
        .fromTo(
          ".hero-actions",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" },
          "-=0.5"
        )
        .fromTo(
          ".hero-orb",
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out", clearProps: "opacity" },
          "-=0.7"
        );

      // Hero Orb Scroll Parallax
      gsap.to(".hero-orb", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 80,
        ease: "none",
      });

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

      // 3. SERVICES SECTION ("WHAT WE DO") - Guaranteed visible reveal
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
          stagger: 0.14,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: "#services",
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );

      // 4. SELECTED WORK SECTION STAGGERED REVEAL
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

      // Refresh ScrollTrigger calculations after initial layout setup
      ScrollTrigger.refresh();
    }, homeRef);

    // Refresh after DOM and layout settle
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
      <main>
        {/* HERO SECTION */}
        <section className="hero-section relative mx-auto min-h-[640px] w-[min(1180px,calc(100%-32px))] overflow-hidden py-28">
          <p className="hero-badge flex items-center gap-2 font-mono text-xs tracking-widest text-[#836946]">
            <Sparkles size={14} /> DIGITAL EXPERIENCES, DISTINCTLY MADE
          </p>
          <h1 className="hero-title mt-7 max-w-3xl font-serif text-6xl leading-[.9] tracking-tight md:text-8xl">
            Build something
            <br />
            <em className="text-gold">worth feeling.</em>
          </h1>
          <p className="hero-desc mt-7 max-w-md text-lg leading-relaxed text-ink/70">
            Ravion turns ambitious ideas into elevated digital experiences,
            visual worlds and work that gets remembered.
          </p>
          <div className="hero-actions mt-8 flex flex-wrap items-center gap-6">
            <a
              className="group inline-flex items-center gap-2 bg-ink px-5 py-3 text-white transition-all duration-300 hover:bg-[#c18e4d] hover:-translate-y-0.5 active:scale-95"
              href="#contact"
            >
              <span>Start a project</span>
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            <Link
              href="/samples"
              className="group inline-flex items-center gap-2 border-b border-ink py-1 text-ink transition-colors hover:text-gold hover:border-gold"
            >
              <span>View our work</span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
          <div className="hero-orb absolute right-0 top-24 -z-10 hidden h-96 w-96 rounded-full bg-[#c99a55] md:block" />
        </section>

        {/* ABOUT SECTION */}
        <section
          id="about"
          className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 border-t border-ink/15 py-24 md:grid-cols-[27%_1fr]"
        >
          <p className="about-label font-mono text-xs tracking-widest text-[#836946]">
            01 / ABOUT RAVION
          </p>
          <div className="about-content">
            <h2 className="max-w-3xl font-serif text-5xl leading-none md:text-6xl">
              We make brands feel{" "}
              <em className="text-gold">impossible to ignore.</em>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
              A small, sharp creative partner for businesses ready to show up with
              more intent.
            </p>
          </div>
        </section>

        {/* SERVICES SECTION ("WHAT WE DO") */}
        <section id="services" className="bg-[#062623] py-24 text-cream">
          <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
            <p className="services-label font-mono text-xs tracking-widest text-[#d1aa6b]">
              02 / WHAT WE DO
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-0">
              {[
                [
                  "01",
                  "Web experiences",
                  "Websites, landing pages and link-in-bio spaces designed to convert attention into action.",
                ],
                [
                  "02",
                  "Visual direction",
                  "AI product imagery and visual systems that give your offering a point of view.",
                ],
                [
                  "03",
                  "Content that travels",
                  "Social content, campaign creative and motion that carries your brand further.",
                ],
              ].map(([n, t, d]) => (
                <article
                  className="service-card-item group min-h-64 border-t border-white/30 py-6 transition-all duration-500 hover:-translate-y-1.5 md:px-6"
                  key={n}
                >
                  <span className="font-mono text-xs text-[#d1aa6b] transition-colors group-hover:text-white">
                    {n}
                  </span>
                  <h3 className="mt-14 font-serif text-3xl transition-colors duration-300 group-hover:text-[#d1aa6b]">
                    {t}
                  </h3>
                  <p className="mt-3 leading-relaxed text-white/70">{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST WORK / SAMPLES SECTION */}
        <section id="work" className="mx-auto w-[min(1180px,calc(100%-32px))] py-28">
          <div className="work-header mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs tracking-widest text-[#836946]">
                03 / SELECTED WORK
              </p>
              <h2 className="mt-4 font-serif text-5xl md:text-6xl">
                Made to make a <em className="text-gold">mark.</em>
              </h2>
            </div>
            <Link
              href="/samples"
              className="group inline-flex w-fit items-center gap-2 border-b border-ink py-1 transition-colors hover:text-gold hover:border-gold"
            >
              <span>All projects</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {samples.slice(0, 5).map((s) => (
              <div className="work-card-item" key={s._id || s.slug}>
                <SelectedWorkCard sample={s} />
              </div>
            ))}
          </div>

          {!samples.length && (
            <p className="mt-4 text-ink/60">
              Published projects will appear here automatically.
            </p>
          )}
        </section>
      </main>

      <Contact />
      <Footer />
    </div>
  );
}

export function Samples() {
  const [samples, setSamples] = useState([]);
  const [categoriesList, setCategoriesList] = useState(["All"]);
  const [filter, setFilter] = useState("All");
  const samplesRef = useRef(null);

  useEffect(() => {
    // Dynamic categories by admin side
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

      gsap.fromTo(
        ".samples-grid-item",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );
    }, samplesRef);

    return () => ctx.revert();
  }, [filter, samples]);

  const list =
    filter === "All" ? samples : samples.filter((s) => s.category === filter);

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
        className="mx-auto w-[min(1180px,calc(100%-32px))] py-22"
      >
        {/* Back Button matching Ravion aesthetic */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="group inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-[#836946] transition-all hover:text-ink cursor-pointer"
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
        </div>

        <div className="my-12 flex flex-wrap gap-2">
          {categoriesList.map((c) => (
            <button
              onClick={() => setFilter(c)}
              className={`rounded-full border border-ink/20 px-4 py-2 text-sm transition-all duration-300 hover:border-ink ${
                filter === c ? "bg-ink text-white" : "hover:bg-ink/5"
              }`}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-x-5 gap-y-9 md:grid-cols-3">
          {list.map((s) => (
            <div className="samples-grid-item" key={s._id || s.slug}>
              <Card sample={s} />
            </div>
          ))}
        </div>

        {!list.length && (
          <p className="text-ink/60">No published work in this category yet.</p>
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
        <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-28">
          <p className="font-mono text-sm text-ink/60">Loading project…</p>
        </main>
      </>
    );

  if (!sample)
    return (
      <>
        <Header />
        <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-28">
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
      <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-16">
        <Link
          href="/samples"
          className="group inline-flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-gold"
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
      </main>
      <Contact />
      <Footer />
    </div>
  );
}
