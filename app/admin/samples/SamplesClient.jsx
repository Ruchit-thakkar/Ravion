"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  FolderKanban,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function SamplesClient({
  initialSamples = [],
  initialCategories = [],
  initialCounts = { total: 0, published: 0, draft: 0 },
  initialPagination = { page: 1, limit: 30, totalFiltered: 0, totalPages: 1 },
  admin,
}) {
  const [samples, setSamples] = useState(initialSamples);
  const [categories, setCategories] = useState(initialCategories);
  const [counts, setCounts] = useState(initialCounts);
  const [pagination, setPagination] = useState(initialPagination);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "Published", "Draft"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest"

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null); // null = Add, object = Edit
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modal Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Published");
  const [formMedia, setFormMedia] = useState([]);
  const [formThumbnail, setFormThumbnail] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  // Delete Confirmation State
  const [sampleToDelete, setSampleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch Samples from API
  const fetchSamples = useCallback(
    async (overrideStatus, overrideCategory, overrideQuery, overrideSort) => {
      setIsLoading(true);
      setStatusMessage({ type: "", text: "" });

      const activeStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const activeCategory = overrideCategory !== undefined ? overrideCategory : categoryFilter;
      const activeQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
      const activeSort = overrideSort !== undefined ? overrideSort : sortBy;

      try {
        const params = new URLSearchParams();
        if (activeStatus && activeStatus !== "all") params.set("status", activeStatus);
        if (activeCategory && activeCategory !== "all") params.set("category", activeCategory);
        if (activeQuery) params.set("q", activeQuery);
        if (activeSort) params.set("sortBy", activeSort);
        params.set("limit", "50");

        const res = await fetch(`/api/admin/samples?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load portfolio samples.");
        }

        setSamples(data.samples || []);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setPagination(data.pagination);
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to fetch samples. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, categoryFilter, searchQuery, sortBy]
  );

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingSample(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory(categories[0]?.name || "Web Services");
    setFormDescription("");
    setFormStatus("Published");
    setFormMedia([]);
    setFormThumbnail("");
    setAutoSlug(true);
    setIsModalOpen(true);
    setStatusMessage({ type: "", text: "" });
  };

  // Open Modal for Edit
  const handleOpenEditModal = (sample) => {
    setEditingSample(sample);
    setFormTitle(sample.title || "");
    setFormSlug(sample.slug || "");
    setFormCategory(sample.category || categories[0]?.name || "Web Services");
    setFormDescription(sample.description || "");
    setFormStatus(sample.status || "Published");
    setFormMedia(Array.isArray(sample.media) ? [...sample.media] : []);
    setFormThumbnail(sample.thumbnail || "");
    setAutoSlug(false);
    setIsModalOpen(true);
    setStatusMessage({ type: "", text: "" });
  };

  const handleTitleChange = (val) => {
    setFormTitle(val);
    if (autoSlug) {
      setFormSlug(slugify(val));
    }
  };

  // Upload Media Files to ImageKit via /api/uploads
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload files.");
      }

      const newMediaItems = (data.media || []).map((m) => ({
        url: m.url,
        fileId: m.fileId,
        name: m.name,
        fileType: m.fileType || "image",
        thumbnailUrl: m.thumbnailUrl || m.url,
      }));

      setFormMedia((prev) => {
        const merged = [...prev, ...newMediaItems];
        // If no thumbnail set yet, use first item
        if (!formThumbnail && merged[0]) {
          setFormThumbnail(merged[0].thumbnailUrl || merged[0].url);
        }
        return merged;
      });

      setStatusMessage({
        type: "success",
        text: `Successfully uploaded ${newMediaItems.length} media file(s).`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Media upload failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (index) => {
    setFormMedia((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (formThumbnail && formMedia[index]?.url === formThumbnail) {
        setFormThumbnail(next[0]?.thumbnailUrl || next[0]?.url || "");
      }
      return next;
    });
  };

  // Submit Add / Edit Form
  const handleSaveSample = async (e) => {
    if (e) e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (!formTitle.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a project title." });
      return;
    }
    if (!formCategory) {
      setStatusMessage({ type: "error", text: "Please select a category." });
      return;
    }
    if (!formDescription.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a project description." });
      return;
    }
    if (formMedia.length === 0 && !formThumbnail) {
      setStatusMessage({
        type: "error",
        text: "Please upload at least one image or video for this portfolio sample.",
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || slugify(formTitle),
      category: formCategory,
      description: formDescription.trim(),
      status: formStatus,
      media: formMedia,
      thumbnail: formThumbnail || formMedia[0]?.thumbnailUrl || formMedia[0]?.url || "",
    };

    try {
      const isEdit = Boolean(editingSample);
      const url = isEdit ? `/api/admin/samples/${editingSample._id}` : "/api/admin/samples";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save portfolio sample.");
      }

      setIsModalOpen(false);
      setEditingSample(null);

      // Refresh list
      fetchSamples();

      setStatusMessage({
        type: "success",
        text: isEdit
          ? `Sample "${data.sample?.title}" updated successfully!`
          : `New sample "${data.sample?.title}" created and published!`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while saving the sample.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Status (Publish / Draft)
  const handleToggleStatus = async (sample) => {
    const newStatus = sample.status === "Published" ? "Draft" : "Published";
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/samples/${sample._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update publication status.");
      }

      setSamples((prev) =>
        prev.map((s) => (s._id === sample._id ? { ...s, status: newStatus } : s))
      );

      fetchSamples();

      setStatusMessage({
        type: "success",
        text: `Sample "${sample.title}" marked as ${newStatus}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update status.",
      });
    }
  };

  // Delete Sample
  const handleConfirmDelete = async () => {
    if (!sampleToDelete) return;
    setIsDeleting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/samples/${sampleToDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete sample.");
      }

      setSamples((prev) => prev.filter((s) => s._id !== sampleToDelete._id));
      setSampleToDelete(null);

      fetchSamples();

      setStatusMessage({
        type: "success",
        text: "Portfolio sample deleted permanently.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete sample.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
          onRefresh={() => fetchSamples()}
        />

        {/* 3. MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Breadcrumbs & Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium tracking-widest text-[#8b714e] uppercase">
                  ADMIN / SAMPLES
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 uppercase">
                  Phase 5 Active
                </span>
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#082d2a]">
                Portfolio <em className="font-serif italic font-normal text-[#c99a55]">Samples.</em>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#082d2a]/70">
                Create, curate, edit, and publish showcase items for the Ravion website and gallery.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                type="button"
                onClick={() => fetchSamples()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-2 text-xs font-medium text-[#082d2a] shadow-sm hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Refresh portfolio samples"
              >
                <RefreshCw size={13} className={isLoading ? "animate-spin text-[#c99a55]" : ""} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-5 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Add New Sample</span>
              </button>
            </div>
          </div>

          {/* Top Stats Overview Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {/* Total Samples */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Total Samples</span>
                <FolderKanban size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {counts.total}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Lifetime created projects</p>
            </div>

            {/* Published Showcases */}
            <div className="rounded-2xl border border-emerald-300/60 bg-gradient-to-b from-emerald-500/10 to-white/90 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Published</span>
                <Eye size={15} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                  {counts.published}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                  Live on Site
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Visible to public visitors</p>
            </div>

            {/* Draft / Hidden */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-amber-700">
                <span className="font-mono text-[10px] uppercase tracking-wider">Draft Items</span>
                <EyeOff size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {counts.draft}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Unpublished work</p>
            </div>

            {/* Disciplines / Categories */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Categories</span>
                <Sparkles size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {categories.length}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Active service taxonomy</p>
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

          {/* Controls Bar: Status Filter Tabs + Search + Category Filter + Sort */}
          <div className="space-y-4">
            {/* Status Tabs */}
            <div className="flex overflow-x-auto border-b border-[#082d2a]/10 pb-px gap-1.5 scrollbar-none">
              {[
                { id: "all", label: "All Samples", count: counts.total },
                { id: "Published", label: "Published", count: counts.published },
                { id: "Draft", label: "Drafts", count: counts.draft },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      fetchSamples(tab.id, categoryFilter, searchQuery, sortBy);
                    }}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-t-2xl px-4 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "border-b-2 border-[#c99a55] bg-white/80 text-[#082d2a] font-semibold shadow-sm"
                        : "text-[#082d2a]/60 hover:bg-white/40 hover:text-[#082d2a]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        isActive ? "bg-[#082d2a] text-[#f5f0e8]" : "bg-[#082d2a]/5 text-[#082d2a]/60"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input, Category Select, & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/40">
                  <Search size={15} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    fetchSamples(statusFilter, categoryFilter, q, sortBy);
                  }}
                  placeholder="Search samples by title, category, or description…"
                  className="w-full rounded-full border border-[#082d2a]/15 bg-white pl-10 pr-9 py-2 text-xs text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      fetchSamples(statusFilter, categoryFilter, "", sortBy);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#082d2a]/40 hover:text-[#082d2a] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter & Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setCategoryFilter(cat);
                    fetchSamples(statusFilter, cat, searchQuery, sortBy);
                  }}
                  className="rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-1.5 text-xs text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const sort = e.target.value;
                    setSortBy(sort);
                    fetchSamples(statusFilter, categoryFilter, searchQuery, sort);
                  }}
                  className="rounded-full border border-[#082d2a]/15 bg-white px-3 py-1.5 text-xs text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Samples Grid View */}
          {isLoading && samples.length === 0 ? (
            /* Loading Skeletons */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-3xl border border-[#082d2a]/10 bg-white/60 p-4 space-y-4"
                >
                  <div className="aspect-[4/3] w-full bg-[#082d2a]/10 rounded-2xl" />
                  <div className="h-5 w-3/4 bg-[#082d2a]/10 rounded" />
                  <div className="h-4 w-1/2 bg-[#082d2a]/10 rounded" />
                </div>
              ))}
            </div>
          ) : samples.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#082d2a]/20 bg-white/50 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#082d2a]/5 text-[#082d2a]/40 mb-4">
                <FolderKanban size={26} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#082d2a]">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No matching samples found"
                  : "No portfolio samples created yet"}
              </h3>
              <p className="mt-1 text-xs text-[#082d2a]/65 max-w-sm">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try resetting your search terms or filters to view other projects."
                  : "Click 'Add New Sample' to create your first portfolio showcase item with images, videos, and descriptions."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setCategoryFilter("all");
                      setSearchQuery("");
                      fetchSamples("all", "all", "", sortBy);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Reset All Filters</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-5 py-2 text-xs font-medium text-[#f5f0e8] shadow-md hover:bg-[#c99a55] hover:text-[#031513] transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create First Sample</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Samples Cards Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {samples.map((sample) => {
                const isPublished = sample.status === "Published";
                const mediaCount = (sample.media || []).length;
                const hasVideo = (sample.media || []).some((m) => m.fileType === "video");

                return (
                  <div
                    key={sample._id}
                    className="group flex flex-col justify-between rounded-3xl border border-[#082d2a]/10 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/60 hover:shadow-md"
                  >
                    {/* Media Thumbnail Container */}
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#031513] border border-[#082d2a]/10">
                        {sample.thumbnail ? (
                          <img
                            src={sample.thumbnail}
                            alt={sample.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-[#f5f0e8]/40">
                            <ImageIcon size={28} />
                            <span className="font-mono text-[10px] mt-1">No media</span>
                          </div>
                        )}

                        {/* Top Overlays */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                          {/* Status Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sample)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase shadow-md transition-all cursor-pointer ${
                              isPublished
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-amber-600 text-white hover:bg-amber-700"
                            }`}
                            title={`Click to ${isPublished ? "unpublish" : "publish"}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            <span>{sample.status}</span>
                          </button>

                          {/* Media count badge */}
                          <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] text-white">
                            {hasVideo ? <Film size={11} /> : <ImageIcon size={11} />}
                            <span>{mediaCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-semibold text-[#8b714e] uppercase tracking-wider">
                            {sample.category}
                          </span>
                          <span className="font-mono text-[10.5px] text-[#082d2a]/45">
                            {formatRelativeTime(sample.createdAt)}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-semibold text-[#082d2a] line-clamp-1 group-hover:text-[#c99a55] transition-colors">
                          {sample.title}
                        </h3>

                        <p className="text-xs text-[#082d2a]/70 line-clamp-2 leading-relaxed">
                          {sample.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#082d2a]/10 pt-3.5">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(sample)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-1.5 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:bg-gray-50 active:scale-95 cursor-pointer"
                        >
                          <Edit3 size={13} className="text-[#c99a55]" />
                          <span>Edit</span>
                        </button>

                        {/* Public Link Preview */}
                        <Link
                          href={`/samples`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full p-1.5 text-[#082d2a]/60 hover:bg-[#082d2a]/5 hover:text-[#082d2a] transition-colors"
                          title="View on public samples gallery"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setSampleToDelete(sample)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete sample"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. ADD / EDIT SAMPLE MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl rounded-3xl border border-[#082d2a]/20 bg-[#f5f0e8] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#082d2a]/10 pb-4">
              <div>
                <span className="font-mono text-[10.5px] font-semibold tracking-wider text-[#8b714e] uppercase">
                  {editingSample ? "EDIT PORTFOLIO PROJECT" : "NEW PORTFOLIO SHOWCASE"}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#082d2a]">
                  {editingSample ? (
                    <>
                      Edit <em className="italic font-normal text-[#c99a55]">{editingSample.title}</em>
                    </>
                  ) : (
                    <>
                      Add New <em className="italic font-normal text-[#c99a55]">Portfolio Sample</em>
                    </>
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#082d2a]/60 hover:bg-[#082d2a]/10 hover:text-[#082d2a] transition-all cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSample} className="space-y-6">
              {/* SECTION A: Basic Information */}
              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-5 space-y-4 shadow-sm">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e]">
                  A. Project Information
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sample Title */}
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Aurevia Golden Floral Visuals"
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                  </div>

                  {/* Category Selection (Real DB Categories) */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Slug */}
                  <div>
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        setFormSlug(slugify(e.target.value));
                      }}
                      placeholder="aurevia-golden-floral"
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 font-mono text-xs text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55]"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                      Description &amp; Highlights *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the aesthetic, purpose, technical stack, or artistic direction of this sample."
                      className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Media & Gallery Management */}
              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#082d2a]/10 pb-3">
                  <div>
                    <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e]">
                      B. Showcase Media &amp; Gallery
                    </h4>
                    <p className="text-xs text-[#082d2a]/60">
                      Upload photos (PNG, JPG, WebP) or video files (MP4) to ImageKit. Click any item to set as primary thumbnail.
                    </p>
                  </div>

                  {/* Upload Button */}
                  <label className="inline-flex items-center gap-2 rounded-xl bg-[#082d2a] px-4 py-2 text-xs font-medium text-[#f5f0e8] shadow-sm hover:bg-[#c99a55] hover:text-[#031513] transition-all cursor-pointer shrink-0">
                    {isUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#c99a55]" />
                        <span>Uploading to ImageKit…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload Files</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm"
                      disabled={isUploading}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Media Thumbnails Grid */}
                {formMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#082d2a]/20 bg-[#f5f0e8]/50 p-8 text-center">
                    <ImageIcon size={24} className="text-[#082d2a]/30 mb-2" />
                    <p className="text-xs text-[#082d2a]/60">No media uploaded for this project yet.</p>
                    <p className="text-[11px] text-[#082d2a]/40 mt-0.5">
                      Upload at least one image or video to showcase this work.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {formMedia.map((m, idx) => {
                      const isThumb = formThumbnail === m.thumbnailUrl || formThumbnail === m.url;
                      const isVid = m.fileType === "video";

                      return (
                        <div
                          key={idx}
                          className={`group relative aspect-square rounded-xl overflow-hidden bg-black/90 border-2 transition-all ${
                            isThumb ? "border-[#c99a55] ring-2 ring-[#c99a55]/40" : "border-[#082d2a]/15"
                          }`}
                        >
                          {isVid ? (
                            <div className="flex h-full w-full items-center justify-center bg-[#082d2a] text-[#f5f0e8]">
                              <Film size={24} />
                            </div>
                          ) : (
                            <img
                              src={m.thumbnailUrl || m.url}
                              alt={m.name || `Media ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          )}

                          {/* Primary Thumbnail Badge */}
                          {isThumb && (
                            <div className="absolute top-1.5 left-1.5 rounded-md bg-[#c99a55] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#031513] shadow">
                              Thumbnail
                            </div>
                          )}

                          {/* Set as Thumbnail overlay */}
                          {!isThumb && (
                            <button
                              type="button"
                              onClick={() => setFormThumbnail(m.thumbnailUrl || m.url)}
                              className="absolute inset-x-1 bottom-1 rounded-lg bg-black/70 py-1 font-mono text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              Set as Thumbnail
                            </button>
                          )}

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white/80 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION C: Publication Status */}
              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-5 space-y-3 shadow-sm">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e]">
                  C. Visibility &amp; Status
                </h4>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formStatus === "Published"}
                      onChange={() => setFormStatus("Published")}
                      className="text-[#c99a55] focus:ring-[#c99a55]"
                    />
                    <span className="text-xs font-medium text-[#082d2a]">
                      Published (Live on client-facing website and gallery)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formStatus === "Draft"}
                      onChange={() => setFormStatus("Draft")}
                      className="text-[#c99a55] focus:ring-[#c99a55]"
                    />
                    <span className="text-xs font-medium text-[#082d2a]/70">
                      Draft (Hidden from public visitors)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Save Bar */}
              <div className="flex items-center justify-end gap-3 border-t border-[#082d2a]/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-6 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Project…</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingSample ? "Save Changes" : "Publish Project"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {sampleToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                <AlertCircle size={22} />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#082d2a]">
                Delete Portfolio Sample
              </h4>
            </div>

            <p className="text-xs text-[#082d2a]/70 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="font-semibold text-[#082d2a]">&ldquo;{sampleToDelete.title}&rdquo;</strong>?
              This project will be removed from your database and public showcases.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSampleToDelete(null)}
                disabled={isDeleting}
                className="rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-medium text-white shadow-md hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Sample</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
