"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Archive,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  Upload,
  Loader2,
  X,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ProductsClient({ user }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters & State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter criteria
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "all"); // "all" | "digital" | "affiliate"
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");

  // Modal / Drawer state for Add/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  // Product Form Data
  const defaultFormData = {
    title: "",
    slug: "",
    type: "digital", // "digital" | "affiliate"
    category: "Digital Products",
    shortDescription: "",
    fullDescription: "",
    thumbnail: "",
    previewImages: [],
    price: 0,
    originalPrice: "",
    currency: "INR",
    deliveryMethod: "external", // "external" | "file"
    purchaseUrl: "",
    fileUrl: "",
    affiliateUrl: "",
    originalUrl: "",
    tags: "",
    featured: false,
    status: "Draft", // "Draft" | "Published" | "Archived"
    seo: { title: "", description: "", keywords: "" },
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Check URL params on mount (e.g. ?action=new-digital or ?action=new-affiliate)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new-digital") {
      openAddModal("digital");
    } else if (action === "new-affiliate") {
      openAddModal("affiliate");
    }
  }, [searchParams]);

  // Load products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [activeTab, statusFilter, categoryFilter, page, searchQuery]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeTab !== "all") query.set("type", activeTab);
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (categoryFilter !== "all") query.set("category", categoryFilter);
      if (searchQuery) query.set("search", searchQuery);
      query.set("page", page.toString());
      query.set("limit", "20");

      const res = await fetch(`/api/admin/products?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();

      setProducts(data.products || []);
      if (data.pagination) {
        setTotalCount(data.pagination.total || 0);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showNotification("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for new product
  const openAddModal = (preferredType = "digital") => {
    setEditingProduct(null);
    setFormError("");
    setFormData({
      ...defaultFormData,
      type: preferredType,
      category: preferredType === "affiliate" ? "Affiliate Picks" : "Digital Products",
    });
    setModalOpen(true);
  };

  // Open modal for editing product
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormError("");
    setFormData({
      title: prod.title || "",
      slug: prod.slug || "",
      type: prod.type || "digital",
      category: prod.category || "General",
      shortDescription: prod.shortDescription || "",
      fullDescription: prod.fullDescription || "",
      thumbnail: prod.thumbnail || "",
      previewImages: prod.previewImages || [],
      price: prod.price ?? 0,
      originalPrice: prod.originalPrice || "",
      currency: prod.currency || "INR",
      deliveryMethod: prod.deliveryMethod || "external",
      purchaseUrl: prod.purchaseUrl || "",
      fileUrl: prod.fileUrl || "",
      affiliateUrl: prod.affiliateUrl || "",
      originalUrl: prod.originalUrl || "",
      tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
      featured: Boolean(prod.featured),
      status: prod.status || "Draft",
      seo: {
        title: prod.seo?.title || prod.title || "",
        description: prod.seo?.description || prod.shortDescription || "",
        keywords: prod.seo?.keywords || "",
      },
    });
    setModalOpen(true);
  };

  // Upload Thumbnail to ImageKit
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append("files", file);

      const res = await fetch("/api/uploads", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      const uploadedUrl = result.media?.[0]?.url || result.images?.[0]?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: uploadedUrl,
          previewImages: prev.previewImages.length ? prev.previewImages : [uploadedUrl],
        }));
        showNotification("Product thumbnail uploaded to ImageKit!");
      }
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save (Create or Update) Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Product title is required.");
      return;
    }

    if (formData.type === "affiliate" && !formData.affiliateUrl.trim()) {
      setFormError("Affiliate URL is required for affiliate products.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      setModalOpen(false);
      showNotification(
        editingProduct
          ? `Product "${formData.title}" updated!`
          : `Product "${formData.title}" created successfully!`
      );
      fetchProducts();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Quick Action: Toggle Status (Publish / Unpublish)
  const handleToggleStatus = async (prod) => {
    const nextStatus = prod.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to change status");
      showNotification(
        nextStatus === "Published"
          ? `"${prod.title}" is now published!`
          : `"${prod.title}" unpublished (set to draft).`
      );
      fetchProducts();
    } catch (err) {
      console.error(err);
      showNotification("Could not update status.");
    }
  };

  // Quick Action: Duplicate
  const handleDuplicate = async (prod) => {
    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (!res.ok) throw new Error("Failed to duplicate product");
      showNotification(`Duplicated "${prod.title}" as draft!`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showNotification("Could not duplicate product.");
    }
  };

  // Quick Action: Archive
  const handleArchive = async (prod) => {
    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Archived" }),
      });
      if (!res.ok) throw new Error("Failed to archive product");
      showNotification(`Archived "${prod.title}".`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showNotification("Could not archive product.");
    }
  };

  // Quick Action: Delete
  const handleDelete = async (prod) => {
    if (!confirm(`Are you sure you want to permanently delete "${prod.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      showNotification(`Deleted "${prod.title}".`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showNotification("Could not delete product.");
    }
  };

  return (
    <AdminLayout
      user={user}
      title="Products Management"
      subtitle="Digital & Affiliate Store"
      actions={
        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
              {notice}
            </span>
          )}

          <button
            onClick={() => openAddModal("digital")}
            className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-3.5 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-md shadow-[#c99a55]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Digital</span>
          </button>

          <button
            onClick={() => openAddModal("affiliate")}
            className="flex items-center gap-1.5 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3 py-1.5 text-xs font-semibold text-[#d1aa6b] hover:border-[#c99a55] transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Add Affiliate</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c99a55]/15 pb-4">
          <div className="flex rounded-xl border border-[#c99a55]/20 bg-[#041d1a] p-1">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === "all"
                  ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveTab("digital");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === "digital"
                  ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Digital Products</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("affiliate");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === "affiliate"
                  ? "bg-[#c99a55] text-[#031513] font-semibold shadow"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Affiliate Products</span>
            </button>
          </div>

          {/* Quick Stats on Active Tab */}
          <span className="font-mono text-xs text-[#d1aa6b]">
            Total {totalCount} product{totalCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d1aa6b]" />
            <input
              type="text"
              placeholder="Search products by title, tag, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] pl-10 pr-4 py-2 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 focus:border-[#c99a55] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] px-3 py-2 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
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

        {/* Products Table */}
        <div className="overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-[#041d1a]/80 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#c99a55]/15 bg-[#031513] font-mono text-[11px] uppercase tracking-wider text-[#d1aa6b]">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c99a55]/10">
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#f5f0e8]/50">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#c99a55] mb-2" />
                      Loading products...
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#f5f0e8]/60">
                      <Package className="h-8 w-8 text-[#c99a55]/40 mx-auto mb-2" />
                      <p className="font-serif text-base text-cream">No products found</p>
                      <p className="text-xs text-[#f5f0e8]/50 mt-1">
                        Try adjusting your search filters or click &quot;Add Product&quot; to create one.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((prod) => (
                    <tr
                      key={prod._id}
                      className="transition-colors hover:bg-[#062623]/60 group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-[#031513] overflow-hidden border border-[#c99a55]/20 shrink-0">
                            <img
                              src={prod.thumbnail || "/assets/ravion-logo.png"}
                              alt={prod.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-medium text-[#f5f0e8] truncate group-hover:text-[#d1aa6b] transition-colors">
                              {prod.title}
                            </p>
                            <p className="font-mono text-[10px] text-[#f5f0e8]/50 truncate mt-0.5">
                              /{prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-[#f5f0e8]/80 whitespace-nowrap">
                        {prod.category}
                      </td>

                      {/* Product Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                            prod.type === "affiliate"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {prod.type === "affiliate" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <Package className="h-3 w-3" />
                          )}
                          <span>{prod.type}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-mono text-xs text-[#f5f0e8] whitespace-nowrap">
                        {prod.price > 0 ? (
                          <span>
                            {prod.currency} {prod.price}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Free</span>
                        )}
                      </td>

                      {/* Publication Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                            prod.status === "Published"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : prod.status === "Draft"
                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                              : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                          }`}
                        >
                          <span>{prod.status}</span>
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3.5 font-mono text-[10px] text-[#f5f0e8]/50 whitespace-nowrap">
                        {new Date(prod.updatedAt || prod.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewProduct(prod)}
                            className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                            title="Preview Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(prod)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              prod.status === "Published"
                                ? "text-emerald-400 hover:bg-emerald-950/40"
                                : "text-orange-400 hover:bg-orange-950/40"
                            }`}
                            title={prod.status === "Published" ? "Unpublish" : "Publish"}
                          >
                            {prod.status === "Published" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => openEditModal(prod)}
                            className="rounded-lg p-1.5 text-[#d1aa6b] hover:bg-[#062623]"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleArchive(prod)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10"
                            title="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-950/30"
                            title="Delete"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#c99a55]/15 bg-[#031513] px-4 py-3 text-xs">
              <span className="font-mono text-[#f5f0e8]/60">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-[#c99a55]/20 px-2.5 py-1 text-xs text-[#f5f0e8] disabled:opacity-30 hover:border-[#c99a55]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-[#c99a55]/20 px-2.5 py-1 text-xs text-[#f5f0e8] disabled:opacity-30 hover:border-[#c99a55]"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#c99a55]/20 pb-4 mb-6">
              <h3 className="font-serif text-2xl font-semibold text-[#f5f0e8]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="font-mono text-xs text-[#d1aa6b] mt-0.5">
                {formData.type === "affiliate"
                  ? "Affiliate Recommendation Configuration"
                  : "Digital Download & Guide Configuration"}
              </p>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-5 text-xs">
              {/* Product Type Toggle */}
              <div className="rounded-xl border border-[#c99a55]/20 bg-[#031513] p-1 flex">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "digital",
                      category: "Digital Products",
                    })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-medium transition-all ${
                    formData.type === "digital"
                      ? "bg-[#c99a55] text-[#031513] font-semibold"
                      : "text-[#f5f0e8]/70 hover:text-white"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span>Digital Product (Ebook, Template, File)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "affiliate",
                      category: "Affiliate Picks",
                    })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-medium transition-all ${
                    formData.type === "affiliate"
                      ? "bg-[#c99a55] text-[#031513] font-semibold"
                      : "text-[#f5f0e8]/70 hover:text-white"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Affiliate Product (Amazon, Partner)</span>
                </button>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Creator Content Strategy Playbook"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Product Slug (URL path)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-blank"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded accent-[#c99a55] h-4 w-4"
                    />
                    <span className="text-xs text-[#f5f0e8] font-medium">Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Pricing (Free or Paid) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Price (0 for Free)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="For strike-through discount"
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Catchy 1-line description"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Full Description & Details
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed breakdown of features, contents, specs..."
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Product Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  {formData.thumbnail && (
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-[#c99a55]/30 bg-[#031513] shrink-0">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3.5 py-2 text-xs font-medium text-[#d1aa6b] hover:border-[#c99a55]">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>Upload to ImageKit</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste external image URL..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="flex-1 rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-xs text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                  />
                </div>
              </div>

              {/* DIGITAL PRODUCT SPECIFICS: Delivery Method */}
              {formData.type === "digital" && (
                <div className="rounded-2xl border border-[#c99a55]/20 bg-[#031513]/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#d1aa6b]">
                      Digital Fulfillment Method
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label
                      onClick={() => setFormData({ ...formData, deliveryMethod: "external" })}
                      className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-1 transition-all ${
                        formData.deliveryMethod === "external"
                          ? "border-[#c99a55] bg-[#062623]"
                          : "border-white/10 bg-[#031513]"
                      }`}
                    >
                      <span className="font-semibold text-xs text-cream">Method A: Gumroad / Checkout</span>
                      <span className="text-[11px] text-[#f5f0e8]/60">Directs customer to checkout link</span>
                    </label>

                    <label
                      onClick={() => setFormData({ ...formData, deliveryMethod: "file" })}
                      className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-1 transition-all ${
                        formData.deliveryMethod === "file"
                          ? "border-[#c99a55] bg-[#062623]"
                          : "border-white/10 bg-[#031513]"
                      }`}
                    >
                      <span className="font-semibold text-xs text-cream">Method B: Direct Download</span>
                      <span className="text-[11px] text-[#f5f0e8]/60">Secure digital delivery from cloud</span>
                    </label>
                  </div>

                  {formData.deliveryMethod === "external" ? (
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                        Gumroad or Checkout URL
                      </label>
                      <input
                        type="url"
                        value={formData.purchaseUrl}
                        onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                        placeholder="https://gumroad.com/l/your-product"
                        className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                        Downloadable File URL (ImageKit or Cloud Storage)
                      </label>
                      <input
                        type="url"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        placeholder="https://ik.imagekit.io/ruchit/..."
                        className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* AFFILIATE PRODUCT SPECIFICS: Affiliate URL & Disclosure */}
              {formData.type === "affiliate" && (
                <div className="rounded-2xl border border-emerald-500/25 bg-[#031513]/60 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-emerald-300">
                      Affiliate Monetization Settings
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Affiliate Destination URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.affiliateUrl}
                      onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                      placeholder="https://amazon.in/dp/...?tag=your-affiliate-tag"
                      className="w-full rounded-xl border border-emerald-500/30 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                      Original Product URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.originalUrl}
                      onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                      placeholder="https://manufacturer.com/..."
                      className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                    />
                  </div>

                  <p className="rounded-lg bg-emerald-950/30 p-2.5 text-[11px] text-emerald-300/80 italic border border-emerald-500/20">
                    Compliance Notice: Visitors clicking this item will be redirected with clear affiliate disclosure (&quot;I may earn a commission from qualifying purchases...&quot;) and open in a new tab.
                  </p>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#d1aa6b] mb-1">
                  Product Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. Next.js, Figma, Camera, Free"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#031513] px-3.5 py-2 text-sm text-[#f5f0e8] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              {/* SEO Settings */}
              <div className="rounded-2xl border border-[#c99a55]/15 bg-[#031513]/40 p-4 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#d1aa6b]">
                  SEO & Social Sharing Metadata
                </span>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#f5f0e8]/70 mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#031513] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#f5f0e8]/70 mb-1">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    value={formData.seo.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, description: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#031513] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
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
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingProduct ? "Update Product" : "Publish Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute right-4 top-4 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-44 w-full rounded-2xl bg-[#031513] overflow-hidden border border-[#c99a55]/20">
              <img
                src={previewProduct.thumbnail || "/assets/ravion-logo.png"}
                alt={previewProduct.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#dfb77b] uppercase">
                {previewProduct.category} · {previewProduct.type}
              </span>
              <h3 className="font-serif text-xl font-bold text-cream mt-0.5">
                {previewProduct.title}
              </h3>
              <p className="mt-1 text-xs text-cream/75 leading-relaxed">
                {previewProduct.fullDescription || previewProduct.shortDescription}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#c99a55]/15">
              <span className="font-mono text-sm font-bold text-[#c99a55]">
                {previewProduct.price > 0
                  ? `${previewProduct.currency} ${previewProduct.price}`
                  : "Free"}
              </span>

              {previewProduct.type === "affiliate" ? (
                <a
                  href={previewProduct.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#c99a55] px-3.5 py-1.5 text-xs font-semibold text-[#031513]"
                >
                  <span>Affiliate Store</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : previewProduct.purchaseUrl ? (
                <a
                  href={previewProduct.purchaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#c99a55] px-3.5 py-1.5 text-xs font-semibold text-[#031513]"
                >
                  <span>Checkout</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="font-mono text-xs text-emerald-400">Direct Download</span>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
