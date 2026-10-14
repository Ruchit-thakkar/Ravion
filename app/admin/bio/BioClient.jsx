"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  ExternalLink,
  Upload,
  Loader2,
  Edit3,
  Layers,
  User,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Mail,
  MessageCircle,
  Camera as InstagramIcon,
  Globe,
  ShoppingBag,
  TrendingUp,
  Tag,
  Package,
  X,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Link2,
  Palette,
  ShieldCheck,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

// All 12 supported section types
const SECTION_TYPES = [
  { type: "profile_header", name: "Profile Header", desc: "Avatar, title, badge & headline" },
  { type: "announcement", name: "Announcement Bar", desc: "Top notification banner with link" },
  { type: "about_me", name: "About Me Story", desc: "Creative story & bio statement" },
  { type: "digital_products", name: "Digital Products", desc: "Templates, ebooks & downloads" },
  { type: "affiliate_recommendations", name: "Affiliate Recommendations", desc: "Curated tools & partner picks" },
  { type: "featured_products", name: "Featured Products", desc: "Hand-picked highlight cards" },
  { type: "custom_links", name: "Custom Links", desc: "External buttons & links" },
  { type: "social_links", name: "Social Media Icons", desc: "Instagram, WhatsApp, Email, Web" },
  { type: "promotional_banner", name: "Promotional Banner", desc: "Callout banner for services" },
  { type: "newsletter", name: "Newsletter Signup", desc: "Email collection block" },
  { type: "custom_text", name: "Custom Text Block", desc: "Freeform paragraphs or quote" },
  { type: "footer", name: "Footer & Copyright", desc: "Closing credits & disclaimer" },
];

