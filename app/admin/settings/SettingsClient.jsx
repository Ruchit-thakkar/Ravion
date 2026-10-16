"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function InstagramIcon({ size = 15, className = "" }) {
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

function LinkedinIcon({ size = 15, className = "" }) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 15, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon({ size = 15, className = "" }) {
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
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

export default function SettingsClient({ initialSettings, admin }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [savedBaseline, setSavedBaseline] = useState(initialSettings || {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("general"); // "general", "contact", "social", "footer"

  // Deep update helper
  const updateField = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
    if (statusMessage.text) setStatusMessage({ type: "", text: "" });
  };

  const handleDiscard = () => {
    setSettings(JSON.parse(JSON.stringify(savedBaseline)));
    setStatusMessage({ type: "info", text: "Unsaved changes discarded." });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({ type: "error", text: "Please select an image file (PNG, JPG, SVG, WebP)." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Image file exceeds 10 MB limit." });
      return;
    }

    setIsUploading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("images", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload logo.");
      }

      const uploadedUrl = data.images?.[0]?.url;
      if (!uploadedUrl) {
        throw new Error("No URL returned from upload provider.");
      }

      updateField("branding", "logoUrl", uploadedUrl);
      setStatusMessage({ type: "success", text: "Logo uploaded successfully! Click 'Save Changes' to apply." });
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to upload logo." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    // Client-side quick validations
    const brandName = settings.branding?.name?.trim();
    if (!brandName) {
      setStatusMessage({ type: "error", text: "Website name cannot be empty." });
      setActiveTab("general");
      return;
    }

    const email = settings.contact?.email?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatusMessage({ type: "error", text: "Please enter a valid business email address." });
      setActiveTab("contact");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings.");
      }

      setSavedBaseline(JSON.parse(JSON.stringify(data.settings)));
      setSettings(data.settings);
      setStatusMessage({
        type: "success",
        text: "Website settings saved and published successfully!",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while saving website settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedBaseline);

  const tabs = [
    { id: "general", label: "General & Branding", icon: Globe },
    { id: "contact", label: "Contact Details", icon: Mail },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "footer", label: "Footer & Commitments", icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f0e8] text-[#082d2a]">
      {/* 1. SIDEBAR */}
      <AdminSidebar
        admin={admin}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 2. TOP HEADER */}
        <AdminHeader
          admin={admin}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefresh={() => {}}
        />

        {/* 3. SETTINGS CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Breadcrumbs & Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium tracking-widest text-[#8b714e] uppercase">
                  ADMIN / SETTINGS
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 uppercase">
                  Phase 3 Active
                </span>
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#082d2a]">
                Website <em className="font-serif italic font-normal text-[#c99a55]">Settings.</em>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#082d2a]/70">
                Manage your studio brand identity, contact channels, social profiles, and public footer commitments.
              </p>
            </div>

            {/* Save / Discard Bar Top */}
            <div className="flex items-center gap-2.5 shrink-0">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Discard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-6 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Changes…</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {statusMessage.text && (
            <div
              role="alert"
              className={`flex items-start gap-2.5 rounded-2xl p-4 text-xs shadow-sm transition-all animate-in fade-in ${
                statusMessage.type === "success"
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                  : statusMessage.type === "info"
                  ? "border border-sky-300 bg-sky-50 text-sky-900"
                  : "border border-red-300 bg-red-50 text-red-900"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Settings Section Tabs */}
          <div className="flex overflow-x-auto border-b border-[#082d2a]/10 pb-px gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-t-2xl px-5 py-3 text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "border-b-2 border-[#c99a55] bg-white/80 text-[#082d2a] font-semibold shadow-sm"
                      : "text-[#082d2a]/60 hover:bg-white/40 hover:text-[#082d2a]"
                  }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? "text-[#c99a55]" : "text-[#082d2a]/40"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Container */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* ======================================================== */}
            {/* SECTION A — GENERAL SETTINGS */}
            {/* ======================================================== */}
            {activeTab === "general" && (
              <div className="rounded-3xl border border-[#082d2a]/10 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#082d2a]/10 pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    General Brand Identity
                  </h3>
                  <p className="mt-1 text-xs text-[#082d2a]/65">
                    Configure the official website title, taglines, and brand visual assets.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Website Name */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Studio / Website Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.branding?.name || ""}
                      onChange={(e) => updateField("branding", "name", e.target.value)}
                      placeholder="Ravion"
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Primary brand name displayed in headers, footers, and page titles.
                    </p>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Studio Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.branding?.tagline || ""}
                      onChange={(e) => updateField("branding", "tagline", e.target.value)}
                      placeholder="Build. Create. Innovate."
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Short signature motto for the creative studio.
                    </p>
                  </div>
                </div>

                {/* Hero Headline */}
                <div>
                  <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                    Homepage Hero Headline
                  </label>
                  <input
                    type="text"
                    value={settings.branding?.headline || ""}
                    onChange={(e) => updateField("branding", "headline", e.target.value)}
                    placeholder="Build something worth feeling."
                    className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                  />
                  <p className="mt-1 text-[11px] text-[#082d2a]/50">
                    Main hero headline displayed across the creative studio landing experience.
                  </p>
                </div>

                {/* Website Logo Preview & Upload */}
                <div className="border-t border-[#082d2a]/10 pt-6">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e]">
                    Studio Logo Asset
                  </h4>
                  <p className="mt-1 text-xs text-[#082d2a]/65">
                    Preview and configure the official logo file. Upload directly to ImageKit cloud or specify an image URL.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Visual Preview Box */}
                    <div className="flex h-24 w-44 items-center justify-center rounded-2xl border border-[#082d2a]/15 bg-[#031513] p-4 shadow-inner">
                      {settings.branding?.logoUrl ? (
                        <img
                          src={settings.branding.logoUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain brightness-0 invert"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-[#f5f0e8]/40">
                          <ImageIcon size={20} />
                          <span className="font-mono text-[10px] mt-1">No logo set</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block font-mono text-[10.5px] font-medium tracking-wider text-[#082d2a]/70 uppercase">
                          Logo URL / File Path
                        </label>
                        <input
                          type="text"
                          value={settings.branding?.logoUrl || ""}
                          onChange={(e) => updateField("branding", "logoUrl", e.target.value)}
                          placeholder="/assets/ravion_logo_svg-01.svg"
                          className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2 text-xs font-mono text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55]"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="group inline-flex items-center gap-2 rounded-xl border border-[#082d2a]/15 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:border-[#c99a55] hover:bg-white/80 active:scale-95 cursor-pointer">
                          {isUploading ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-[#c99a55]" />
                              <span>Uploading to ImageKit…</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} className="text-[#c99a55]" />
                              <span>Upload New Logo File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="font-mono text-[10px] text-[#082d2a]/50">
                          PNG, SVG, or WebP (transparent background recommended)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SECTION B — CONTACT INFORMATION */}
            {/* ======================================================== */}
            {activeTab === "contact" && (
              <div className="rounded-3xl border border-[#082d2a]/10 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#082d2a]/10 pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    Official Contact Channels
                  </h3>
                  <p className="mt-1 text-xs text-[#082d2a]/65">
                    These contact channels feed directly into the Let&apos;s Talk section, footer links, and inquiry cards.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Email Address */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Business Email Address *
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/40">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={settings.contact?.email || ""}
                        onChange={(e) => updateField("contact", "email", e.target.value)}
                        placeholder="ruchitthakkar12@gmail.com"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Destination for client inquiry notifications and footer mail links.
                    </p>
                  </div>

                  {/* Display Phone */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Contact Phone (Display) *
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/40">
                        <Phone size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={settings.contact?.phone || ""}
                        onChange={(e) => updateField("contact", "phone", e.target.value)}
                        placeholder="+91 79907 74831"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Formatted phone number shown on cards and the contact section.
                    </p>
                  </div>

                  {/* Raw Calling Phone */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Direct Dial Phone (tel: link)
                    </label>
                    <input
                      type="text"
                      value={settings.contact?.phoneRaw || ""}
                      onChange={(e) => updateField("contact", "phoneRaw", e.target.value)}
                      placeholder="+917990774831"
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm font-mono text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Normalized digits used in direct &ldquo;tel:&rdquo; click-to-call links.
                    </p>
                  </div>

                  {/* WhatsApp URL */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      WhatsApp Direct Link
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-600">
                        <MessageCircle size={15} />
                      </div>
                      <input
                        type="url"
                        value={settings.contact?.whatsappUrl || ""}
                        onChange={(e) => updateField("contact", "whatsappUrl", e.target.value)}
                        placeholder="https://wa.me/917990774831"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Direct WhatsApp chat URL used on contact buttons and portfolio badges.
                    </p>
                  </div>
                </div>

                {/* Studio Location */}
                <div>
                  <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                    Studio Location / Availability
                  </label>
                  <input
                    type="text"
                    value={settings.contact?.location || ""}
                    onChange={(e) => updateField("contact", "location", e.target.value)}
                    placeholder="India • Available Worldwide"
                    className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                  />
                  <p className="mt-1 text-[11px] text-[#082d2a]/50">
                    Geographic studio base and client engagement availability note.
                  </p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SECTION C — SOCIAL MEDIA PROFILES */}
            {/* ======================================================== */}
            {activeTab === "social" && (
              <div className="rounded-3xl border border-[#082d2a]/10 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#082d2a]/10 pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    Social Media Profiles &amp; Channels
                  </h3>
                  <p className="mt-1 text-xs text-[#082d2a]/65">
                    Connect your public creative social profiles for visitors and clients.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Instagram Handle */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Instagram Handle
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-pink-600">
                        <InstagramIcon size={15} />
                      </div>
                      <input
                        type="text"
                        value={settings.contact?.instagram || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField("contact", "instagram", val);
                        }}
                        placeholder="@ravion.ai"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                  </div>

                  {/* Instagram URL */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.contact?.instagramUrl || settings.social?.instagramUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateField("contact", "instagramUrl", val);
                        updateField("social", "instagramUrl", val);
                      }}
                      placeholder="https://www.instagram.com/ravion.ai/"
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-blue-600">
                        <LinkedinIcon size={15} />
                      </div>
                      <input
                        type="url"
                        value={settings.social?.linkedinUrl || ""}
                        onChange={(e) => updateField("social", "linkedinUrl", e.target.value)}
                        placeholder="https://linkedin.com/in/ruchitthakkar"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                  </div>

                  {/* Twitter / X URL */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Twitter / X Profile URL
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-800">
                        <TwitterIcon size={15} />
                      </div>
                      <input
                        type="url"
                        value={settings.social?.twitterUrl || ""}
                        onChange={(e) => updateField("social", "twitterUrl", e.target.value)}
                        placeholder="https://x.com/ravion"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                  </div>

                  {/* YouTube URL */}
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      YouTube Channel URL
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-red-600">
                        <YoutubeIcon size={15} />
                      </div>
                      <input
                        type="url"
                        value={settings.social?.youtubeUrl || ""}
                        onChange={(e) => updateField("social", "youtubeUrl", e.target.value)}
                        placeholder="https://youtube.com/@ravion"
                        className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SECTION D — FOOTER & COMMITMENTS */}
            {/* ======================================================== */}
            {activeTab === "footer" && (
              <div className="rounded-3xl border border-[#082d2a]/10 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#082d2a]/10 pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    Footer &amp; Client Commitments
                  </h3>
                  <p className="mt-1 text-xs text-[#082d2a]/65">
                    Customize the closing footer narrative, copyright lines, and client turnaround guarantees.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Footer Description */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Footer Bio / Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.footer?.footerDescription || ""}
                      onChange={(e) => updateField("footer", "footerDescription", e.target.value)}
                      placeholder="We help businesses build a stronger digital presence through websites, creative content, product visuals, and digital experiences."
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Summary displayed in the closing footer section above navigation columns.
                    </p>
                  </div>

                  {/* Copyright Text */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Copyright Notice
                    </label>
                    <input
                      type="text"
                      value={settings.footer?.copyrightText || ""}
                      onChange={(e) => updateField("footer", "copyrightText", e.target.value)}
                      placeholder={`© ${new Date().getFullYear()} Ravion. All rights reserved.`}
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Closing copyright claim displayed at the very bottom of the website.
                    </p>
                  </div>

                  {/* Turnaround Commitment Note */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Turnaround Commitment Box (Let&apos;s Talk section)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.footer?.turnaroundNote || ""}
                      onChange={(e) => updateField("footer", "turnaroundNote", e.target.value)}
                      placeholder="Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work."
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                    <p className="mt-1 text-[11px] text-[#082d2a]/50">
                      Displayed inside the highlighted turnaround assurance card beside the inquiry form.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#082d2a]/10 bg-white/70 p-4 gap-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[#082d2a]/60">
                <ShieldCheck size={14} className="text-[#c99a55]" />
                <span>
                  {hasUnsavedChanges
                    ? "You have unsaved changes in website settings."
                    : "All website settings are up to date and saved in MongoDB."}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Discard</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-6 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
