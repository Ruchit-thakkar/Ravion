"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MailCheck,
  FolderKanban,
  Tags,
  Briefcase,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Menu,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

// Reusable Multi-Media Card Carousel with Desktop < > buttons, Mobile Touch Swipe, and Auto-sliding
export function MediaCarousel({ media = [], title = "" }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const items = Array.isArray(media) && media.length > 0
    ? media
    : [{ url: "/assets/sample-1.jpg", fileType: "image" }];

  // Auto-slides every 3.5 seconds when not hovered
  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(interval);
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

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
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
      className="relative aspect-video w-full overflow-hidden bg-[#020e0d]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Media item rendering */}
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
          alt={title || "Sample media"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out"
        />
      )}

      {/* Video Indicator Badge */}
      {isVideo && (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-sm">
          <Film className="h-3 w-3 text-[#d1aa6b]" />
          <span>Video</span>
        </span>
      )}

      {/* Desktop < > Arrow Navigation Controls */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-0 right-0 z-10 flex justify-center gap-1.5">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === dotIdx
                    ? "w-5 bg-[#c99a55]"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SamplesClient({ user }) {
  const router = useRouter();
  const [samples, setSamples] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    status: "Published",
    media: [],
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef(null);

  const displayName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Admin";

  const loadData = async () => {
    try {
      setLoading(true);
      const [samplesRes, catsRes] = await Promise.all([
        fetch("/api/admin/samples"),
        fetch("/api/categories"),
      ]);

      if (samplesRes.ok) {
        const samplesData = await samplesRes.json();
        setSamples(samplesData || []);
      }
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData.categories || []);
      }
    } catch (err) {
      console.error(err);
      setActionNotice("Failed to load samples data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openCreateModal = () => {
    setEditingSample(null);
    setFormData({
      title: "",
      category: categories[0]?.name || "Web Services",
      description: "",
      status: "Published",
      media: [],
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (sample) => {
    setEditingSample(sample);
    const mediaList =
      sample.media && sample.media.length > 0
        ? sample.media
        : sample.images && sample.images.length > 0
        ? sample.images
        : sample.thumbnail
        ? [{ url: sample.thumbnail, fileType: "image" }]
        : [];

    setFormData({
      title: sample.title || "",
      category: sample.category || (categories[0]?.name || "Web Services"),
      description: sample.description || "",
      status: sample.status || "Published",
      media: mediaList,
    });
    setFormError("");
    setModalOpen(true);
  };

  // Upload handler for photos & videos using ImageKit
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploadingFiles(true);
      setFormError("");

      const uploadData = new FormData();
      files.forEach((file) => uploadData.append("files", file));

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ImageKit upload failed.");

      const newMediaItems = data.media || data.images || [];
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...newMediaItems],
      }));
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to upload files.");
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMediaItem = (removeIdx) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, idx) => idx !== removeIdx),
    }));
  };

  const handleSaveSample = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Project title is required.");
      return;
    }
    if (!formData.category.trim()) {
      setFormError("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingSample) {
        const res = await fetch(`/api/admin/samples/${editingSample._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error || "Failed to update sample.");

        setSamples((prev) =>
          prev.map((s) => (s._id === editingSample._id ? updated : s))
        );
        setActionNotice(`Sample "${formData.title}" updated.`);
      } else {
        const res = await fetch("/api/admin/samples", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error || "Failed to create sample.");

        setSamples((prev) => [created, ...prev]);
        setActionNotice(`Sample "${formData.title}" created successfully.`);
      }

      setModalOpen(false);
      setTimeout(() => setActionNotice(""), 3500);
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSample = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete sample "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/samples/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete sample.");

      setSamples((prev) => prev.filter((s) => s._id !== id));
      setActionNotice(`Sample "${title}" deleted.`);
      setTimeout(() => setActionNotice(""), 3500);
    } catch (err) {
      console.error(err);
      setActionNotice("Could not delete sample.");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, active: false },
    { name: "Inquiry", href: "/admin/inquiry", icon: MailCheck, active: false },
    { name: "Samples", href: "/admin/samples", icon: FolderKanban, active: true },
    { name: "Categories", href: "/admin/categories", icon: Tags, active: false },
    { name: "Services", href: "#", icon: Briefcase, active: false, badge: "Phase 2" },
    { name: "Settings", href: "#", icon: Settings, active: false, badge: "Phase 2" },
  ];

  const filteredSamples = samples.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || s.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#031513] text-[#f5f0e8] selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer Sidebar (≤ 768px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#c99a55]/20 bg-[#041d1a] p-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-block"
            >
              <img
                src="/assets/ravion_logo_svg-01.svg"
                alt="RAVION"
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <div className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#d1aa6b] uppercase">
              <Shield className="h-3 w-3" />
              <span>Admin Console</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c99a55]/25 bg-[#062623] text-[#f5f0e8]/80 transition-all hover:border-[#c99a55] hover:text-[#d1aa6b] active:scale-95"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.href && item.href !== "#") {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-[#c99a55]/15 text-[#d1aa6b] border border-[#c99a55]/30 font-semibold"
                      : "text-[#f5f0e8]/75 hover:bg-[#062623] hover:text-[#f5f0e8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }
            return (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#f5f0e8]/40 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-[#062623] px-2 py-0.5 font-mono text-[9px] text-[#d1aa6b]/70 border border-[#c99a55]/20">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[#c99a55]/15 pt-5 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-[#c99a55]/20 px-4 py-2.5 text-xs font-mono text-[#d1aa6b] transition-all hover:bg-[#c99a55]/10"
          >
            <span>Live Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-2.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/30 active:scale-[0.99]"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
            ) : (
              <LogOut className="h-4 w-4 text-red-400" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Permanent Sidebar (> 768px) */}
      <aside className="hidden w-64 flex-col border-r border-[#c99a55]/15 bg-[#041d1a]/80 p-6 backdrop-blur-xl md:flex">
        <div className="mb-8">
          <Link href="/admin" className="inline-block">
            <img
              src="/assets/ravion_logo_svg-01.svg"
              alt="RAVION"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#d1aa6b] uppercase">
            <Shield className="h-3 w-3" />
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.href && item.href !== "#") {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-[#c99a55]/15 text-[#d1aa6b] border border-[#c99a55]/30 font-semibold"
                      : "text-[#f5f0e8]/70 hover:bg-[#062623] hover:text-[#f5f0e8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }
            return (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#f5f0e8]/40 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-[#062623] px-1.5 py-0.5 font-mono text-[9px] text-[#d1aa6b]/70 border border-[#c99a55]/20">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[#c99a55]/15 pt-5 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-[#c99a55]/20 px-3.5 py-2 text-xs font-mono text-[#d1aa6b] transition-all hover:bg-[#c99a55]/10"
          >
            <span>Live Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/20 px-3.5 py-2.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/30 active:scale-[0.99]"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
            ) : (
              <LogOut className="h-4 w-4 text-red-400" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#c99a55]/15 bg-[#031513]/90 px-4 backdrop-blur-md sm:px-6 md:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c99a55]/30 bg-[#062623] text-[#d1aa6b] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#0a3531] active:scale-95 md:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="font-mono text-[10px] font-medium tracking-widest text-[#d1aa6b] uppercase sm:text-[11px]">
                RAVION ADMIN
              </p>
              <h1 className="font-serif text-lg font-semibold text-[#f5f0e8] sm:text-xl md:text-2xl">
                Samples & Portfolio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-[#f5f0e8]">
                Welcome, <span className="text-[#d1aa6b]">{displayName}</span>
              </p>
              <p className="font-mono text-[10px] text-[#f5f0e8]/50">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3.5 py-2 text-xs font-medium text-[#f5f0e8] transition-all hover:border-[#c99a55] hover:bg-[#0a3531] active:scale-95 sm:px-4"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d1aa6b]" />
              ) : (
                <LogOut className="h-3.5 w-3.5 text-[#d1aa6b]" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Samples Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-10">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header info & Add Button */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f5f0e8]">
                  Portfolio Samples
                </h2>
                <p className="mt-1 text-xs text-[#f5f0e8]/60">
                  Manage work shown on the Home page &quot;Selected Work&quot; and &quot;/samples&quot;.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c99a55] px-4 py-2.5 text-xs font-semibold text-[#031513] shadow-lg transition-all hover:bg-[#d5ad6d] active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Sample</span>
                </button>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c99a55]/15 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[#d1aa6b]">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-[#c99a55]/20 bg-[#062623] px-3 py-1.5 text-xs text-[#f5f0e8] outline-none focus:border-[#c99a55]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <span className="ml-2 font-mono text-xs text-[#d1aa6b]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-[#c99a55]/20 bg-[#062623] px-3 py-1.5 text-xs text-[#f5f0e8] outline-none focus:border-[#c99a55]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#f5f0e8]/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search samples…"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#062623]/70 py-2 pl-9 pr-3 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 outline-none transition-colors focus:border-[#c99a55]"
                />
              </div>
            </div>

            {actionNotice && (
              <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-3.5 text-xs font-mono text-[#d1aa6b]">
                {actionNotice}
              </div>
            )}

            {/* Loading / Empty / Grid */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#c99a55]/15 bg-[#062623]/30">
                <Loader2 className="h-6 w-6 animate-spin text-[#d1aa6b]" />
              </div>
            ) : filteredSamples.length === 0 ? (
              <div className="rounded-2xl border border-[#c99a55]/15 bg-[#062623]/40 p-12 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c99a55]/20 bg-[#c99a55]/10 text-[#d1aa6b]">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#f5f0e8]">
                  No samples found
                </h3>
                <p className="mt-2 text-xs text-[#f5f0e8]/50">
                  {search || selectedCategory !== "All" || selectedStatus !== "All"
                    ? "No samples matching your filter criteria."
                    : "Add your first portfolio piece by clicking 'Add Sample'."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSamples.map((sample) => {
                  const mediaItems =
                    sample.media && sample.media.length > 0
                      ? sample.media
                      : sample.images && sample.images.length > 0
                      ? sample.images
                      : sample.thumbnail
                      ? [{ url: sample.thumbnail, fileType: "image" }]
                      : [];

                  return (
                    <div
                      key={sample._id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-[#062623]/70 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/50"
                    >
                      {/* Media carousel with auto-slide & < > desktop controls & mobile swipe */}
                      <MediaCarousel media={mediaItems} title={sample.title} />

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded border border-[#c99a55]/25 bg-[#c99a55]/10 px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b]">
                              {sample.category}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                                sample.status === "Published"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {sample.status || "Published"}
                            </span>
                          </div>

                          <h3 className="mt-3 font-serif text-lg font-semibold text-[#f5f0e8]">
                            {sample.title}
                          </h3>

                          <p className="mt-2 text-xs leading-relaxed text-[#f5f0e8]/70 line-clamp-2">
                            {sample.description || "No description provided."}
                          </p>

                          <p className="mt-2 font-mono text-[10px] text-[#f5f0e8]/40">
                            {mediaItems.length} media {mediaItems.length === 1 ? "file" : "files"}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#c99a55]/10 pt-3">
                          <Link
                            href="/samples"
                            target="_blank"
                            className="flex items-center gap-1 font-mono text-[11px] text-[#d1aa6b] hover:underline"
                          >
                            <span>Preview</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(sample)}
                              className="flex items-center gap-1.5 rounded-lg border border-[#c99a55]/20 bg-[#041a18] px-3 py-1.5 text-xs text-[#d1aa6b] transition-colors hover:bg-[#c99a55]/20 hover:text-white"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteSample(sample._id, sample.title)}
                              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-900/30"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Sample Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#c99a55]/15 pb-4">
              <h3 className="font-serif text-xl font-semibold text-[#f5f0e8]">
                {editingSample ? "Edit Sample" : "Add New Sample"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#f5f0e8]/50 hover:bg-[#062623] hover:text-[#f5f0e8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSample} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Lumina Fragrance Campaign"
                    className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 outline-none transition-colors focus:border-[#c99a55]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] outline-none transition-colors focus:border-[#c99a55]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the client, concept, aesthetic, and outcome..."
                  className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 outline-none transition-colors focus:border-[#c99a55]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                  Publishing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] outline-none transition-colors focus:border-[#c99a55]"
                >
                  <option value="Published">Published (Visible to visitors)</option>
                  <option value="Draft">Draft (Admin only)</option>
                </select>
              </div>

              {/* Media Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b]">
                    Media Files (Photos & Videos: JPEG, PNG, MP4, MKV, etc.)
                  </label>
                  <span className="font-mono text-[10px] text-[#f5f0e8]/50">
                    Uploaded via ImageKit
                  </span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c99a55]/30 bg-[#062623]/60 p-6 text-center transition-all hover:border-[#c99a55] hover:bg-[#062623]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.mp4,.mkv,.webm,.mov"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadingFiles ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-7 w-7 animate-spin text-[#d1aa6b]" />
                      <p className="font-mono text-xs text-[#d1aa6b]">
                        Uploading media to ImageKit...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-7 w-7 text-[#d1aa6b] transition-transform group-hover:-translate-y-1" />
                      <p className="text-sm font-medium text-[#f5f0e8]">
                        Click or drop files to upload
                      </p>
                      <p className="font-mono text-[11px] text-[#f5f0e8]/50">
                        Supports multiple photos and videos (MP4, MKV, WebM, PNG, JPG)
                      </p>
                    </div>
                  )}
                </div>

                {/* Media items preview carousel & list */}
                {formData.media.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="font-mono text-xs text-[#d1aa6b]">
                      Attached Media ({formData.media.length}):
                    </p>

                    {/* Preview Carousel */}
                    <div className="overflow-hidden rounded-xl border border-[#c99a55]/20">
                      <MediaCarousel media={formData.media} title="Preview" />
                    </div>

                    {/* Media item list with delete button */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {formData.media.map((item, idx) => {
                        const isVid =
                          item.fileType === "video" ||
                          item.url?.endsWith(".mp4") ||
                          item.url?.endsWith(".mkv");

                        return (
                          <div
                            key={idx}
                            className="group relative flex items-center gap-2 rounded-xl border border-[#c99a55]/20 bg-[#062623] p-2"
                          >
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-black">
                              {isVid ? (
                                <div className="flex h-full w-full items-center justify-center bg-black/80 text-[#d1aa6b]">
                                  <Film className="h-4 w-4" />
                                </div>
                              ) : (
                                <img
                                  src={item.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-[#f5f0e8]">
                                {item.name || `Item ${idx + 1}`}
                              </p>
                              <span className="font-mono text-[9px] uppercase text-[#d1aa6b]">
                                {isVid ? "Video" : "Photo"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMediaItem(idx)}
                              className="rounded p-1 text-red-400 hover:bg-red-950 hover:text-red-300"
                              title="Remove media"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c99a55]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-[#f5f0e8]/60 hover:text-[#f5f0e8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingFiles}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c99a55] px-5 py-2.5 text-xs font-semibold text-[#031513] transition-all hover:bg-[#d5ad6d] active:scale-95 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingSample ? "Save Changes" : "Create Sample"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
