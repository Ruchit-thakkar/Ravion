"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Link2,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Globe,
  Camera as Instagram,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  X,
  Save,
  AlertCircle,
  Calendar,
  Share2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const LINK_TYPES = [
  "Website",
  "Social Media",
  "Affiliate Link",
  "Digital Product",
  "Blog Article",
  "External Resource",
  "Custom Link",
];

const POPULAR_ICONS = [
  "Globe",
  "MessageCircle",
  "Instagram",
  "Mail",
  "Phone",
  "Sparkles",
  "ShoppingBag",
  "FolderKanban",
  "Share2",
];

export default function LinksClient({ user }) {
  const searchParams = useSearchParams();

  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notice, setNotice] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const defaultFormData = {
    title: "",
    url: "",
    description: "",
    thumbnail: "",
    icon: "Globe",
    category: "Website",
    buttonText: "Open Link",
    type: "Website",
    order: 1,
    featured: false,
    isActive: true,
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchLinks();
    fetchCategories();

    if (searchParams.get("action") === "new") {
      openAddModal();
    }
  }, [searchParams]);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      console.error(err);
      showNotification("Could not load links.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingLink(null);
    setFormError("");
    const nextOrder = links.length ? Math.max(...links.map((l) => l.order || 0)) + 1 : 1;
    setFormData({ ...defaultFormData, order: nextOrder });
    setModalOpen(true);
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setFormError("");
    setFormData({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      thumbnail: link.thumbnail || "",
      icon: link.icon || "Globe",
      category: link.category || "General",
      buttonText: link.buttonText || "Open Link",
      type: link.type || "Custom Link",
      order: link.order || 1,
      featured: Boolean(link.featured),
      isActive: link.isActive !== undefined ? Boolean(link.isActive) : true,
      startDate: link.startDate ? new Date(link.startDate).toISOString().slice(0, 10) : "",
      endDate: link.endDate ? new Date(link.endDate).toISOString().slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim() || !formData.url.trim()) {
      setFormError("Title and destination URL are required.");
      return;
    }

    try {
      setSaving(true);
      const url = editingLink ? `/api/admin/links/${editingLink._id}` : "/api/admin/links";
      const method = editingLink ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save link");

      setModalOpen(false);
      showNotification(
        editingLink ? `Link "${formData.title}" updated!` : `Link "${formData.title}" created!`
      );
      fetchLinks();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to save link.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (link) => {
    try {
      const res = await fetch(`/api/admin/links/${link._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showNotification(
        !link.isActive ? `"${link.title}" activated!` : `"${link.title}" deactivated.`
      );
      fetchLinks();
    } catch (err) {
      console.error(err);
      showNotification("Could not update link status.");
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    const reordered = newLinks.map((l, idx) => ({ ...l, order: idx + 1 }));
    setLinks(reordered);

    try {
      await fetch("/api/admin/links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((l) => ({ id: l._id, order: l.order })),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (link) => {
    try {
      const res = await fetch(`/api/admin/links/${link._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      showNotification(`Duplicated "${link.title}"!`);
      fetchLinks();
    } catch (err) {
      console.error(err);
      showNotification("Could not duplicate link.");
    }
  };

  const handleDelete = async (link) => {
    if (!confirm(`Are you sure you want to permanently delete "${link.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/links/${link._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete link");
      showNotification(`Deleted "${link.title}".`);
      fetchLinks();
    } catch (err) {
      console.error(err);
      showNotification("Could not delete link.");
    }
  };

  // Filter links locally for high performance
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      !search ||
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      link.url.toLowerCase().includes(search.toLowerCase()) ||
      (link.description && link.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || link.category === categoryFilter;
    const matchesType = typeFilter === "all" || link.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <AdminLayout
      user={user}
      title="Link Management"
      subtitle="Bio & Destination Links"
      actions={
        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
              {notice}
            </span>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-md shadow-[#c99a55]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Link</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d1aa6b]" />
            <input
              type="text"
              placeholder="Search links by title or destination URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] pl-10 pr-4 py-2 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 focus:border-[#c99a55] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] px-3 py-2 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
            >
              <option value="all">All Link Types</option>
              {LINK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] px-3 py-2 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Links Table */}
        <div className="overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-[#041d1a]/80 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#c99a55]/15 bg-[#031513] font-mono text-[11px] uppercase tracking-wider text-[#d1aa6b]">
                <tr>
                  <th className="px-4 py-3.5 w-16">Order</th>
                  <th className="px-4 py-3.5">Link Title & Destination</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c99a55]/10">
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#f5f0e8]/50">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#c99a55] mb-2" />
                      Loading links...
                    </td>
                  </tr>
                )}

                {!loading && filteredLinks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#f5f0e8]/60">
                      <Link2 className="h-8 w-8 text-[#c99a55]/40 mx-auto mb-2" />
                      <p className="font-serif text-base text-cream">No links found</p>
                      <p className="text-xs text-[#f5f0e8]/50 mt-1">
                        Click &quot;Add New Link&quot; to create a bio destination.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredLinks.map((link, idx) => (
                    <tr
                      key={link._id}
                      className="transition-colors hover:bg-[#062623]/60 group"
                    >
                      {/* Order Controls */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs text-[#c99a55] w-5">
                            #{link.order || idx + 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(idx, "up")}
                              disabled={idx === 0}
                              className="text-[#f5f0e8]/30 hover:text-[#c99a55] disabled:opacity-20"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(idx, "down")}
                              disabled={idx === filteredLinks.length - 1}
                              className="text-[#f5f0e8]/30 hover:text-[#c99a55] disabled:opacity-20"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Title & URL */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#031513] border border-[#c99a55]/20 text-[#c99a55]">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p className="font-semibold text-[#f5f0e8] truncate group-hover:text-[#d1aa6b] transition-colors">
                              {link.title}
                            </p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#f5f0e8]/60 hover:text-white truncate mt-0.5"
                            >
                              <span className="truncate">{link.url}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded-md border border-[#c99a55]/20 bg-[#031513] px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b]">
                          {link.type}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-[#f5f0e8]/80 whitespace-nowrap">
                        {link.category}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(link)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
                            link.isActive
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-950/60 text-red-400 border border-red-500/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              link.isActive ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span>{link.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleActive(link)}
                            className={`rounded-lg p-1.5 ${
                              link.isActive ? "text-emerald-400" : "text-[#f5f0e8]/40"
                            } hover:bg-white/10`}
                            title={link.isActive ? "Deactivate" : "Activate"}
                          >
                            {link.isActive ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => openEditModal(link)}
                            className="rounded-lg p-1.5 text-[#d1aa6b] hover:bg-[#062623]"
                            title="Edit Link"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(link)}
                            className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                            title="Duplicate Link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(link)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/30"
                            title="Delete Link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT LINK MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative my-8 w-full max-w-xl rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#c99a55]/20 pb-4 mb-6">
              <h3 className="font-serif text-2xl font-semibold text-[#f5f0e8]">
                {editingLink ? "Edit Link" : "Add New Bio Link"}
              </h3>
              <p className="font-mono text-xs text-[#d1aa6b] mt-0.5">
                Unlimited Link Management
              </p>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Link Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Visit Ravion Official Website"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://... or mailto:... or tel:..."
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short note explaining where this link goes"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Link Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  >
                    <option value="Website">Website</option>
                    <option value="Work">Work</option>
                    <option value="Social">Social</option>
                    <option value="Contact">Contact</option>
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="e.g. Open Link"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded accent-[#c99a55] h-4 w-4"
                  />
                  <span className="text-xs text-[#f5f0e8] font-medium">Active (Visible on bio)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded accent-[#c99a55] h-4 w-4"
                  />
                  <span className="text-xs text-[#f5f0e8] font-medium">Featured Link</span>
                </label>
              </div>

              {/* Optional Schedule / Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c99a55]/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs text-[#f5f0e8]/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-6 py-2 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-lg shadow-[#c99a55]/20"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{editingLink ? "Update Link" : "Create Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
