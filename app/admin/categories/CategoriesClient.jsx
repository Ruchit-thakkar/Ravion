"use client";

import { useState, useCallback } from "react";
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
  FolderKanban,
  Grid,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
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

export default function CategoriesClient({ initialCategories = [], admin }) {
  const [categories, setCategories] = useState(initialCategories);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name", "samples", "newest", "oldest"

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = Add, object = Edit
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);

  // Safe Delete Modal State
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategoryName, setReassignCategoryName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Categories from API
  const fetchCategories = useCallback(
    async (overrideQuery, overrideSort) => {
      setIsLoading(true);
      setStatusMessage({ type: "", text: "" });

      const activeQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
      const activeSort = overrideSort !== undefined ? overrideSort : sortBy;

      try {
        const params = new URLSearchParams();
        if (activeQuery) params.set("q", activeQuery);
        if (activeSort) params.set("sortBy", activeSort);

        const res = await fetch(`/api/admin/categories?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load categories.");
        }

        setCategories(data.categories || []);
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to fetch categories. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, sortBy]
  );

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIsActive(true);
    setAutoSlug(true);
    setIsModalOpen(true);
    setStatusMessage({ type: "", text: "" });
  };

  // Open Modal for Edit
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name || "");
    setFormSlug(cat.slug || "");
    setFormDescription(cat.description || "");
    setFormIsActive(cat.isActive !== false);
    setAutoSlug(false);
    setIsModalOpen(true);
    setStatusMessage({ type: "", text: "" });
  };

  const handleNameChange = (val) => {
    setFormName(val);
    if (autoSlug) {
      setFormSlug(slugify(val));
    }
  };

  // Save Category (POST or PUT)
  const handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    const cleanName = formName.trim();
    if (!cleanName || cleanName.length < 2) {
      setStatusMessage({ type: "error", text: "Category name must be at least 2 characters." });
      return;
    }

    setIsSaving(true);

    const payload = {
      name: cleanName,
      slug: formSlug.trim() || slugify(cleanName),
      description: formDescription.trim(),
      isActive: formIsActive,
    };

    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit ? `/api/admin/categories/${editingCategory._id}` : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      setIsModalOpen(false);
      setEditingCategory(null);

      // Refresh categories list
      fetchCategories();

      setStatusMessage({
        type: "success",
        text: isEdit
          ? `Category "${data.category?.name}" updated successfully!`
          : `Category "${data.category?.name}" created successfully!`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while saving the category.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Modal with Safe Checks
  const handleOpenDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    // Find first other available category for reassignment fallback
    const other = categories.find((c) => c._id !== cat._id);
    setReassignCategoryName(other?.name || "");
  };

  // Confirm Delete (with optional reassignment)
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const hasSamples = categoryToDelete.sampleCount > 0;
      let url = `/api/admin/categories/${categoryToDelete._id}`;
      if (hasSamples && reassignCategoryName) {
        url += `?reassignTo=${encodeURIComponent(reassignCategoryName)}`;
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: hasSamples ? JSON.stringify({ reassignToCategory: reassignCategoryName }) : null,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category.");
      }

      setCategoryToDelete(null);
      setReassignCategoryName("");

      fetchCategories();

      setStatusMessage({
        type: "success",
        text: data.message || `Category "${categoryToDelete.name}" deleted successfully.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete category.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side sorting
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === "samples") {
      return (b.sampleCount || 0) - (a.sampleCount || 0);
    }
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return a.name.localeCompare(b.name);
  });

  const totalAssociatedSamples = categories.reduce((sum, c) => sum + (c.sampleCount || 0), 0);
  const activeCount = categories.filter((c) => c.isActive !== false).length;

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
          onRefresh={() => fetchCategories()}
        />

        {/* 3. MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Breadcrumbs & Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium tracking-widest text-[#8b714e] uppercase">
                  ADMIN / CATEGORIES
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 uppercase">
                  Phase 6 Active
                </span>
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#082d2a]">
                Disciplines &amp; <em className="font-serif italic font-normal text-[#c99a55]">Categories.</em>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#082d2a]/70">
                Organize creative services, taxonomy slugs, and portfolio showcase filtering for the studio.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                type="button"
                onClick={() => fetchCategories()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-2 text-xs font-medium text-[#082d2a] shadow-sm hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Refresh categories"
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
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Top Stats Overview Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {/* Total Categories */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Total Categories</span>
                <Grid size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {categories.length}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Creative service areas</p>
            </div>

            {/* Active Categories */}
            <div className="rounded-2xl border border-emerald-300/60 bg-gradient-to-b from-emerald-500/10 to-white/90 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Active Status</span>
                <Sparkles size={15} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                  {activeCount}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                  Visible
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Displayed in public filters</p>
            </div>

            {/* Total Associated Samples */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Associated Samples</span>
                <FolderKanban size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {totalAssociatedSamples}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Showcase items linked</p>
            </div>

            {/* Average Samples / Cat */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Avg Coverage</span>
                <Layers size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {categories.length > 0
                  ? (totalAssociatedSamples / categories.length).toFixed(1)
                  : "0.0"}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Samples per discipline</p>
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

          {/* Controls Bar: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/40">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  fetchCategories(val, sortBy);
                }}
                placeholder="Search categories by name, slug, or description…"
                className="w-full rounded-full border border-[#082d2a]/15 bg-white pl-10 pr-9 py-2 text-xs text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    fetchCategories("", sortBy);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#082d2a]/40 hover:text-[#082d2a] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="font-mono text-[11px] text-[#082d2a]/60 flex items-center gap-1">
                <ArrowUpDown size={12} />
                <span>Sort:</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  const sort = e.target.value;
                  setSortBy(sort);
                  fetchCategories(searchQuery, sort);
                }}
                className="rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-1.5 text-xs text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
              >
                <option value="name">Name (A-Z)</option>
                <option value="samples">Most Samples First</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Categories Grid View */}
          {isLoading && categories.length === 0 ? (
            /* Loading Skeletons */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-[#082d2a]/10 bg-white/60 p-5 space-y-3"
                >
                  <div className="h-5 w-40 bg-[#082d2a]/10 rounded" />
                  <div className="h-4 w-24 bg-[#082d2a]/10 rounded-full" />
                  <div className="h-10 w-full bg-[#082d2a]/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : sortedCategories.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#082d2a]/20 bg-white/50 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#082d2a]/5 text-[#082d2a]/40 mb-4">
                <Grid size={26} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#082d2a]">
                {searchQuery ? "No matching categories found" : "No categories defined"}
              </h3>
              <p className="mt-1 text-xs text-[#082d2a]/65 max-w-sm">
                {searchQuery
                  ? "Try clearing your search query to view all available studio disciplines."
                  : "Click 'Add Category' to create service taxonomies for portfolio grouping."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      fetchCategories("", sortBy);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Reset Search</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-5 py-2 text-xs font-medium text-[#f5f0e8] shadow-md hover:bg-[#c99a55] hover:text-[#031513] transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add First Category</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Category Cards Grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedCategories.map((cat) => {
                const sampleCount = cat.sampleCount || 0;

                return (
                  <div
                    key={cat._id}
                    className="group flex flex-col justify-between rounded-3xl border border-[#082d2a]/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/60 hover:shadow-md"
                  >
                    {/* Top Info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors truncate">
                            {cat.name}
                          </h3>
                          <span className="font-mono text-[11px] text-[#8b714e]">
                            /{cat.slug}
                          </span>
                        </div>

                        {/* Associated Samples Pill */}
                        <Link
                          href={`/admin/samples?category=${encodeURIComponent(cat.name)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/10 bg-[#082d2a]/5 px-2.5 py-1 font-mono text-[10px] text-[#082d2a] transition-all hover:bg-[#c99a55]/20 hover:text-[#8b714e] shrink-0"
                          title="View samples in this category"
                        >
                          <FolderKanban size={11} className="text-[#8b714e]" />
                          <span>{sampleCount} sample{sampleCount === 1 ? "" : "s"}</span>
                        </Link>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#082d2a]/65 line-clamp-2 leading-relaxed min-h-[32px]">
                        {cat.description || "No description provided for this category."}
                      </p>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-[#082d2a]/40 pt-1">
                        <span>Created {formatDate(cat.createdAt)}</span>
                        {cat.isActive !== false ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Hidden</span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#082d2a]/10 pt-3.5">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-1.5 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:bg-gray-50 active:scale-95 cursor-pointer"
                        >
                          <Edit3 size={13} className="text-[#c99a55]" />
                          <span>Edit</span>
                        </button>

                        {/* Public Link Preview */}
                        <Link
                          href={`/samples?category=${encodeURIComponent(cat.name)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full p-1.5 text-[#082d2a]/60 hover:bg-[#082d2a]/5 hover:text-[#082d2a] transition-colors"
                          title="View on public portfolio"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(cat)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete category"
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
      {/* 4. ADD / EDIT CATEGORY MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-[#082d2a]/20 bg-[#f5f0e8] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#082d2a]/10 pb-4">
              <div>
                <span className="font-mono text-[10.5px] font-semibold tracking-wider text-[#8b714e] uppercase">
                  {editingCategory ? "EDIT DISCIPLINE" : "NEW CATEGORY"}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-[#082d2a]">
                  {editingCategory ? (
                    <>
                      Edit <em className="italic font-normal text-[#c99a55]">{editingCategory.name}</em>
                    </>
                  ) : (
                    <>
                      Add New <em className="italic font-normal text-[#c99a55]">Category</em>
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

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Motion Design & CGI"
                  className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                />
              </div>

              {/* Category Slug */}
              <div>
                <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                  URL Slug *
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-xs text-[#082d2a]/40">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormSlug(slugify(e.target.value));
                    }}
                    placeholder="motion-design-cgi"
                    className="w-full rounded-xl border border-[#082d2a]/15 bg-white pl-7 pr-3.5 py-2.5 font-mono text-xs text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#082d2a]/50">
                  Used for clean filtering URLs and public taxonomy indexing.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[11px] font-medium tracking-wider text-[#082d2a]/80 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short overview of the scope and deliverables covered by this category."
                  className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3.5 py-2.5 text-sm text-[#082d2a] placeholder-[#082d2a]/35 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-[#082d2a]/20 text-[#c99a55] focus:ring-[#c99a55] cursor-pointer"
                />
                <label htmlFor="catIsActive" className="text-xs text-[#082d2a] cursor-pointer">
                  Active (show in public portfolio filters)
                </label>
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
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#082d2a] px-6 py-2.5 text-xs font-medium text-[#f5f0e8] shadow-md transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SAFE DELETE CONFIRMATION MODAL WITH REASSIGNMENT */}
      {/* ======================================================== */}
      {categoryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 shrink-0">
                <AlertCircle size={22} />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#082d2a]">
                Delete Category
              </h4>
            </div>

            {categoryToDelete.sampleCount > 0 ? (
              /* Case A: Category has associated samples -> Safe Reassignment Flow */
              <div className="space-y-3">
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    <span>Dependency Protection:</span>
                  </p>
                  <p className="mt-1">
                    This category is currently associated with{" "}
                    <strong>{categoryToDelete.sampleCount} portfolio sample(s)</strong>.
                    To preserve portfolio continuity and avoid broken references, choose a destination category to reassign them to:
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-[10.5px] font-semibold text-[#8b714e] uppercase tracking-wider">
                    Reassign Samples To *
                  </label>
                  <select
                    value={reassignCategoryName}
                    onChange={(e) => setReassignCategoryName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white px-3 py-2 text-xs text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                  >
                    {categories
                      .filter((c) => c._id !== categoryToDelete._id)
                      .map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Case B: Category has 0 samples -> Simple Confirmation */
              <p className="text-xs text-[#082d2a]/70 leading-relaxed">
                Are you sure you want to permanently delete category{" "}
                <strong className="font-semibold text-[#082d2a]">&ldquo;{categoryToDelete.name}&rdquo;</strong>?
                No portfolio samples are currently assigned to this category.
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete(null);
                  setReassignCategoryName("");
                }}
                disabled={isDeleting}
                className="rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || (categoryToDelete.sampleCount > 0 && !reassignCategoryName)}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-medium text-white shadow-md hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : categoryToDelete.sampleCount > 0 ? (
                  <>
                    <Trash2 size={13} />
                    <span>Reassign &amp; Delete</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Category</span>
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
