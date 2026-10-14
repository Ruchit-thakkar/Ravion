"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe,
  Share2,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Palette,
  Eye,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SettingsClient({ user }) {
  const [activeTab, setActiveTab] = useState("branding"); // "branding" | "seo" | "bio" | "products"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    branding: {
      name: "Ravion",
      tagline: "Build. Create. Innovate.",
      headline: "Build something worth feeling.",
      logoUrl: "/assets/ravion_logo_svg-01.svg",
      faviconUrl: "/favicon.ico",
      brandColors: {
        ink: "#082d2a",
        darkBg: "#031513",
        cream: "#f5f0e8",
        gold: "#c99a55",
        accent: "#dfb77b",
      },
    },
    contact: {
      email: "ruchitthakkar12@gmail.com",
      phone: "+91 79907 74831",
      whatsappUrl: "https://wa.me/917990774831",
      instagram: "@ravion.ai",
      instagramUrl: "https://www.instagram.com/ravion.ai/",
    },
    seo: {
      defaultTitle: "Ravion — Creative Studio & Digital Experiences",
      defaultDescription: "Ravion turns ambitious ideas into elevated digital experiences, visual worlds, and work that gets remembered.",
      defaultOgImage: "/assets/ravion-logo.png",
      canonicalUrl: "https://ravion.in",
      indexSite: true,
      sitemapEnabled: true,
    },
    bioPage: {
      pageTitle: "Ravion — Bio & Digital Space",
      profileDescription: "Creative Designer & Digital Builder. Crafting elevated digital experiences, visual direction, and digital products.",
      defaultAvatar: "/assets/ravion_logo_svg-01.svg",
      footerText: "© 2026 Ravion. Crafted with passion and imagination.",
    },
    productDisplay: {
      defaultOrder: "newest",
      productsPerSection: 6,
      showCategoryFilter: true,
      showAffiliateDisclosure: true,
      affiliateDisclosureText: "This page contains affiliate links. I may earn a commission from qualifying purchases at no additional cost to you.",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          branding: { ...prev.branding, ...(data.settings.branding || {}) },
          contact: { ...prev.contact, ...(data.settings.contact || {}) },
          seo: { ...prev.seo, ...(data.settings.seo || {}) },
          bioPage: { ...prev.bioPage, ...(data.settings.bioPage || {}) },
          productDisplay: { ...prev.productDisplay, ...(data.settings.productDisplay || {}) },
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setNotice("Website settings saved successfully!");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      user={user}
      title="Website Settings"
      subtitle="Branding, SEO & Content Defaults"
      actions={
        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
              {notice}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-md shadow-[#c99a55]/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex flex-wrap rounded-2xl border border-[#c99a55]/20 bg-[#041d1a] p-1.5 gap-1">
          <button
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === "branding"
                ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                : "text-[#f5f0e8]/70 hover:text-white"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>1. Branding & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === "seo"
                ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                : "text-[#f5f0e8]/70 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>2. Global SEO & Meta</span>
          </button>

          <button
            onClick={() => setActiveTab("bio")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === "bio"
                ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                : "text-[#f5f0e8]/70 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>3. Bio Page Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === "products"
                ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                : "text-[#f5f0e8]/70 hover:text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>4. Product Display & Affiliate</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/80 p-6 sm:p-8 shadow-xl space-y-6">
          {/* TAB 1: BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-5">
              <div className="border-b border-[#c99a55]/15 pb-3">
                <h3 className="font-serif text-xl font-semibold text-cream">Branding & Profiles</h3>
                <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                  Customize brand name, logos, and communication channels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={settings.branding.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, name: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.branding.tagline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, tagline: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Logo Image Path / URL
                  </label>
                  <input
                    type="text"
                    value={settings.branding.logoUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, logoUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={settings.branding.faviconUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, faviconUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, email: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Primary Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.contact.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, phone: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    WhatsApp Chat URL
                  </label>
                  <input
                    type="url"
                    value={settings.contact.whatsappUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, whatsappUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={settings.contact.instagramUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, instagramUrl: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="border-b border-[#c99a55]/15 pb-3">
                <h3 className="font-serif text-xl font-semibold text-cream">SEO & Social Sharing</h3>
                <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                  Configure default meta tags, Open Graph images, and robots indexability.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Default Website SEO Title
                  </label>
                  <input
                    type="text"
                    value={settings.seo.defaultTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, defaultTitle: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.seo.defaultDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, defaultDescription: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Social Sharing Image (OG Image)
                    </label>
                    <input
                      type="text"
                      value={settings.seo.defaultOgImage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: { ...settings.seo, defaultOgImage: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Canonical Site URL
                    </label>
                    <input
                      type="url"
                      value={settings.seo.canonicalUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: { ...settings.seo, canonicalUrl: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.seo.indexSite}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: { ...settings.seo, indexSite: e.target.checked },
                        })
                      }
                      className="rounded accent-[#c99a55] h-4 w-4"
                    />
                    <span className="text-xs text-cream font-medium">
                      Allow Search Engines to Index Website (robots.txt index)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.seo.sitemapEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: { ...settings.seo, sitemapEnabled: e.target.checked },
                        })
                      }
                      className="rounded accent-[#c99a55] h-4 w-4"
                    />
                    <span className="text-xs text-cream font-medium">
                      Enable Automated XML Sitemap (/sitemap.xml)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIO PAGE DEFAULTS */}
          {activeTab === "bio" && (
            <div className="space-y-5">
              <div className="border-b border-[#c99a55]/15 pb-3">
                <h3 className="font-serif text-xl font-semibold text-cream">Bio Page Defaults</h3>
                <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                  Fallback title, descriptions, and footer notices for /bio.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Public Bio Page Title
                  </label>
                  <input
                    type="text"
                    value={settings.bioPage.pageTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bioPage: { ...settings.bioPage, pageTitle: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Profile Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.bioPage.profileDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bioPage: { ...settings.bioPage, profileDescription: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Footer Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={settings.bioPage.footerText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bioPage: { ...settings.bioPage, footerText: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT DISPLAY */}
          {activeTab === "products" && (
            <div className="space-y-5">
              <div className="border-b border-[#c99a55]/15 pb-3">
                <h3 className="font-serif text-xl font-semibold text-cream">Product Display & Affiliate Settings</h3>
                <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                  Ordering, items per section, and affiliate disclosures.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Default Product Ordering
                    </label>
                    <select
                      value={settings.productDisplay.defaultOrder}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          productDisplay: { ...settings.productDisplay, defaultOrder: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="featured">Featured First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Products Displayed Per Section
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.productDisplay.productsPerSection}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          productDisplay: {
                            ...settings.productDisplay,
                            productsPerSection: parseInt(e.target.value, 10) || 6,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Affiliate Disclosure Text Notice
                  </label>
                  <textarea
                    rows={3}
                    value={settings.productDisplay.affiliateDisclosureText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        productDisplay: {
                          ...settings.productDisplay,
                          affiliateDisclosureText: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                  <p className="font-mono text-[10px] text-[#f5f0e8]/50 mt-1">
                    Displayed prominently on all public affiliate product sections.
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.productDisplay.showCategoryFilter}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          productDisplay: {
                            ...settings.productDisplay,
                            showCategoryFilter: e.target.checked,
                          },
                        })
                      }
                      className="rounded accent-[#c99a55] h-4 w-4"
                    />
                    <span className="text-xs text-cream font-medium">
                      Show Category Filter on Public Products
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.productDisplay.showAffiliateDisclosure}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          productDisplay: {
                            ...settings.productDisplay,
                            showAffiliateDisclosure: e.target.checked,
                          },
                        })
                      }
                      className="rounded accent-[#c99a55] h-4 w-4"
                    />
                    <span className="text-xs text-cream font-medium">
                      Always Show Affiliate Disclosure Badge
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c99a55]/20">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#c99a55] px-6 py-2.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-lg shadow-[#c99a55]/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save Website Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