export default function BioClient({ user }) {
  // Navigation Tabs inside this unified Link in Bio Hub
  // "products" | "links" | "profile" | "sections" | "styling"
  const [activeTab, setActiveTab] = useState("products");
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Bio Data state
  const [profile, setProfile] = useState({
    displayName: "Ravion Studio",
    title: "Creative Designer & Digital Builder",
    shortBio: "BUILD · CREATE · INNOVATE",
    description: "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.",
    avatarUrl: "/assets/ravion_logo_svg-01.svg",
    location: "India · Worldwide",
    email: "ruchitthakkar12@gmail.com",
    websiteUrl: "https://ravion.in",
    socialLinks: [
      { platform: "instagram", url: "https://www.instagram.com/ravion.ai/", label: "Instagram", isActive: true },
      { platform: "whatsapp", url: "https://wa.me/917990774831", label: "WhatsApp", isActive: true },
      { platform: "email", url: "mailto:ruchitthakkar12@gmail.com", label: "Email", isActive: true },
      { platform: "website", url: "https://ravion.in", label: "Website", isActive: true },
    ],
  });

  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    type: "digital", // "digital" | "affiliate"
    title: "",
    category: "General",
    price: 0,
    originalPrice: "",
    currency: "INR",
    shortDescription: "",
    fullDescription: "",
    thumbnail: "",
    deliveryMethod: "file",
    fileUrl: "",
    purchaseUrl: "",
    affiliateUrl: "",
    affiliateDisclosure: "Special partner discount applies at checkout.",
    badge: "",
    status: "Published",
  });

  // Link Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    subtitle: "",
    category: "General",
    icon: "Globe",
    badge: "",
    buttonText: "Visit Link",
    openInNewTab: true,
    isActive: true,
  });

  // Section Edit Modal State
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionType, setNewSectionType] = useState("promotional_banner");

  // Show Toast Notification
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // 1. Initial Load: Fetch Bio profile, sections, products, links, and categories
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [bioRes, prodRes, linksRes, catsRes] = await Promise.all([
        fetch("/api/admin/bio").then((r) => r.json()),
        fetch("/api/admin/products?limit=100").then((r) => r.json()),
        fetch("/api/admin/links").then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
      ]);

      if (bioRes?.profile) {
        setProfile((prev) => ({ ...prev, ...bioRes.profile }));
      }
      if (Array.isArray(bioRes?.sections)) {
        setSections(bioRes.sections);
      }
      if (Array.isArray(prodRes?.products)) {
        setProducts(prodRes.products);
      }
      if (Array.isArray(linksRes?.links)) {
        setLinks(linksRes.links);
      }
      if (Array.isArray(catsRes?.categories)) {
        setCategories(catsRes.categories);
      }
    } catch (err) {
      console.error("Failed to load bio admin data:", err);
      showToast("Error loading bio data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 2. Publish All to Live /bio
  const handlePublishLive = async () => {
    try {
      setPublishing(true);
      const res = await fetch("/api/admin/bio/publish", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      showToast("Live /bio updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  // 3. Save Profile Info
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, status: "Published" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save profile failed.");
      showToast("Profile details saved!");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Avatar Upload via ImageKit
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("files", file);

      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Avatar upload failed.");

      const uploadedUrl = data.media?.[0]?.url || data.images?.[0]?.url;
      if (uploadedUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
        showToast("Avatar image uploaded to ImageKit!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 5. Product Image Upload via ImageKit
  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("files", file);

      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed.");

      const uploadedUrl = data.media?.[0]?.url || data.images?.[0]?.url;
      if (uploadedUrl) {
        setProductForm((prev) => ({ ...prev, thumbnail: uploadedUrl }));
        showToast("Product image uploaded to ImageKit!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 6. Open Product Modal (New or Edit)
  const openNewProductModal = (type = "digital") => {
    setEditingProduct(null);
    setProductForm({
      type,
      title: "",
      category: categories[0]?.name || "General",
      price: type === "digital" ? 0 : 499,
      originalPrice: "",
      currency: "INR",
      shortDescription: "",
      fullDescription: "",
      thumbnail: "",
      deliveryMethod: "file",
      fileUrl: "",
      purchaseUrl: "",
      affiliateUrl: "",
      affiliateDisclosure: "Special partner discount applies at checkout.",
      badge: type === "digital" ? "FREE" : "RECOMMENDED",
      status: "Published",
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      type: prod.type || "digital",
      title: prod.title || "",
      category: prod.category || "General",
      price: prod.price ?? 0,
      originalPrice: prod.originalPrice || "",
      currency: prod.currency || "INR",
      shortDescription: prod.shortDescription || "",
      fullDescription: prod.fullDescription || "",
      thumbnail: prod.thumbnail || "",
      deliveryMethod: prod.deliveryMethod || "file",
      fileUrl: prod.fileUrl || "",
      purchaseUrl: prod.purchaseUrl || "",
      affiliateUrl: prod.affiliateUrl || "",
      affiliateDisclosure: prod.affiliateDisclosure || "Special partner discount applies at checkout.",
      badge: prod.badge || "",
      status: prod.status || "Published",
    });
    setProductModalOpen(true);
  };

  // 7. Save Product (POST / PUT)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      showToast("Please enter a product title.");
      return;
    }
    if (productForm.type === "affiliate" && !productForm.affiliateUrl.trim()) {
      showToast("Affiliate URL is required for affiliate items.");
      return;
    }

    try {
      setSaving(true);
      const url = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const payload = {
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      showToast(editingProduct ? "Product updated!" : "Product created successfully!");
      setProductModalOpen(false);

      // Refresh products list
      const updated = await fetch("/api/admin/products?limit=100").then((r) => r.json());
      setProducts(updated.products || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // 8. Delete Product
  const handleDeleteProduct = async (prod) => {
    if (!confirm(`Are you sure you want to delete "${prod.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setProducts((prev) => prev.filter((p) => p._id !== prod._id));
      showToast("Product deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete product.");
    }
  };

  // 9. Toggle Product Status
  const handleToggleProductStatus = async (prod) => {
    const newStatus = prod.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Toggle status failed.");
      setProducts((prev) =>
        prev.map((p) => (p._id === prod._id ? { ...p, status: newStatus } : p))
      );
      showToast(`Product set to ${newStatus}.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle status.");
    }
  };

  // 10. Open Link Modal (New or Edit)
  const openNewLinkModal = () => {
    setEditingLink(null);
    setLinkForm({
      title: "",
      url: "",
      subtitle: "",
      category: "General",
      icon: "Globe",
      badge: "",
      buttonText: "Visit Link",
      openInNewTab: true,
      isActive: true,
    });
    setLinkModalOpen(true);
  };

  const openEditLinkModal = (link) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title || "",
      url: link.url || "",
      subtitle: link.subtitle || link.description || "",
      category: link.category || "General",
      icon: link.icon || "Globe",
      badge: link.badge || "",
      buttonText: link.buttonText || "Visit Link",
      openInNewTab: link.openInNewTab !== undefined ? link.openInNewTab : true,
      isActive: link.isActive !== undefined ? link.isActive : true,
    });
    setLinkModalOpen(true);
  };

  // 11. Save Link (POST / PUT)
  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkForm.title.trim() || !linkForm.url.trim()) {
      showToast("Link title and URL are required.");
      return;
    }

    try {
      setSaving(true);
      const url = editingLink ? `/api/admin/links/${editingLink._id}` : "/api/admin/links";
      const method = editingLink ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save link.");

      showToast(editingLink ? "Link updated!" : "New link added!");
      setLinkModalOpen(false);

      // Refresh links list
      const updated = await fetch("/api/admin/links").then((r) => r.json());
      setLinks(updated.links || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save link.");
    } finally {
      setSaving(false);
    }
  };

  // 12. Delete Link
  const handleDeleteLink = async (link) => {
    if (!confirm(`Delete link "${link.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/links/${link._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setLinks((prev) => prev.filter((l) => l._id !== link._id));
      showToast("Link deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete link.");
    }
  };

  // 13. Toggle Link Active
  const handleToggleLinkActive = async (link) => {
    const newActive = !link.isActive;
    try {
      const res = await fetch(`/api/admin/links/${link._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (!res.ok) throw new Error("Toggle active failed.");
      setLinks((prev) =>
        prev.map((l) => (l._id === link._id ? { ...l, isActive: newActive } : l))
      );
      showToast(`Link ${newActive ? "activated" : "hidden"}.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle link.");
    }
  };

  // 14. Section Actions: Move, Toggle, Add, Delete
  const handleMoveSection = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Re-index order
    const ordered = updated.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(ordered);

    try {
      await fetch("/api/admin/bio/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: ordered.map((s) => s._id),
        }),
      });
      showToast("Sections reordered!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSectionVisibility = async (sec) => {
    const updated = sections.map((s) =>
      s._id === sec._id ? { ...s, isVisible: !s.isVisible } : s
    );
    setSections(updated);

    try {
      await fetch(`/api/admin/bio/sections/${sec._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sec,
          isVisible: !sec.isVisible,
        }),
      });
      showToast(`Section ${!sec.isVisible ? "shown" : "hidden"}.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update visibility.");
    }
  };

  const handleAddSection = async () => {
    try {
      setSaving(true);
      const def = SECTION_TYPES.find((t) => t.type === newSectionType);
      const res = await fetch("/api/admin/bio/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newSectionType,
          title: def ? def.name : "New Section",
          subtitle: def ? def.desc : "",
          isVisible: true,
          status: "Published",
          config: {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add section.");

      setSections((prev) => [...prev, data.section]);
      showToast("New section added to Bio page!");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to add section.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sec) => {
    if (!confirm(`Delete section "${sec.title || sec.type}"?`)) return;

    try {
      const res = await fetch(`/api/admin/bio/sections/${sec._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setSections((prev) => prev.filter((s) => s._id !== sec._id));
      showToast("Section removed.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete section.");
    }
  };

  // Copy Bio URL
  const copyBioUrl = () => {
    navigator.clipboard.writeText("https://ravion.in/bio");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast("Bio link copied to clipboard!");
  };

  return (
    <AdminLayout
      user={user}
      title="Link in Bio Control Hub"
      subtitle="The complete command center: Manage profile, digital products, affiliate recommendations, links & layout"
      actions={
        <div className="flex items-center gap-2">
          {/* Copy URL */}
          <button
            onClick={copyBioUrl}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#c99a55]/30 bg-[#062623]/80 px-3 py-2 text-xs font-semibold text-[#d1aa6b] hover:bg-[#c99a55]/20 transition-all"
            title="Copy Public Bio Link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>ravion.in/bio</span>
          </button>

          {/* View Live /bio */}
          <Link
            href="/bio"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-[#c99a55]/40 bg-[#062623] px-3.5 py-2 text-xs font-semibold text-[#f5f0e8] hover:text-[#d1aa6b] hover:border-[#c99a55] transition-all"
          >
            <Globe className="h-3.5 w-3.5 text-[#c99a55]" />
            <span className="hidden sm:inline">View Live</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          {/* Toggle Mobile Preview on Small Screens */}
          <button
            onClick={() => setShowMobilePreviewModal(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-xl border border-[#c99a55]/40 bg-[#062623] px-3 py-2 text-xs font-semibold text-[#c99a55]"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>

          {/* Publish Changes Button */}
          <button
            onClick={handlePublishLive}
            disabled={publishing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] via-[#dfb77b] to-[#b38341] px-5 py-2 text-xs font-bold text-[#031513] uppercase tracking-wider shadow-lg shadow-[#c99a55]/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>{publishing ? "Publishing..." : "Publish to Live /bio"}</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-[#c99a55]/40 bg-[#041a18] px-4 py-3 text-xs font-medium text-[#f5f0e8] shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300">
          <Sparkles className="h-4 w-4 text-[#c99a55]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Left Control Hub + Right Sticky Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Control Center (8 Columns on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Navigation Tabs Bar */}
          <div className="rounded-2xl border border-[#c99a55]/20 bg-[#021311]/90 p-1.5 flex items-center gap-1 overflow-x-auto shadow-xl scrollbar-none">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "products"
                  ? "bg-[#c99a55] text-[#031513] shadow-md shadow-[#c99a55]/20"
                  : "text-[#f5f0e8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("links")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "links"
                  ? "bg-[#c99a55] text-[#031513] shadow-md shadow-[#c99a55]/20"
                  : "text-[#f5f0e8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Custom Links ({links.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "profile"
                  ? "bg-[#c99a55] text-[#031513] shadow-md shadow-[#c99a55]/20"
                  : "text-[#f5f0e8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profile & Socials</span>
            </button>

            <button
              onClick={() => setActiveTab("sections")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "sections"
                  ? "bg-[#c99a55] text-[#031513] shadow-md shadow-[#c99a55]/20"
                  : "text-[#f5f0e8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Layout & Order ({sections.length})</span>
            </button>
          </div>

          {/* TAB 1: PRODUCTS (DIGITAL & AFFILIATE) */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="rounded-3xl border border-[#c99a55]/20 bg-[#021311]/90 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f5f0e8]">
                    Products Management
                  </h2>
                  <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                    Manage digital download files, templates, ebooks, and affiliate recommendations
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => openNewProductModal("digital")}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-4 py-2 text-xs font-bold text-[#031513] hover:brightness-110 shadow-md shadow-[#c99a55]/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Digital Product</span>
                  </button>

                  <button
                    onClick={() => openNewProductModal("affiliate")}
                    className="flex items-center gap-1.5 rounded-xl border border-[#c99a55]/40 bg-[#062623] px-3.5 py-2 text-xs font-semibold text-[#d1aa6b] hover:bg-[#c99a55]/15 transition-all"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-[#c99a55]" />
                    <span>+ Add Affiliate Pick</span>
                  </button>
                </div>
              </div>

              {/* Products List */}
              {loading ? (
                <div className="rounded-3xl border border-[#c99a55]/15 bg-[#021311]/60 p-12 text-center text-xs text-[#f5f0e8]/60">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#c99a55] mb-2" />
                  <span>Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#c99a55]/30 bg-[#021311]/60 p-12 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[#c99a55]/10 border border-[#c99a55]/20 flex items-center justify-center mx-auto mb-3 text-[#c99a55]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#f5f0e8]">
                    No Products Added Yet
                  </h3>
                  <p className="text-xs text-[#f5f0e8]/60 max-w-sm mx-auto mt-1">
                    Click either button above to create your first digital download file (ebook, template, kit) or affiliate recommendation.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openNewProductModal("digital")}
                      className="rounded-xl bg-[#c99a55] px-4 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b]"
                    >
                      + Add Digital Product
                    </button>
                    <button
                      onClick={() => openNewProductModal("affiliate")}
                      className="rounded-xl border border-[#c99a55]/40 px-4 py-2 text-xs font-semibold text-[#c99a55] hover:bg-[#c99a55]/10"
                    >
                      + Add Affiliate Pick
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((prod) => (
                    <div
                      key={prod._id}
                      className="rounded-2xl border border-[#c99a55]/20 bg-[#021311]/90 p-4 shadow-xl hover:border-[#c99a55]/50 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                              prod.type === "digital"
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                                : "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {prod.type === "digital" ? "Digital File" : "Affiliate Pick"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-medium ${
                              prod.status === "Published"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {prod.status}
                          </span>
                        </div>

                        {/* Title & Thumbnail */}
                        <div className="flex items-start gap-3">
                          <div className="h-14 w-14 rounded-xl bg-[#031513] border border-[#c99a55]/20 overflow-hidden shrink-0">
                            <img
                              src={prod.thumbnail || "/assets/ravion-logo.png"}
                              alt={prod.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm text-[#f5f0e8] truncate group-hover:text-[#c99a55] transition-colors">
                              {prod.title}
                            </h4>
                            <p className="text-xs text-[#f5f0e8]/50 truncate mt-0.5">
                              {prod.shortDescription || "No short description provided."}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#c99a55]">
                                {prod.price === 0
                                  ? "FREE"
                                  : `${prod.currency || "INR"} ${prod.price}`}
                              </span>
                              {prod.originalPrice && (
                                <span className="font-mono text-[10px] text-[#f5f0e8]/40 line-through">
                                  {prod.currency} {prod.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#f5f0e8]/40">
                          {prod.category || "General"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleProductStatus(prod)}
                            className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                            title={prod.status === "Published" ? "Hide / Unpublish" : "Publish"}
                          >
                            {prod.status === "Published" ? (
                              <Eye className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                            )}
                          </button>

                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="rounded-lg p-1.5 text-[#c99a55] hover:bg-[#c99a55]/15"
                            title="Edit Product"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/30"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOM LINKS */}
          {activeTab === "links" && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="rounded-3xl border border-[#c99a55]/20 bg-[#021311]/90 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f5f0e8]">
                    Custom External Links
                  </h2>
                  <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                    Add unlimited clickable buttons to your social media, booking links, or websites
                  </p>
                </div>

                <button
                  onClick={openNewLinkModal}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-4 py-2 text-xs font-bold text-[#031513] hover:brightness-110 shadow-md shadow-[#c99a55]/20 transition-all self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add New Link</span>
                </button>
              </div>

              {/* Links List */}
              {loading ? (
                <div className="rounded-3xl border border-[#c99a55]/15 bg-[#021311]/60 p-12 text-center text-xs text-[#f5f0e8]/60">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#c99a55] mb-2" />
                  <span>Loading links...</span>
                </div>
              ) : links.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#c99a55]/30 bg-[#021311]/60 p-12 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[#c99a55]/10 border border-[#c99a55]/20 flex items-center justify-center mx-auto mb-3 text-[#c99a55]">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#f5f0e8]">
                    No Custom Links Added Yet
                  </h3>
                  <p className="text-xs text-[#f5f0e8]/60 max-w-sm mx-auto mt-1">
                    Add custom buttons pointing to your WhatsApp, Cal.com scheduling, YouTube, or client forms.
                  </p>
                  <div className="mt-5">
                    <button
                      onClick={openNewLinkModal}
                      className="rounded-xl bg-[#c99a55] px-4 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b]"
                    >
                      + Add New Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((lnk) => (
                    <div
                      key={lnk._id}
                      className="rounded-2xl border border-[#c99a55]/20 bg-[#021311]/90 p-4 shadow-xl hover:border-[#c99a55]/50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-[#041a18] border border-[#c99a55]/25 flex items-center justify-center text-[#c99a55] shrink-0">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-[#f5f0e8] truncate">
                              {lnk.title}
                            </h4>
                            {lnk.badge && (
                              <span className="rounded-full bg-[#c99a55]/20 px-2 py-0.5 text-[9px] font-mono text-[#dfb77b] border border-[#c99a55]/30">
                                {lnk.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-[#c99a55]/70 truncate mt-0.5">
                            {lnk.url}
                          </p>
                          {lnk.subtitle && (
                            <p className="text-[11px] text-[#f5f0e8]/50 truncate mt-0.5">
                              {lnk.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleLinkActive(lnk)}
                          className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                          title={lnk.isActive ? "Hide Link" : "Show Link"}
                        >
                          {lnk.isActive ? (
                            <Eye className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-amber-400" />
                          )}
                        </button>

                        <button
                          onClick={() => openEditLinkModal(lnk)}
                          className="rounded-lg p-1.5 text-[#c99a55] hover:bg-[#c99a55]/15"
                          title="Edit Link"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteLink(lnk)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/30"
                          title="Delete Link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & SOCIALS */}
          {activeTab === "profile" && (
            <div className="rounded-3xl border border-[#c99a55]/20 bg-[#021311]/90 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#c99a55]/15 pb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f5f0e8]">
                    Profile Identity & Social Links
                  </h2>
                  <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                    Customize your avatar, headline, bio description, and social media handles
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b] transition-all"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 rounded-2xl bg-[#031513] border border-[#c99a55]/30 overflow-hidden shrink-0">
                  <img
                    src={profile.avatarUrl || "/assets/ravion_logo_svg-01.svg"}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-[#c99a55]" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-1.5 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3.5 py-2 text-xs font-semibold text-[#d1aa6b] hover:bg-[#c99a55]/15 cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-[#c99a55]" />
                    <span>Upload Avatar (ImageKit)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-[#f5f0e8]/50">
                    Square PNG, JPG, or SVG recommended (500x500px).
                  </p>
                </div>
              </div>

              {/* Profile Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.displayName || ""}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Headline Badge Text
                  </label>
                  <input
                    type="text"
                    value={profile.shortBio || ""}
                    onChange={(e) => setProfile({ ...profile, shortBio: e.target.value })}
                    placeholder="BUILD · CREATE · INNOVATE"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Professional Title / Tagline
                  </label>
                  <input
                    type="text"
                    value={profile.title || ""}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="Creative Designer & Digital Builder"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Full Bio Description
                  </label>
                  <textarea
                    rows={3}
                    value={profile.description || ""}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-[#c99a55]/15 space-y-3">
                <h3 className="font-serif text-sm font-semibold text-[#f5f0e8]">
                  Social Media Links
                </h3>
                <div className="space-y-2">
                  {profile.socialLinks?.map((soc, idx) => (
                    <div
                      key={soc.platform || idx}
                      className="flex items-center gap-2 rounded-xl border border-[#c99a55]/15 bg-[#010c0b] p-2.5"
                    >
                      <span className="w-24 text-xs font-mono capitalize text-[#d1aa6b]">
                        {soc.platform}
                      </span>
                      <input
                        type="text"
                        value={soc.url || ""}
                        onChange={(e) => {
                          const updated = [...profile.socialLinks];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          setProfile({ ...profile, socialLinks: updated });
                        }}
                        placeholder="https://..."
                        className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...profile.socialLinks];
                          updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                          setProfile({ ...profile, socialLinks: updated });
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase transition-colors ${
                          soc.isActive
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {soc.isActive ? "Active" : "Off"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT & SECTIONS */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              {/* Add Section Control */}
              <div className="rounded-3xl border border-[#c99a55]/20 bg-[#021311]/90 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f5f0e8]">
                    Page Sections & Arrangement
                  </h2>
                  <p className="text-xs text-[#f5f0e8]/60 mt-0.5">
                    Order, show, or hide sections on your public /bio page
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value)}
                    className="rounded-xl border border-[#c99a55]/25 bg-[#010c0b] px-3 py-2 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddSection}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-xl bg-[#c99a55] px-3.5 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b] transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-2.5">
                {sections.map((sec, index) => (
                  <div
                    key={sec._id}
                    className={`rounded-2xl border p-4 transition-all flex items-center justify-between gap-4 ${
                      sec.isVisible
                        ? "border-[#c99a55]/20 bg-[#021311]/90 shadow-lg"
                        : "border-white/5 bg-[#010c0b]/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveSection(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded text-[#c99a55] hover:bg-white/10 disabled:opacity-20"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(index, "down")}
                          disabled={index === sections.length - 1}
                          className="p-1 rounded text-[#c99a55] hover:bg-white/10 disabled:opacity-20"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs sm:text-sm text-[#f5f0e8] truncate">
                            {sec.title || sec.type}
                          </h4>
                          <span className="rounded-full bg-[#c99a55]/15 px-2 py-0.5 font-mono text-[9px] text-[#c99a55]">
                            {sec.type}
                          </span>
                        </div>
                        {sec.subtitle && (
                          <p className="text-[11px] text-[#f5f0e8]/50 truncate mt-0.5">
                            {sec.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleSectionVisibility(sec)}
                        className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                        title={sec.isVisible ? "Hide Section" : "Show Section"}
                      >
                        {sec.isVisible ? (
                          <Eye className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-amber-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteSection(sec)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/30"
                        title="Delete Section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Live Interactive Mobile Phone Preview (4 Columns on desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="rounded-3xl border border-[#c99a55]/25 bg-[#021311]/95 p-4 shadow-2xl backdrop-blur-xl">
            {/* Phone Frame Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#c99a55]/15 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#c99a55]">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Live Mobile Preview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Sync</span>
              </div>
            </div>

            {/* Simulated iPhone Screen */}
            <div className="mx-auto w-full max-w-[320px] rounded-[36px] border-[6px] border-[#082a26] bg-[#031513] overflow-hidden shadow-2xl shadow-black/80 flex flex-col h-[600px]">
              {/* Dynamic Island / Notch */}
              <div className="pt-2 pb-1 bg-[#031513] flex justify-center shrink-0">
                <div className="h-3.5 w-20 rounded-full bg-black/90" />
              </div>

              {/* Scrollable Bio Page Contents inside phone */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none text-[#f5f0e8]">
                {/* Profile Avatar & Header */}
                <div className="text-center pt-2">
                  <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#c99a55] p-0.5 bg-[#021311] overflow-hidden shadow-lg">
                    <img
                      src={profile.avatarUrl || "/assets/ravion_logo_svg-01.svg"}
                      alt="Avatar"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="mt-2.5 font-serif font-bold text-sm text-[#f5f0e8]">
                    {profile.displayName || "Ravion"}
                  </h3>
                  <div className="mt-1 inline-block rounded-full bg-[#c99a55]/15 px-2.5 py-0.5 font-mono text-[8px] font-semibold tracking-wider text-[#d1aa6b] uppercase">
                    {profile.shortBio || "BUILD · CREATE · INNOVATE"}
                  </div>
                  <p className="mt-1.5 text-[10px] text-[#f5f0e8]/70 leading-relaxed max-w-[240px] mx-auto">
                    {profile.title || "Creative Studio & Digital Builder"}
                  </p>

                  {/* Social Icons inside phone */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {profile.socialLinks
                      ?.filter((s) => s.isActive)
                      .slice(0, 4)
                      .map((s, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full bg-[#062623] border border-[#c99a55]/30 flex items-center justify-center text-[#c99a55] text-[10px]"
                        >
                          <Globe className="h-3 w-3" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Digital Products in phone preview */}
                {products.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#c99a55] uppercase">
                      <span>Products</span>
                      <span>{products.length} Items</span>
                    </div>

                    <div className="space-y-2">
                      {products.slice(0, 3).map((prod) => (
                        <div
                          key={prod._id}
                          className="rounded-xl border border-[#c99a55]/20 bg-[#062623]/70 p-2.5 flex items-center gap-2.5"
                        >
                          <div className="h-10 w-10 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                            <img
                              src={prod.thumbnail || "/assets/ravion-logo.png"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[11px] text-[#f5f0e8] truncate">
                              {prod.title}
                            </p>
                            <p className="font-mono text-[9px] text-[#c99a55]">
                              {prod.price === 0 ? "FREE" : `${prod.currency || "INR"} ${prod.price}`}
                            </p>
                          </div>
                          <span className="rounded-lg bg-[#c99a55] px-2 py-1 text-[9px] font-bold text-[#031513]">
                            Get
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Links in phone preview */}
                {links.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#c99a55] uppercase">
                      <span>Featured Links</span>
                    </div>

                    <div className="space-y-1.5">
                      {links
                        .filter((l) => l.isActive)
                        .slice(0, 4)
                        .map((lnk) => (
                          <div
                            key={lnk._id}
                            className="rounded-xl border border-[#c99a55]/20 bg-[#062623]/60 px-3 py-2 flex items-center justify-between text-[11px] font-medium text-[#f5f0e8]"
                          >
                            <span className="truncate">{lnk.title}</span>
                            <ArrowRight className="h-3 w-3 text-[#c99a55]" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Footer in phone preview */}
                <div className="pt-4 pb-2 text-center border-t border-white/5">
                  <p className="font-mono text-[8px] text-[#f5f0e8]/40">
                    © 2026 RAVION · All Rights Reserved
                  </p>
                </div>
              </div>

              {/* iPhone Home Bar */}
              <div className="py-2 bg-[#031513] flex justify-center shrink-0">
                <div className="h-1 w-24 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT MODAL (Create & Edit) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setProductModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-[#c99a55]/30 bg-[#021311] p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#c99a55]/20">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                {editingProduct
                  ? "Edit Product"
                  : productForm.type === "digital"
                  ? "New Digital Product"
                  : "New Affiliate Recommendation"}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg text-[#f5f0e8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              {/* Type Switcher */}
              <div className="flex rounded-xl border border-[#c99a55]/20 bg-[#010c0b] p-1">
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, type: "digital" })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    productForm.type === "digital"
                      ? "bg-[#c99a55] text-[#031513]"
                      : "text-[#f5f0e8]/60 hover:text-white"
                  }`}
                >
                  Digital Product (Download / Gumroad)
                </button>
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, type: "affiliate" })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    productForm.type === "affiliate"
                      ? "bg-[#c99a55] text-[#031513]"
                      : "text-[#f5f0e8]/60 hover:text-white"
                  }`}
                >
                  Affiliate Pick (Partner Link)
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Luxury Portfolio Template Pack"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                    Price (0 for Free)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: e.target.value })
                    }
                    placeholder="e.g. 999"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail Image upload */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Thumbnail Image (ImageKit or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productForm.thumbnail}
                    onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                    placeholder="https://... or upload"
                    className="flex-1 rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                  <label className="rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3 py-2 text-xs font-semibold text-[#c99a55] hover:bg-[#c99a55]/15 cursor-pointer flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Digital Delivery / Affiliate Link */}
              {productForm.type === "digital" ? (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                    Download File URL or Checkout Link
                  </label>
                  <input
                    type="text"
                    value={productForm.fileUrl || productForm.purchaseUrl}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        fileUrl: e.target.value,
                        purchaseUrl: e.target.value,
                      })
                    }
                    placeholder="Direct cloud download link or Gumroad checkout URL"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                      Affiliate Link URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={productForm.affiliateUrl}
                      onChange={(e) =>
                        setProductForm({ ...productForm, affiliateUrl: e.target.value })
                      }
                      placeholder="https://amazon.in/... or partner link"
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                      Affiliate Disclosure
                    </label>
                    <input
                      type="text"
                      value={productForm.affiliateDisclosure}
                      onChange={(e) =>
                        setProductForm({ ...productForm, affiliateDisclosure: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Short Description */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.shortDescription}
                  onChange={(e) =>
                    setProductForm({ ...productForm, shortDescription: e.target.value })
                  }
                  placeholder="Key highlight or summary shown on the card"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-[#f5f0e8]/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-5 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b] transition-all"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK MODAL (Create & Edit) */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setLinkModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#c99a55]/30 bg-[#021311] p-6 sm:p-8 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#c99a55]/20">
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">
                {editingLink ? "Edit Custom Link" : "Add Custom Link"}
              </h3>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-lg text-[#f5f0e8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Link Title *
                </label>
                <input
                  type="text"
                  required
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  placeholder="e.g. Book 1-on-1 Consultation"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Subtitle / Note (Optional)
                </label>
                <input
                  type="text"
                  value={linkForm.subtitle}
                  onChange={(e) => setLinkForm({ ...linkForm, subtitle: e.target.value })}
                  placeholder="e.g. Instant calendar booking"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#d1aa6b] mb-1">
                  Badge Text (Optional)
                </label>
                <input
                  type="text"
                  value={linkForm.badge}
                  onChange={(e) => setLinkForm({ ...linkForm, badge: e.target.value })}
                  placeholder="e.g. POPULAR, NEW, 30-MIN"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#010c0b] px-3.5 py-2.5 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-[#f5f0e8]/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-5 py-2 text-xs font-bold text-[#031513] hover:bg-[#d1aa6b] transition-all"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingLink ? "Update Link" : "Save Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
