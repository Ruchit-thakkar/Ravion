"use client";

import { useEffect, useState } from "react";
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
  Layers,
  Sparkles,
} from "lucide-react";

export default function CategoriesClient({ user }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const displayName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Admin";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      setActionNotice("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name || "", description: cat.description || "" });
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
        // Edit existing
        const res = await fetch(`/api/admin/categories/${editingCategory._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category.");

        setCategories((prev) =>
          prev.map((c) => (c._id === editingCategory._id ? { ...c, ...data.category } : c))
        );
        setActionNotice(`Category "${formData.name}" updated successfully.`);
      } else {
        // Create new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category.");

        setCategories((prev) => [...prev, data.category]);
        setActionNotice(`Category "${formData.name}" created successfully.`);
      }

      setModalOpen(false);
      setTimeout(() => setActionNotice(""), 3500);
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete category.");

      setCategories((prev) => prev.filter((c) => c._id !== id));
      setActionNotice(`Category "${name}" deleted.`);
      setTimeout(() => setActionNotice(""), 3500);
    } catch (err) {
      console.error(err);
      setActionNotice("Could not delete category.");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, active: false },
    { name: "Inquiry", href: "/admin/inquiry", icon: MailCheck, active: false },
    { name: "Samples", href: "/admin/samples", icon: FolderKanban, active: false },
    { name: "Categories", href: "/admin/categories", icon: Tags, active: true },
    { name: "Services", href: "#", icon: Briefcase, active: false, badge: "Phase 2" },
    { name: "Settings", href: "#", icon: Settings, active: false, badge: "Phase 2" },
  ];

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      c.name?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q)
    );
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
                Categories
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

        {/* Categories Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-10">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header info & Add Button */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f5f0e8]">
                  Portfolio Categories
                </h2>
                <p className="mt-1 text-xs text-[#f5f0e8]/60">
                  Manage categories shown on the portfolio and samples pages.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#f5f0e8]/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories…"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#062623]/70 py-2 pl-9 pr-3 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 outline-none transition-colors focus:border-[#c99a55]"
                  />
                </div>

                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c99a55] px-4 py-2.5 text-xs font-semibold text-[#031513] shadow-lg transition-all hover:bg-[#d5ad6d] active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {actionNotice && (
              <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-3.5 text-xs font-mono text-[#d1aa6b]">
                {actionNotice}
              </div>
            )}

            {/* Content list */}
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-[#c99a55]/15 bg-[#062623]/30">
                <Loader2 className="h-6 w-6 animate-spin text-[#d1aa6b]" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-[#c99a55]/15 bg-[#062623]/40 p-10 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c99a55]/20 bg-[#c99a55]/10 text-[#d1aa6b]">
                  <Tags className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#f5f0e8]">
                  No categories found
                </h3>
                <p className="mt-2 text-xs text-[#f5f0e8]/50">
                  {search
                    ? "No categories matching your search query."
                    : "Create your first category by clicking 'Add Category'."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="group flex flex-col justify-between rounded-2xl border border-[#c99a55]/20 bg-[#062623]/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/50"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c99a55]/15 text-[#d1aa6b] border border-[#c99a55]/20">
                            <Tags className="h-4 w-4" />
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-[#f5f0e8]">
                            {cat.name}
                          </h3>
                        </div>

                        <span className="rounded border border-[#c99a55]/20 bg-[#041a18] px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b]">
                          {cat.sampleCount || 0} work
                        </span>
                      </div>

                      <p className="mt-2 font-mono text-[11px] text-[#d1aa6b]/70">
                        slug: /{cat.slug}
                      </p>

                      <p className="mt-2 text-xs leading-relaxed text-[#f5f0e8]/70">
                        {cat.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#c99a55]/10 pt-3">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#c99a55]/20 bg-[#041a18] px-3 py-1.5 text-xs text-[#d1aa6b] transition-colors hover:bg-[#c99a55]/20 hover:text-white"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-900/30"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Category Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#c99a55]/15 pb-4">
              <h3 className="font-serif text-xl font-semibold text-[#f5f0e8]">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#f5f0e8]/50 hover:bg-[#062623] hover:text-[#f5f0e8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 3D & Motion Design"
                  className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 outline-none transition-colors focus:border-[#c99a55]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#d1aa6b] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this portfolio category..."
                  className="w-full rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3.5 py-2.5 text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 outline-none transition-colors focus:border-[#c99a55]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-[#f5f0e8]/60 hover:text-[#f5f0e8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c99a55] px-5 py-2 text-xs font-semibold text-[#031513] transition-all hover:bg-[#d5ad6d] active:scale-95 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
