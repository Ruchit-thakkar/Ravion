"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderKanban,
  Grid,
  Image as ImageIcon,
  Inbox,
  Layers,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  RotateCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function DashboardClient({ initialData, admin }) {
  const [data, setData] = useState(initialData);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const stats = data?.stats || {
    totalSamples: 0,
    totalCategories: 0,
    totalInquiries: 0,
    newInquiries: 0,
  };

  const recentInquiries = data?.recentInquiries || [];
  const recentSamples = data?.recentSamples || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError("");
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) {
        throw new Error("Failed to refresh metrics data.");
      }
      const refreshed = await res.json();
      if (refreshed.success) {
        setData(refreshed);
      }
    } catch (err) {
      setRefreshError(err.message || "Could not refresh data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return "Recently";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8] text-[#082d2a]">
      {/* 1. SIDEBAR */}
      <AdminSidebar
        admin={admin}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 2. TOP HEADER */}
        <AdminHeader
          admin={admin}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        {/* 3. DASHBOARD CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Refresh Error Notification */}
          {refreshError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800"
            >
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{refreshError}</span>
            </div>
          )}

          {/* Phase 2 Welcome Milestone Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[#c99a55]/30 bg-gradient-to-r from-[#082d2a] via-[#05211f] to-[#082d2a] p-6 sm:p-8 text-[#f5f0e8] shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c99a55]/40 bg-[#c99a55]/15 px-3 py-1 font-mono text-[10.5px] font-medium tracking-widest text-[#dfb77b] uppercase">
                  <Sparkles size={12} className="text-[#c99a55]" />
                  <span>PHASE 2 • CENTRAL ADMIN DASHBOARD</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-white">
                  Welcome to Ravion <em className="italic font-normal text-[#c99a55]">Studio Control.</em>
                </h2>
                <p className="max-w-xl text-xs sm:text-sm text-[#f5f0e8]/75 leading-relaxed">
                  Live operational snapshot across your portfolio showcases, service categories, and prospective client inquiries.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-right hidden sm:block">
                  <span className="block font-mono text-[10px] text-[#c99a55] uppercase tracking-wider">
                    SYSTEM STATUS
                  </span>
                  <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-emerald-400 font-medium mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    MongoDB Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Background ambient lighting */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c99a55]/20 blur-3xl"
              aria-hidden="true"
            />
          </div>

          {/* 4. OVERVIEW CARDS (4 CARDS) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Portfolio Samples */}
            <div className="group relative rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                  PORTFOLIO SAMPLES
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/5 text-[#082d2a] transition-transform group-hover:scale-110">
                  <FolderKanban size={19} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold text-[#082d2a]">
                  {stats.totalSamples}
                </span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">projects</span>
              </div>
              <p className="mt-2 text-xs text-[#082d2a]/65">
                Total showcase projects currently stored in the database.
              </p>
            </div>

            {/* Card 2: Total Categories */}
            <div className="group relative rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                  CATEGORIES
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/5 text-[#082d2a] transition-transform group-hover:scale-110">
                  <Grid size={19} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold text-[#082d2a]">
                  {stats.totalCategories}
                </span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">taxonomies</span>
              </div>
              <p className="mt-2 text-xs text-[#082d2a]/65">
                Creative disciplines and service categorization filters.
              </p>
            </div>

            {/* Card 3: Total Client Inquiries */}
            <div className="group relative rounded-2xl border border-[#082d2a]/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                  TOTAL INQUIRIES
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082d2a]/5 text-[#082d2a] transition-transform group-hover:scale-110">
                  <MessageSquare size={19} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold text-[#082d2a]">
                  {stats.totalInquiries}
                </span>
                <span className="font-mono text-[11px] text-[#082d2a]/60">submissions</span>
              </div>
              <p className="mt-2 text-xs text-[#082d2a]/65">
                Lifetime submissions received through the website contact form.
              </p>
            </div>

            {/* Card 4: New Inquiries */}
            <div className="group relative rounded-2xl border border-[#c99a55]/40 bg-gradient-to-b from-[#c99a55]/10 to-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-wider text-[#8b714e] uppercase">
                  NEW INQUIRIES
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99a55]/20 text-[#8b714e] transition-transform group-hover:scale-110">
                  <Sparkles size={19} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold text-[#082d2a]">
                  {stats.newInquiries}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#c99a55]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8b714e]">
                  Pending
                </span>
              </div>
              <p className="mt-2 text-xs text-[#082d2a]/65">
                Prospective client leads awaiting initial review and reply.
              </p>
            </div>
          </div>

          {/* 5. TWO-COLUMN GRID: RECENT INQUIRIES & RECENT SAMPLES */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: RECENT CLIENT INQUIRIES (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    Recent Client Inquiries
                  </h3>
                  <p className="text-xs text-[#082d2a]/65">
                    Latest submissions received via the Let&apos;s Talk inquiry form.
                  </p>
                </div>
                <span className="rounded-full border border-[#082d2a]/15 bg-white px-3 py-1 font-mono text-[11px] text-[#082d2a]/70">
                  {recentInquiries.length} shown
                </span>
              </div>

              {recentInquiries.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#082d2a]/20 bg-white/50 p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#082d2a]/5 text-[#082d2a]/50 mb-3">
                    <Inbox size={24} />
                  </div>
                  <h4 className="font-serif text-base font-medium text-[#082d2a]">
                    No client inquiries yet
                  </h4>
                  <p className="mt-1 text-xs text-[#082d2a]/60 max-w-sm">
                    Inquiries submitted from the live Let&apos;s Talk contact section will be listed here in real time.
                  </p>
                </div>
              ) : (
                /* Inquiries List */
                <div className="space-y-3">
                  {recentInquiries.map((inq) => {
                    const isNew = inq.status?.toLowerCase() === "new";
                    return (
                      <div
                        key={inq._id}
                        className="rounded-2xl border border-[#082d2a]/10 bg-white/85 p-4.5 shadow-sm transition-all hover:border-[#c99a55]/40 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-base font-semibold text-[#082d2a] truncate">
                                {inq.name}
                              </h4>
                              <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase ${
                                  isNew
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                }`}
                              >
                                {inq.status}
                              </span>
                            </div>

                            <p className="mt-0.5 font-mono text-[11px] text-[#8b714e]">
                              {inq.service}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#082d2a]/50 shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(inq.createdAt)}</span>
                          </div>
                        </div>

                        {inq.message && (
                          <p className="mt-2.5 text-xs text-[#082d2a]/75 line-clamp-2 leading-relaxed bg-[#082d2a]/[0.02] p-2.5 rounded-xl border border-[#082d2a]/5">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#082d2a]/5 pt-3 text-[11.5px]">
                          {inq.email && (
                            <a
                              href={`mailto:${inq.email}`}
                              className="inline-flex items-center gap-1.5 text-[#082d2a]/70 hover:text-[#c99a55] transition-colors"
                            >
                              <Mail size={13} className="text-[#c99a55]" />
                              <span className="truncate max-w-[200px]">{inq.email}</span>
                            </a>
                          )}
                          {inq.phone && (
                            <a
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1.5 text-[#082d2a]/70 hover:text-[#c99a55] transition-colors"
                            >
                              <Phone size={13} className="text-[#082d2a]/50" />
                              <span>{inq.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: RECENT PORTFOLIO SAMPLES (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                    Recent Portfolio Samples
                  </h3>
                  <p className="text-xs text-[#082d2a]/65">
                    Live showcase projects from the Selected Work section.
                  </p>
                </div>
                <Link
                  href="/samples"
                  target="_blank"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8b714e] hover:text-[#082d2a] transition-colors"
                >
                  <span>View gallery</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {recentSamples.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#082d2a]/20 bg-white/50 p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#082d2a]/5 text-[#082d2a]/50 mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <h4 className="font-serif text-base font-medium text-[#082d2a]">
                    No samples available
                  </h4>
                  <p className="mt-1 text-xs text-[#082d2a]/60 max-w-xs">
                    Portfolio projects published in Phase 5 will appear here.
                  </p>
                </div>
              ) : (
                /* Samples list */
                <div className="space-y-3">
                  {recentSamples.map((sample) => (
                    <div
                      key={sample._id}
                      className="group flex items-center gap-3.5 rounded-2xl border border-[#082d2a]/10 bg-white/85 p-3.5 shadow-sm transition-all hover:border-[#c99a55]/40 hover:shadow-md"
                    >
                      {/* Thumbnail or Fallback Art */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#082d2a]/10 border border-[#082d2a]/10">
                        {sample.thumbnail ? (
                          <img
                            src={sample.thumbnail}
                            alt={sample.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#c99a55]/30 to-[#082d2a]/20 text-[#082d2a]/40">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif text-sm font-semibold text-[#082d2a] truncate">
                            {sample.title}
                          </h4>
                          <span
                            className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase ${
                              sample.status === "Published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {sample.status}
                          </span>
                        </div>

                        <p className="mt-1 font-mono text-[10.5px] text-[#8b714e] truncate">
                          {sample.category}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-[#082d2a]/50">
                          Added: {formatDate(sample.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. DASHBOARD QUICK ACTIONS (FUTURE PHASES FOUNDATION) */}
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#082d2a]">
                Quick Actions &amp; Roadmap Modules
              </h3>
              <p className="text-xs text-[#082d2a]/65">
                Core administration interfaces planned for future phases of the Ravion Admin System.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* Action 1: Client Inquiries (Active in Phase 4) */}
              <Link
                href="/admin/inquiries"
                className="group rounded-2xl border border-[#c99a55]/30 bg-white/90 p-5 shadow-sm transition-all hover:bg-white hover:border-[#c99a55] hover:shadow-md cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c99a55]/20 text-[#8b714e] transition-transform group-hover:scale-110">
                    <MessageSquare size={17} />
                  </div>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors">
                  Client Inquiries
                </h4>
                <p className="mt-1 text-xs text-[#082d2a]/60 leading-relaxed">
                  Search, filter, respond, and manage client submissions in real time.
                </p>
                <div className="mt-3 font-mono text-[10.5px] text-[#8b714e] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Inquiries</span>
                  <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 2: Portfolio Samples (Active in Phase 5) */}
              <Link
                href="/admin/samples"
                className="group rounded-2xl border border-[#c99a55]/30 bg-white/90 p-5 shadow-sm transition-all hover:bg-white hover:border-[#c99a55] hover:shadow-md cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#082d2a]/10 text-[#082d2a] transition-transform group-hover:scale-110">
                    <FolderKanban size={17} />
                  </div>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors">
                  Portfolio Samples
                </h4>
                <p className="mt-1 text-xs text-[#082d2a]/60 leading-relaxed">
                  Add, edit, upload media, reorder, and publish showcase items.
                </p>
                <div className="mt-3 font-mono text-[10.5px] text-[#8b714e] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Samples</span>
                  <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 3: Categories (Active in Phase 6) */}
              <Link
                href="/admin/categories"
                className="group rounded-2xl border border-[#c99a55]/30 bg-white/90 p-5 shadow-sm transition-all hover:bg-white hover:border-[#c99a55] hover:shadow-md cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c99a55]/20 text-[#8b714e] transition-transform group-hover:scale-110">
                    <Grid size={17} />
                  </div>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors">
                  Categories
                </h4>
                <p className="mt-1 text-xs text-[#082d2a]/60 leading-relaxed">
                  Manage creative disciplines, taxonomy, and portfolio filtering slugs.
                </p>
                <div className="mt-3 font-mono text-[10.5px] text-[#8b714e] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Categories</span>
                  <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 4: Website Settings (Active in Phase 3) */}
              <Link
                href="/admin/settings"
                className="group rounded-2xl border border-[#c99a55]/30 bg-white/90 p-5 shadow-sm transition-all hover:bg-white hover:border-[#c99a55] hover:shadow-md cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c99a55]/20 text-[#8b714e] transition-transform group-hover:scale-110">
                    <Settings size={17} />
                  </div>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors">
                  Website Settings
                </h4>
                <p className="mt-1 text-xs text-[#082d2a]/60 leading-relaxed">
                  Configure studio contact channels, social links, footer, and brand info.
                </p>
                <div className="mt-3 font-mono text-[10.5px] text-[#8b714e] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Settings</span>
                  <ArrowRight size={12} />
                </div>
              </Link>

              {/* Action 5: Link in Bio (Active in Phase 7) */}
              <Link
                href="/admin/bio"
                className="group rounded-2xl border border-[#c99a55]/30 bg-white/90 p-5 shadow-sm transition-all hover:bg-white hover:border-[#c99a55] hover:shadow-md cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c99a55]/20 text-[#8b714e] transition-transform group-hover:scale-110">
                    <Link2 size={17} />
                  </div>
                  <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-semibold text-[#082d2a] group-hover:text-[#c99a55] transition-colors">
                  Link in Bio
                </h4>
                <p className="mt-1 text-xs text-[#082d2a]/60 leading-relaxed">
                  Manage profile bio, social links, custom destination buttons, and preview live.
                </p>
                <div className="mt-3 font-mono text-[10.5px] text-[#8b714e] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Bio</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
