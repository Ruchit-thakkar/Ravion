"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Globe,
  ImageIcon,
  Link2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const ICON_OPTIONS = [
  { value: "globe", label: "Globe / Website" },
  { value: "briefcase", label: "Briefcase / Portfolio" },
  { value: "sparkles", label: "Sparkles / Featured" },
  { value: "message-circle", label: "WhatsApp / Chat" },
  { value: "phone", label: "Phone / Call" },
  { value: "mail", label: "Mail / Email" },
  { value: "folder", label: "Folder / Project" },
  { value: "arrow-up-right", label: "Arrow / Link" },
];

function resolveIcon(iconKey) {
  switch ((iconKey || "").toLowerCase()) {
    case "globe":
    case "website":
      return <Globe size={16} />;
    case "briefcase":
    case "portfolio":
    case "samples":
      return <Briefcase size={16} />;
    case "sparkles":
    case "featured":
      return <Sparkles size={16} />;
    case "phone":
    case "call":
      return <Phone size={16} />;
    case "message-circle":
    case "whatsapp":
      return <MessageCircle size={16} />;
    case "mail":
    case "email":
      return <Mail size={16} />;
    case "folder":
      return <FolderKanban size={16} />;
    default:
      return <ArrowUpRight size={16} />;
  }
}

function renderSocialIcon(platform) {
  const p = (platform || "").toLowerCase();
  if (p === "instagram") {
    return (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (p === "whatsapp") return <MessageCircle size={14} />;
  if (p === "email" || p === "mail") return <Mail size={14} />;
  if (p === "phone" || p === "call") return <Phone size={14} />;
  if (p === "twitter" || p === "x") {
    return (
      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <Globe size={14} />;
}

export default function BioClient({ initialProfile, initialLinks, admin }) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [links, setLinks] = useState(initialLinks || []);
  const [activeTab, setActiveTab] = useState("links"); // "links" | "profile" | "seo"
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Profile saving state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  // Add / Edit Link Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkFormData, setLinkFormData] = useState({
    title: "",
    url: "",
    description: "",
    icon: "globe",
    thumbnail: "",
    isActive: true,
    isFeatured: false,
  });
  const [linkFormError, setLinkFormError] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Delete Link Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [isDeletingLink, setIsDeletingLink] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Copy public bio link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}/bio`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Save Profile Settings
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      const res = await fetch("/api/admin/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }
      setProfile(data.profile);
      setSaveSuccessMsg("Bio profile updated and synchronized successfully.");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      setSaveErrorMsg(err.message || "Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setIsUploadingAvatar(true);
    setSaveErrorMsg("");

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.uploaded?.[0]?.url) {
        throw new Error(data.error || "Failed to upload avatar image.");
      }
      const uploadedUrl = data.uploaded[0].url;
      setProfile((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
      setSaveSuccessMsg("Avatar uploaded! Remember to click Save Profile.");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      setSaveErrorMsg(err.message || "Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Open Create Link Modal
  const handleOpenAddLink = () => {
    setEditingLink(null);
    setLinkFormData({
      title: "",
      url: "",
      description: "",
      icon: "globe",
      thumbnail: "",
      isActive: true,
      isFeatured: false,
    });
    setLinkFormError("");
    setLinkModalOpen(true);
  };

  // Open Edit Link Modal
  const handleOpenEditLink = (link) => {
    setEditingLink(link);
    setLinkFormData({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      icon: link.icon || "globe",
      thumbnail: link.thumbnail || "",
      isActive: link.isActive !== false,
      isFeatured: Boolean(link.isFeatured),
    });
    setLinkFormError("");
    setLinkModalOpen(true);
  };

  // Submit Link (Create or Update)
  const handleSaveLink = async (e) => {
    e.preventDefault();
    setLinkFormError("");

    if (!linkFormData.title.trim()) {
      setLinkFormError("Link title is required.");
      return;
    }
    if (!linkFormData.url.trim()) {
      setLinkFormError("Destination URL is required.");
      return;
    }

    setIsSavingLink(true);

    try {
      const url = editingLink
        ? `/api/admin/bio/links/${editingLink._id}`
        : "/api/admin/bio/links";
      const method = editingLink ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkFormData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save link.");
      }

      if (editingLink) {
        setLinks((prev) =>
          prev.map((l) => (l._id === editingLink._id ? data.link : l))
        );
      } else {
        setLinks((prev) => [data.link, ...prev]);
      }

      setLinkModalOpen(false);
      setSaveSuccessMsg(editingLink ? "Link updated." : "New link added successfully.");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch (err) {
      setLinkFormError(err.message || "Failed to save link.");
    } finally {
      setIsSavingLink(false);
    }
  };

  // Toggle Link Active Status directly
  const handleToggleLinkActive = async (link) => {
    const updatedStatus = !link.isActive;
    try {
      const res = await fetch(`/api/admin/bio/links/${link._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l._id === link._id ? { ...l, isActive: updatedStatus } : l))
        );
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (link) => {
    setLinkToDelete(link);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Link
  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    setIsDeletingLink(true);

    try {
      const res = await fetch(`/api/admin/bio/links/${linkToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete link.");
      }

      setLinks((prev) => prev.filter((l) => l._id !== linkToDelete._id));
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      setSaveSuccessMsg("Link deleted successfully.");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.message || "Could not delete link.");
    } finally {
      setIsDeletingLink(false);
    }
  };

  // Reorder Links (Move Up / Down)
  const handleMoveOrder = async (index, direction) => {
    const newLinks = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    // Swap items
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Reassign order indices
    const updatedLinks = newLinks.map((l, idx) => ({
      ...l,
      order: idx + 1,
    }));
    setLinks(updatedLinks);

    try {
      await fetch("/api/admin/bio/links/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: updatedLinks.map((l) => ({ id: l._id, order: l.order })),
        }),
      });
    } catch (err) {
      console.error("Reorder sync error:", err);
    }
  };

  // Filtered links by search query
  const filteredLinks = links.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.url?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f5f0e8] text-[#082d2a] font-sans antialiased selection:bg-[#c99a55] selection:text-[#082d2a]">
      {/* Sidebar */}
      <AdminSidebar admin={admin} />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <AdminHeader admin={admin} title="Link in Bio Management" />

        <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-7xl">
            {/* Top Page Header */}
            <div className="flex flex-col gap-4 border-b border-[#082d2a]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#c99a55]/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b714e]">
                    PHASE 7 · COMPLETE ADMIN SYSTEM
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      profile.status === "Published"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {profile.status || "Published"}
                  </span>
                </div>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#082d2a] sm:text-4xl">
                  Link in Bio Management
                </h1>
                <p className="mt-1 text-sm text-[#082d2a]/70">
                  Manage your public link space, customize brand assets, and view changes live.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#082d2a]/20 bg-white/80 px-3.5 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:border-[#c99a55]"
                >
                  {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedUrl ? "Copied /bio URL!" : "Share /bio"}</span>
                </button>

                <Link
                  href="/bio"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#c99a55]/40 bg-white/80 px-3.5 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:border-[#c99a55]"
                >
                  <ExternalLink size={14} className="text-[#8b714e]" />
                  <span>View Public Page</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#082d2a]/20 bg-white/80 px-3.5 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-sm lg:hidden hover:border-[#c99a55]"
                >
                  <Smartphone size={14} className="text-[#8b714e]" />
                  <span>{showMobilePreview ? "Hide Preview" : "Live Phone Preview"}</span>
                </button>

                {activeTab !== "links" && (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-5 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSavingProfile ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{isSavingProfile ? "Saving Profile..." : "Save Profile"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Alerts */}
            {saveSuccessMsg && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 font-mono text-xs text-emerald-800 shadow-sm">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
            {saveErrorMsg && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-300 bg-red-50/90 p-3.5 font-mono text-xs text-red-800 shadow-sm">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* Metrics Strip */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b714e]">
                  TOTAL LINKS
                </span>
                <p className="mt-1 font-serif text-2xl font-semibold text-[#082d2a]">
                  {links.length}
                </p>
                <span className="font-mono text-[10px] text-[#082d2a]/60">configured cards</span>
              </div>

              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b714e]">
                  ACTIVE LINKS
                </span>
                <p className="mt-1 font-serif text-2xl font-semibold text-emerald-700">
                  {links.filter((l) => l.isActive).length}
                </p>
                <span className="font-mono text-[10px] text-[#082d2a]/60">visible publicly</span>
              </div>

              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b714e]">
                  PAGE STATUS
                </span>
                <p className="mt-1 font-serif text-2xl font-semibold text-[#082d2a]">
                  {profile.status || "Published"}
                </p>
                <span className="font-mono text-[10px] text-[#082d2a]/60">visibility control</span>
              </div>

              <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8b714e]">
                  PUBLIC URL
                </span>
                <p className="mt-1 font-serif text-2xl font-semibold text-[#8b714e]">
                  /bio
                </p>
                <span className="font-mono text-[10px] text-[#082d2a]/60">clean short link</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-[#082d2a]/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold transition-all ${
                  activeTab === "links"
                    ? "bg-[#082d2a] text-[#f5f0e8] shadow-md"
                    : "bg-white/80 text-[#082d2a]/70 hover:bg-white hover:text-[#082d2a]"
                }`}
              >
                <Link2 size={15} />
                <span>Links Management</span>
                <span className="rounded-full bg-[#c99a55]/30 px-2 py-0.5 text-[10px] text-[#f5f0e8]">
                  {links.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-[#082d2a] text-[#f5f0e8] shadow-md"
                    : "bg-white/80 text-[#082d2a]/70 hover:bg-white hover:text-[#082d2a]"
                }`}
              >
                <Sparkles size={15} />
                <span>Profile &amp; Branding</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold transition-all ${
                  activeTab === "seo"
                    ? "bg-[#082d2a] text-[#f5f0e8] shadow-md"
                    : "bg-white/80 text-[#082d2a]/70 hover:bg-white hover:text-[#082d2a]"
                }`}
              >
                <Share2 size={15} />
                <span>Socials &amp; SEO</span>
              </button>
            </div>

            {/* Main Content Area: Split View on Large Screens */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Management Form & Controls (7 or 8 cols on lg) */}
              <div className="lg:col-span-7 xl:col-span-8">
                {/* TAB 1: LINKS MANAGEMENT */}
                {activeTab === "links" && (
                  <div className="space-y-6">
                    {/* Search & Add Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <Search
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#082d2a]/40"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search links by title or URL..."
                          className="w-full rounded-xl border border-[#082d2a]/15 bg-white/85 py-2.5 pl-10 pr-4 text-xs text-[#082d2a] placeholder-[#082d2a]/40 shadow-sm transition-all focus:border-[#c99a55] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddLink}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-4 py-2.5 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95"
                      >
                        <Plus size={15} />
                        <span>Add New Link</span>
                      </button>
                    </div>

                    {/* Links Table / Card Stack */}
                    <div className="space-y-3">
                      {filteredLinks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#082d2a]/20 bg-white/60 p-12 text-center">
                          <Link2 size={32} className="mx-auto text-[#082d2a]/30" />
                          <h3 className="mt-3 font-serif text-base font-semibold text-[#082d2a]">
                            No links found
                          </h3>
                          <p className="mt-1 text-xs text-[#082d2a]/60">
                            {searchQuery
                              ? "No links matched your search keyword."
                              : "Get started by adding your first destination card."}
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenAddLink}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#082d2a] px-4 py-2 font-mono text-xs font-semibold text-[#f5f0e8] hover:bg-[#082d2a]/90"
                          >
                            <Plus size={13} />
                            <span>Add First Link</span>
                          </button>
                        </div>
                      ) : (
                        filteredLinks.map((link, index) => (
                          <div
                            key={link._id}
                            className={`group flex items-center justify-between gap-3.5 rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
                              link.isActive
                                ? "border-[#082d2a]/10 bg-white/90 hover:border-[#c99a55]/50 hover:shadow-md"
                                : "border-gray-200 bg-gray-50/80 opacity-70"
                            }`}
                          >
                            {/* Reorder Buttons */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveOrder(index, "up")}
                                title="Move up"
                                className="rounded p-1 text-[#082d2a]/40 hover:bg-[#082d2a]/5 hover:text-[#082d2a] disabled:opacity-20"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={index === filteredLinks.length - 1}
                                onClick={() => handleMoveOrder(index, "down")}
                                title="Move down"
                                className="rounded p-1 text-[#082d2a]/40 hover:bg-[#082d2a]/5 hover:text-[#082d2a] disabled:opacity-20"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>

                            {/* Icon or Thumbnail */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c99a55]/30 bg-[#082d2a]/5 text-[#8b714e]">
                              {link.thumbnail ? (
                                <img
                                  src={link.thumbnail}
                                  alt={link.title}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                              ) : (
                                resolveIcon(link.icon)
                              )}
                            </div>

                            {/* Middle Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif text-sm font-semibold text-[#082d2a] truncate">
                                  {link.title}
                                </h4>
                                {link.isFeatured && (
                                  <span className="rounded-full bg-[#c99a55]/20 border border-[#c99a55]/40 px-2 py-0.5 font-mono text-[9px] font-bold text-[#8b714e] uppercase">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-[11px] text-[#8b714e] truncate">
                                {link.url}
                              </p>
                              {link.description && (
                                <p className="mt-0.5 text-xs text-[#082d2a]/60 line-clamp-1">
                                  {link.description}
                                </p>
                              )}
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-2">
                              {/* Active Status Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleLinkActive(link)}
                                title={link.isActive ? "Deactivate link" : "Activate link"}
                                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold transition-all ${
                                  link.isActive
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {link.isActive ? "Active" : "Inactive"}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditLink(link)}
                                title="Edit Link"
                                className="rounded-lg p-2 text-[#082d2a]/60 hover:bg-[#082d2a]/5 hover:text-[#082d2a]"
                              >
                                <Edit3 size={15} />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(link)}
                                title="Delete Link"
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PROFILE & BRANDING */}
                {activeTab === "profile" && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-5">
                      <h3 className="font-serif text-lg font-semibold text-[#082d2a] border-b border-[#082d2a]/10 pb-3">
                        Profile Information
                      </h3>

                      {/* Display Name */}
                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Profile Display Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={profile.displayName || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, displayName: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
                          placeholder="e.g. Ravion Studio"
                        />
                      </div>

                      {/* Short Bio / Tagline */}
                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Tagline / Badge Text
                        </label>
                        <input
                          type="text"
                          value={profile.shortBio || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, shortBio: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
                          placeholder="e.g. BUILD · CREATE · INNOVATE"
                        />
                      </div>

                      {/* Professional Title */}
                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Professional Subtitle / Role
                        </label>
                        <input
                          type="text"
                          value={profile.title || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
                          placeholder="e.g. Creative Designer & Digital Builder"
                        />
                      </div>

                      {/* Bio Description */}
                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Bio Paragraph Description
                        </label>
                        <textarea
                          rows={3}
                          value={profile.description || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, description: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none focus:ring-1 focus:ring-[#c99a55]"
                          placeholder="Elevated digital experiences, high-converting websites, creative content..."
                        />
                      </div>

                      {/* Avatar Image & Upload */}
                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Profile Avatar Image
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#c99a55] bg-[#082d2a]/10 shadow-sm">
                            {profile.avatarUrl ? (
                              <img
                                src={profile.avatarUrl}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-mono text-[#082d2a]/50">
                                None
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={profile.avatarUrl || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, avatarUrl: e.target.value }))
                              }
                              placeholder="https://ik.imagekit.io/... or image URL"
                              className="w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#082d2a]/20 bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-[#082d2a] hover:bg-gray-50">
                                <Upload size={12} />
                                <span>{isUploadingAvatar ? "Uploading..." : "Upload New Image"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
                                  }}
                                />
                              </label>
                              <span className="text-[10.5px] text-[#082d2a]/50">
                                Powered by ImageKit
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status / Visibility */}
                      <div className="pt-2">
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Page Visibility Status
                        </label>
                        <div className="mt-2 flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="Published"
                              checked={profile.status === "Published"}
                              onChange={() =>
                                setProfile((prev) => ({ ...prev, status: "Published" }))
                              }
                              className="accent-[#c99a55]"
                            />
                            <span className="text-xs font-medium text-[#082d2a]">
                              Published (Live Publicly on /bio)
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="Draft"
                              checked={profile.status === "Draft"}
                              onChange={() =>
                                setProfile((prev) => ({ ...prev, status: "Draft" }))
                              }
                              className="accent-[#c99a55]"
                            />
                            <span className="text-xs font-medium text-[#082d2a]">
                              Draft (Private / Under Crafting)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Footer Text */}
                      <div className="pt-2">
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Footer Copyright Text
                        </label>
                        <input
                          type="text"
                          value={profile.footerText || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, footerText: e.target.value }))
                          }
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none"
                          placeholder="e.g. © 2026 Ravion. Crafted with passion and imagination."
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-6 py-3 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                      >
                        {isSavingProfile ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        <span>{isSavingProfile ? "Saving Profile..." : "Save Profile Settings"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: SOCIALS & SEO */}
                {activeTab === "seo" && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Social Media Links */}
                    <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4">
                      <h3 className="font-serif text-lg font-semibold text-[#082d2a] border-b border-[#082d2a]/10 pb-3">
                        Social Media Channels
                      </h3>
                      <p className="text-xs text-[#082d2a]/70">
                        These channels appear as circular icon buttons directly beneath your profile bio.
                      </p>

                      <div className="space-y-3 pt-2">
                        {["instagram", "whatsapp", "email", "website", "twitter"].map((platform) => {
                          const existingSocial = (profile.socialLinks || []).find(
                            (s) => s.platform.toLowerCase() === platform
                          ) || { url: "", isActive: true };

                          return (
                            <div
                              key={platform}
                              className="flex items-center gap-3 rounded-xl border border-[#082d2a]/10 bg-white p-3 shadow-sm"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#082d2a]/5 text-[#8b714e]">
                                {renderSocialIcon(platform)}
                              </div>
                              <span className="w-24 font-mono text-xs font-semibold capitalize text-[#082d2a]">
                                {platform}
                              </span>
                              <input
                                type="text"
                                value={existingSocial.url || ""}
                                onChange={(e) => {
                                  const updated = [...(profile.socialLinks || [])];
                                  const idx = updated.findIndex((s) => s.platform.toLowerCase() === platform);
                                  if (idx >= 0) {
                                    updated[idx] = { ...updated[idx], url: e.target.value };
                                  } else {
                                    updated.push({
                                      platform,
                                      label: platform,
                                      url: e.target.value,
                                      isActive: true,
                                    });
                                  }
                                  setProfile((prev) => ({ ...prev, socialLinks: updated }));
                                }}
                                placeholder={`Enter ${platform} URL or handle...`}
                                className="flex-1 rounded-lg border border-[#082d2a]/15 bg-white p-2 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SEO Metadata */}
                    <div className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-4">
                      <h3 className="font-serif text-lg font-semibold text-[#082d2a] border-b border-[#082d2a]/10 pb-3">
                        Search Engine &amp; Social Sharing (SEO)
                      </h3>

                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          SEO Title Tag
                        </label>
                        <input
                          type="text"
                          value={profile.seo?.title || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              seo: { ...(prev.seo || {}), title: e.target.value },
                            }))
                          }
                          placeholder="e.g. Ravion — Bio & Digital Space"
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          SEO Meta Description
                        </label>
                        <textarea
                          rows={2}
                          value={profile.seo?.description || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              seo: { ...(prev.seo || {}), description: e.target.value },
                            }))
                          }
                          placeholder="Elevated digital experiences, high-converting websites..."
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                          Social Share OG Image URL
                        </label>
                        <input
                          type="text"
                          value={profile.seo?.ogImage || ""}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              seo: { ...(prev.seo || {}), ogImage: e.target.value },
                            }))
                          }
                          placeholder="https://ik.imagekit.io/... or image URL"
                          className="mt-1.5 w-full rounded-xl border border-[#082d2a]/15 bg-white p-3 text-xs text-[#082d2a] shadow-sm focus:border-[#c99a55] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-6 py-3 font-mono text-xs font-semibold text-[#082d2a] shadow-md transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                      >
                        {isSavingProfile ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        <span>{isSavingProfile ? "Saving Changes..." : "Save SEO & Social Settings"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Live Phone Mockup Preview (Sticky on Desktop) */}
              <div
                className={`lg:col-span-5 xl:col-span-4 ${
                  showMobilePreview ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" : "hidden lg:block"
                }`}
              >
                <div className="sticky top-8">
                  {/* Close button for mobile popup */}
                  {showMobilePreview && (
                    <button
                      type="button"
                      onClick={() => setShowMobilePreview(false)}
                      className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#082d2a] shadow-lg lg:hidden"
                    >
                      <X size={20} />
                    </button>
                  )}

                  {/* Phone Bezel */}
                  <div className="relative mx-auto w-full max-w-[340px] rounded-[42px] border-[10px] border-[#082d2a] bg-[#031513] p-3 shadow-2xl ring-1 ring-[#c99a55]/40">
                    {/* Speaker slit & camera */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#082d2a] border border-[#082d2a]/80" />
                      <div className="h-1.5 w-12 rounded-full bg-[#082d2a]" />
                    </div>

                    {/* Phone Inner Screen */}
                    <div className="h-[580px] overflow-y-auto rounded-[32px] bg-[#031513] px-3.5 pt-8 pb-6 text-[#f5f0e8] scrollbar-thin scrollbar-thumb-[#c99a55]/30">
                      {/* Avatar */}
                      <div className="flex flex-col items-center text-center">
                        <div className="relative h-18 w-18 overflow-hidden rounded-full border-2 border-[#c99a55] bg-[#082d2a] shadow-md">
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt="Live Preview Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-[#c99a55]">
                              {profile.displayName?.charAt(0) || "R"}
                            </div>
                          )}
                        </div>

                        {/* Tagline Badge */}
                        <div className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-[#c99a55]/30 bg-[#082d2a]/80 px-2.5 py-0.5">
                          <Sparkles size={9} className="text-[#c99a55]" />
                          <span className="font-mono text-[9px] font-semibold text-[#c99a55] uppercase">
                            {profile.shortBio || "BUILD · CREATE"}
                          </span>
                        </div>

                        <h4 className="mt-1.5 font-serif text-lg font-semibold text-[#f5f0e8]">
                          {profile.displayName || "Ravion"}
                        </h4>
                        <p className="font-mono text-[10px] text-[#c99a55]/90">
                          {profile.title || "Creative Designer"}
                        </p>

                        {/* Social Icons Bar */}
                        {profile.socialLinks && profile.socialLinks.length > 0 && (
                          <div className="mt-2.5 flex items-center justify-center gap-2">
                            {profile.socialLinks
                              .filter((s) => s.isActive !== false && s.url)
                              .map((s, idx) => (
                                <div
                                  key={idx}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c99a55]/30 bg-[#082d2a]/80 text-[#f5f0e8]"
                                >
                                  {renderSocialIcon(s.platform)}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Live Links */}
                      <div className="mt-5 space-y-2.5">
                        {links
                          .filter((l) => l.isActive)
                          .map((l) => (
                            <div
                              key={l._id}
                              className={`flex items-center justify-between gap-2.5 rounded-xl p-2.5 transition-all ${
                                l.isFeatured
                                  ? "border border-[#c99a55] bg-gradient-to-r from-[#c99a55]/20 to-[#082d2a]"
                                  : "border border-[#c99a55]/20 bg-[#082d2a]/80"
                              }`}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#c99a55]/20 bg-[#031513]/50 text-[#c99a55]">
                                {resolveIcon(l.icon)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-serif text-xs font-semibold text-[#f5f0e8] truncate">
                                    {l.title}
                                  </p>
                                  {l.isFeatured && (
                                    <span className="rounded bg-[#c99a55]/30 px-1 py-0.2 font-mono text-[7px] text-[#c99a55] uppercase">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                {l.description && (
                                  <p className="text-[10px] text-[#f5f0e8]/60 truncate">
                                    {l.description}
                                  </p>
                                )}
                              </div>
                              <ArrowUpRight size={13} className="shrink-0 text-[#c99a55]" />
                            </div>
                          ))}
                      </div>

                      {/* Footer in phone */}
                      <div className="mt-6 text-center">
                        <span className="font-mono text-[9px] text-[#c99a55]/60">
                          {profile.footerText || "Crafted by Ravion"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center font-mono text-[11px] text-[#082d2a]/50">
                    Live Mobile Phone Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT LINK */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082d2a]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#082d2a]/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#082d2a]/10 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#082d2a]">
                {editingLink ? "Edit Destination Link" : "Add New Destination Link"}
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="rounded-lg p-1.5 text-[#082d2a]/50 hover:bg-[#082d2a]/5 hover:text-[#082d2a]"
              >
                <X size={18} />
              </button>
            </div>

            {linkFormError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-2.5 font-mono text-xs text-red-800">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{linkFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLink} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                  Link Title *
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.title}
                  onChange={(e) =>
                    setLinkFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Visit Official Website"
                  className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.url}
                  onChange={(e) =>
                    setLinkFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://... or /samples or mailto:... or tel:..."
                  className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                  Subtitle / Description (Optional)
                </label>
                <input
                  type="text"
                  value={linkFormData.description}
                  onChange={(e) =>
                    setLinkFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. Explore bespoke digital craftsmanship & portfolio"
                  className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                    Display Icon
                  </label>
                  <select
                    value={linkFormData.icon}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-semibold text-[#082d2a]">
                    Thumbnail Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkFormData.thumbnail}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, thumbnail: e.target.value }))
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-xs text-[#082d2a] focus:border-[#c99a55] focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkFormData.isActive}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="rounded accent-[#c99a55]"
                  />
                  <span className="font-mono text-xs text-[#082d2a]">
                    Active (Visible Publicly)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkFormData.isFeatured}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="rounded accent-[#c99a55]"
                  />
                  <span className="font-mono text-xs text-[#8b714e]">
                    Highlight as Featured
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#082d2a]/10 pt-4">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="rounded-xl border border-[#082d2a]/20 px-4 py-2 font-mono text-xs font-semibold text-[#082d2a] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c99a55] to-[#dfb77b] px-5 py-2 font-mono text-xs font-semibold text-[#082d2a] shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  {isSavingLink ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{isSavingLink ? "Saving..." : editingLink ? "Update Link" : "Create Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE LINK */}
      {deleteModalOpen && linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082d2a]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#082d2a]/10 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#082d2a]">
              Delete Destination Link?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#082d2a]/70">
              Are you sure you want to delete <span className="font-semibold text-[#082d2a]">&ldquo;{linkToDelete.title}&rdquo;</span>? This link will immediately be removed from the public Link in Bio page.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-xl border border-[#082d2a]/20 px-4 py-2 font-mono text-xs font-semibold text-[#082d2a] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingLink}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isDeletingLink ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>{isDeletingLink ? "Deleting..." : "Delete Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
