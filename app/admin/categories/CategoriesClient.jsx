"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Link2,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Save,
  Layers,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CategoriesClient({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "Folder" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "Folder" });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
      icon: cat.icon || "Folder",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category.");

        showNotification(`Category "${formData.name}" updated!`);
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category.");

        showNotification(`Category "${formData.name}" created!`);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not delete category.");
        return;
      }

      showNotification(`Category "${cat.name}" deleted.`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Could not delete category.");
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout
      user={user}
      title="Category Management"
      subtitle="Taxonomies across Products & Links"
      actions={
        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
              {notice}
            </span>
          )}

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-md shadow-[#c99a55]/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Category</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d1aa6b]" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] pl-10 pr-4 py-2 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 focus:border-[#c99a55] focus:outline-none"
          />
        </div>

        {/* Categories Grid */}
        {loading && (
          <div className="p-16 text-center text-[#f5f0e8]/50">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#c99a55] mb-2" />
            Loading categories...
          </div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <div className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/60 p-12 text-center">
            <Tags className="h-8 w-8 text-[#c99a55]/40 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-semibold text-cream">No categories found</h3>
            <p className="text-xs text-[#f5f0e8]/60 mt-1">
              Create a category to group products, portfolio samples, and links.
            </p>
          </div>
        )}

        {!loading && filteredCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="group rounded-2xl border border-[#c99a55]/20 bg-[#041d1a] p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-[#c99a55]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-cream group-hover:text-[#d1aa6b] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="font-mono text-[10px] text-[#f5f0e8]/50 mt-0.5">
                      /{cat.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="rounded-lg p-1.5 text-[#d1aa6b] hover:bg-[#062623]"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/40"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-[#f5f0e8]/75 line-clamp-2 leading-relaxed">
                  {cat.description || "No description provided."}
                </p>

                {/* Usage Statistics Badge */}
                <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#c99a55]/15 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-[#d1aa6b]">
                    <Package className="h-3 w-3" />
                    <span>{cat.productCount || 0} products</span>
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1 text-[#d1aa6b]">
                    <Link2 className="h-3 w-3" />
                    <span>{cat.linkCount || 0} links</span>
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1 text-[#d1aa6b]">
                    <FolderKanban className="h-3 w-3" />
                    <span>{cat.sampleCount || 0} samples</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#c99a55]/20 pb-3">
              <h3 className="font-serif text-xl font-semibold text-cream">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <p className="font-mono text-xs text-[#d1aa6b] mt-0.5">
                Organize Products & Links
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Design Systems"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short note about what items belong in this category"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c99a55]/15">
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
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-5 py-2 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
