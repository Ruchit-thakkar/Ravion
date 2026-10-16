"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function WhatsAppIcon({ size = 15, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

const STATUS_CONFIG = {
  new: {
    label: "New",
    color: "bg-amber-50 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
  },
  read: {
    label: "Read",
    color: "bg-sky-50 text-sky-800 border-sky-300",
    dot: "bg-sky-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-indigo-50 text-indigo-800 border-indigo-300",
    dot: "bg-indigo-500",
  },
  resolved: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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

export default function InquiriesClient({
  initialInquiries = [],
  initialCounts = { total: 0, new: 0, read: 0, inProgress: 0, resolved: 0 },
  initialPagination = { page: 1, limit: 25, totalFiltered: 0, totalPages: 1 },
  admin,
}) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [counts, setCounts] = useState(initialCounts);
  const [pagination, setPagination] = useState(initialPagination);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "new", "read", "in_progress", "resolved"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest"

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Detail Modal & Action State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch inquiries from API
  const fetchInquiries = useCallback(
    async (overrideStatus, overrideQuery, overrideSort) => {
      setIsLoading(true);
      setStatusMessage({ type: "", text: "" });

      const activeStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const activeQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
      const activeSort = overrideSort !== undefined ? overrideSort : sortBy;

      try {
        const params = new URLSearchParams();
        if (activeStatus && activeStatus !== "all") params.set("status", activeStatus);
        if (activeQuery) params.set("q", activeQuery);
        if (activeSort) params.set("sortBy", activeSort);
        params.set("limit", "50");

        const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load inquiries.");
        }

        setInquiries(data.inquiries || []);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setPagination(data.pagination);

        // Keep selectedInquiry in sync if modal is open
        if (selectedInquiry) {
          const updated = (data.inquiries || []).find((i) => i._id === selectedInquiry._id);
          if (updated) setSelectedInquiry(updated);
        }
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to fetch inquiries. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, searchQuery, sortBy, selectedInquiry]
  );

  // Handle status filter click
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchInquiries(status, searchQuery, sortBy);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries(statusFilter, searchQuery, sortBy);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchInquiries(statusFilter, "", sortBy);
  };

  // Status Change (PATCH)
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    if (!inquiryId || !newStatus) return;
    setIsUpdatingStatus(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      // Update local state smoothly
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiryId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
        )
      );

      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }

      // Refresh counts
      fetchInquiries();

      setStatusMessage({
        type: "success",
        text: `Inquiry status changed to "${STATUS_CONFIG[newStatus]?.label || newStatus}".`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Could not update inquiry status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Inquiry (DELETE)
  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryToDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete inquiry.");
      }

      setInquiries((prev) => prev.filter((i) => i._id !== inquiryToDelete._id));
      if (selectedInquiry && selectedInquiry._id === inquiryToDelete._id) {
        setSelectedInquiry(null);
      }
      setInquiryToDelete(null);

      // Refresh counts
      fetchInquiries();

      setStatusMessage({
        type: "success",
        text: "Inquiry permanently deleted.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete inquiry.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cleanPhoneDigits = (phone) => String(phone || "").replace(/[^0-9]/g, "");

  const tabs = [
    { id: "all", label: "All Inquiries", count: counts.total },
    { id: "new", label: "New Leads", count: counts.new, highlight: counts.new > 0 },
    { id: "read", label: "Read", count: counts.read },
    { id: "in_progress", label: "In Progress", count: counts.inProgress },
    { id: "resolved", label: "Resolved", count: counts.resolved },
  ];

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
          onRefresh={() => fetchInquiries()}
        />

        {/* 3. MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Breadcrumbs & Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium tracking-widest text-[#8b714e] uppercase">
                  ADMIN / INQUIRIES
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 uppercase">
                  Phase 4 Active
                </span>
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#082d2a]">
                Client <em className="font-serif italic font-normal text-[#c99a55]">Inquiries.</em>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#082d2a]/70">
                Review, filter, track status, and respond to prospective client leads from the Ravion website.
              </p>
            </div>

            {/* Quick Refresh Button */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => fetchInquiries()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-[#082d2a]/15 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:bg-white/80 active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Refresh inquiry records"
              >
                <RefreshCw size={13} className={isLoading ? "animate-spin text-[#c99a55]" : ""} />
                <span>{isLoading ? "Refreshing…" : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Top Stats Overview Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {/* Total Inquiries */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Total Inquiries</span>
                <Inbox size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {counts.total}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Lifetime submissions</p>
            </div>

            {/* New Leads */}
            <div
              className={`rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
                counts.new > 0
                  ? "border-[#c99a55]/40 bg-gradient-to-b from-[#c99a55]/15 to-white/90"
                  : "border-[#082d2a]/10 bg-white/80"
              }`}
            >
              <div className="flex items-center justify-between text-[#8b714e]">
                <span className="font-mono text-[10px] uppercase tracking-wider">New Leads</span>
                <Sparkles size={15} className={counts.new > 0 ? "text-[#c99a55] animate-pulse" : ""} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                  {counts.new}
                </span>
                {counts.new > 0 && (
                  <span className="rounded-full bg-[#c99a55]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#8b714e]">
                    Pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Awaiting initial reply</p>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="font-mono text-[10px] uppercase tracking-wider">In Progress</span>
                <Clock size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {counts.inProgress}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">In discussion / scoping</p>
            </div>

            {/* Resolved */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-mono text-[10px] uppercase tracking-wider">Resolved</span>
                <CheckCircle2 size={15} />
              </div>
              <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#082d2a]">
                {counts.resolved}
              </div>
              <p className="mt-1 text-[11px] text-[#082d2a]/55">Onboarded / closed</p>
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

          {/* Controls Bar: Tabs + Search + Sort */}
          <div className="space-y-4">
            {/* Status Filter Tabs */}
            <div className="flex overflow-x-auto border-b border-[#082d2a]/10 pb-px gap-1.5 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterChange(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-t-2xl px-4 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "border-b-2 border-[#c99a55] bg-white/80 text-[#082d2a] font-semibold shadow-sm"
                        : "text-[#082d2a]/60 hover:bg-white/40 hover:text-[#082d2a]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#082d2a] text-[#f5f0e8]"
                          : tab.highlight
                          ? "bg-[#c99a55]/20 text-[#8b714e]"
                          : "bg-[#082d2a]/5 text-[#082d2a]/60"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#082d2a]/40">
                  <Search size={15} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by client name, email, phone, or service…"
                  className="w-full rounded-full border border-[#082d2a]/15 bg-white pl-10 pr-9 py-2 text-xs text-[#082d2a] placeholder-[#082d2a]/40 outline-none transition-all focus:border-[#c99a55] focus:ring-1 focus:ring-[#c99a55]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#082d2a]/40 hover:text-[#082d2a] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="font-mono text-[11px] text-[#082d2a]/60 flex items-center gap-1">
                  <ArrowUpDown size={12} />
                  <span>Sort:</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const newSort = e.target.value;
                    setSortBy(newSort);
                    fetchInquiries(statusFilter, searchQuery, newSort);
                  }}
                  className="rounded-full border border-[#082d2a]/15 bg-white px-3 py-1.5 text-xs text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inquiries List View */}
          {isLoading && inquiries.length === 0 ? (
            /* Loading Skeleton */
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-[#082d2a]/10 bg-white/60 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-36 bg-[#082d2a]/10 rounded" />
                    <div className="h-4 w-16 bg-[#082d2a]/10 rounded-full" />
                  </div>
                  <div className="h-3 w-64 bg-[#082d2a]/10 rounded" />
                  <div className="h-8 w-full bg-[#082d2a]/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#082d2a]/20 bg-white/50 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#082d2a]/5 text-[#082d2a]/40 mb-4">
                <Inbox size={26} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#082d2a]">
                {searchQuery || statusFilter !== "all"
                  ? "No matching inquiries found"
                  : "No client inquiries yet"}
              </h3>
              <p className="mt-1 text-xs text-[#082d2a]/65 max-w-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search keywords or switching filter tabs to view other records."
                  : "When prospective clients submit the contact form on your website, their inquiries will appear here in real time."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                    fetchInquiries("all", "", sortBy);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] shadow-sm hover:bg-gray-50 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            /* List of Inquiries */
            <div className="space-y-3">
              {inquiries.map((inquiry) => {
                const statusCfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.new;
                const isNew = inquiry.status === "new";

                return (
                  <div
                    key={inquiry._id}
                    className={`group relative rounded-2xl border transition-all duration-200 bg-white/90 p-5 shadow-sm hover:border-[#c99a55] hover:shadow-md ${
                      isNew ? "border-[#c99a55]/40 ring-1 ring-[#c99a55]/20" : "border-[#082d2a]/10"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Client Profile & Meta */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Avatar initials */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#082d2a] to-[#12423e] font-serif text-sm font-semibold text-[#f5f0e8] shadow-sm">
                          {inquiry.name
                            ? inquiry.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "CL"}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base font-semibold text-[#082d2a]">
                              {inquiry.name}
                            </h3>
                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${statusCfg.color}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                              <span>{statusCfg.label}</span>
                            </span>

                            {/* Service badge */}
                            <span className="rounded-md border border-[#082d2a]/10 bg-[#082d2a]/5 px-2 py-0.5 font-mono text-[10px] text-[#082d2a]/70">
                              {inquiry.service}
                            </span>
                          </div>

                          {/* Contact Channels */}
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#082d2a]/65">
                            <a
                              href={`mailto:${inquiry.email}`}
                              className="inline-flex items-center gap-1 hover:text-[#c99a55] transition-colors"
                              title="Send email"
                            >
                              <Mail size={12} className="text-[#8b714e]" />
                              <span>{inquiry.email}</span>
                            </a>

                            {inquiry.phone && (
                              <a
                                href={`tel:${cleanPhoneDigits(inquiry.phone)}`}
                                className="inline-flex items-center gap-1 hover:text-[#c99a55] transition-colors font-mono text-[11px]"
                                title="Call client"
                              >
                                <Phone size={11} className="text-[#8b714e]" />
                                <span>{inquiry.phone}</span>
                              </a>
                            )}

                            <span className="font-mono text-[11px] text-[#082d2a]/40">
                              • {formatRelativeTime(inquiry.createdAt)} ({formatDate(inquiry.createdAt)})
                            </span>
                          </div>

                          {/* Message Preview */}
                          <div
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="mt-3 rounded-xl border border-[#082d2a]/10 bg-[#f5f0e8]/60 p-3 text-xs text-[#082d2a]/80 leading-relaxed hover:bg-[#f5f0e8] transition-colors cursor-pointer"
                          >
                            <p className="line-clamp-2">{inquiry.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-[#082d2a]/10 pt-3 sm:pt-0">
                        {/* Quick View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#082d2a] px-3.5 py-1.5 text-xs font-medium text-[#f5f0e8] shadow-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowRight size={12} />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Quick Mark as Read (if new) */}
                          {isNew && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(inquiry._id, "read")}
                              disabled={isUpdatingStatus}
                              className="rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-800 transition-all hover:bg-sky-100 cursor-pointer"
                              title="Mark as Read"
                            >
                              Mark Read
                            </button>
                          )}

                          {/* Quick Status Selector */}
                          <select
                            value={inquiry.status}
                            onChange={(e) => handleUpdateStatus(inquiry._id, e.target.value)}
                            disabled={isUpdatingStatus}
                            className="rounded-full border border-[#082d2a]/15 bg-white px-2.5 py-1 font-mono text-[10px] text-[#082d2a] outline-none transition-all focus:border-[#c99a55] cursor-pointer"
                            title="Change status"
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setInquiryToDelete(inquiry)}
                            className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete inquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. INQUIRY DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#082d2a]/20 bg-[#f5f0e8] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#082d2a]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#082d2a] to-[#12423e] font-serif text-lg font-semibold text-[#f5f0e8] shadow-sm">
                  {selectedInquiry.name
                    ? selectedInquiry.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "CL"}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#082d2a]">
                    {selectedInquiry.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                        STATUS_CONFIG[selectedInquiry.status]?.color || STATUS_CONFIG.new.color
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          STATUS_CONFIG[selectedInquiry.status]?.dot || STATUS_CONFIG.new.dot
                        }`}
                      />
                      <span>
                        {STATUS_CONFIG[selectedInquiry.status]?.label || selectedInquiry.status}
                      </span>
                    </span>

                    <span className="rounded-md border border-[#082d2a]/10 bg-white/70 px-2.5 py-0.5 font-mono text-[10.5px] text-[#082d2a]/80">
                      {selectedInquiry.service}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-full p-2 text-[#082d2a]/60 hover:bg-[#082d2a]/10 hover:text-[#082d2a] transition-all cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Client Contact Grid */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4 shadow-sm">
              {/* Email */}
              <div>
                <span className="font-mono text-[10px] tracking-wider text-[#8b714e] uppercase block">
                  Email Address
                </span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#082d2a] hover:text-[#c99a55] transition-colors break-all"
                >
                  <Mail size={13} className="text-[#8b714e] shrink-0" />
                  <span>{selectedInquiry.email}</span>
                </a>
              </div>

              {/* Phone */}
              <div>
                <span className="font-mono text-[10px] tracking-wider text-[#8b714e] uppercase block">
                  Phone Number
                </span>
                {selectedInquiry.phone ? (
                  <a
                    href={`tel:${cleanPhoneDigits(selectedInquiry.phone)}`}
                    className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#082d2a] hover:text-[#c99a55] transition-colors"
                  >
                    <Phone size={13} className="text-[#8b714e] shrink-0" />
                    <span>{selectedInquiry.phone}</span>
                  </a>
                ) : (
                  <span className="mt-0.5 text-xs text-[#082d2a]/50">Not provided</span>
                )}
              </div>

              {/* Submission Date */}
              <div>
                <span className="font-mono text-[10px] tracking-wider text-[#8b714e] uppercase block">
                  Submitted On
                </span>
                <span className="mt-0.5 font-mono text-xs text-[#082d2a]/80 block">
                  {formatDate(selectedInquiry.createdAt)} ({formatRelativeTime(selectedInquiry.createdAt)})
                </span>
              </div>

              {/* Last Updated */}
              <div>
                <span className="font-mono text-[10px] tracking-wider text-[#8b714e] uppercase block">
                  Last Updated
                </span>
                <span className="mt-0.5 font-mono text-xs text-[#082d2a]/80 block">
                  {formatDate(selectedInquiry.updatedAt)}
                </span>
              </div>
            </div>

            {/* Complete Message */}
            <div className="space-y-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e]">
                Project Message
              </span>
              <div className="rounded-2xl border border-[#082d2a]/15 bg-white p-5 shadow-inner">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#082d2a]">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            {/* Status Selector in Modal */}
            <div className="rounded-2xl border border-[#082d2a]/10 bg-white/70 p-4 space-y-2">
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8b714e] block">
                Update Management Status
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const isCurrent = selectedInquiry.status === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedInquiry._id, key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#082d2a] text-[#f5f0e8] shadow-sm font-semibold"
                          : "border border-[#082d2a]/15 bg-white text-[#082d2a] hover:bg-gray-50"
                      }`}
                    >
                      {isCurrent && <Check size={12} className="text-[#c99a55]" />}
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#082d2a]/10 pt-4">
              {/* Direct Reply Channels */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Project Inquiry for ${encodeURIComponent(
                    selectedInquiry.service
                  )} — Ravion`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#082d2a] px-4 py-2 text-xs font-medium text-[#f5f0e8] shadow-sm hover:bg-[#c99a55] hover:text-[#031513] transition-all cursor-pointer"
                >
                  <Mail size={13} />
                  <span>Reply via Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${cleanPhoneDigits(selectedInquiry.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 shadow-sm hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon size={14} className="text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Delete / Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInquiryToDelete(selectedInquiry)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="rounded-full border border-[#082d2a]/20 bg-white px-4 py-2 text-xs font-medium text-[#082d2a] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {inquiryToDelete && (
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
                Confirm Permanent Deletion
              </h4>
            </div>

            <p className="text-xs text-[#082d2a]/70 leading-relaxed">
              Are you sure you want to delete the inquiry from{" "}
              <strong className="font-semibold text-[#082d2a]">{inquiryToDelete.name}</strong> (
              {inquiryToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInquiryToDelete(null)}
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
                    <span>Delete Inquiry</span>
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
