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
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function InquiryClient({ user }) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Admin";

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error(err);
      setActionNotice("Error loading inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
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

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        setActionNotice(`Status updated to "${newStatus}".`);
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item._id !== id));
        setActionNotice("Inquiry deleted.");
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, active: false },
    { name: "Inquiry", href: "/admin/inquiry", icon: MailCheck, active: true },
    { name: "Samples", href: "/admin/samples", icon: FolderKanban, active: false },
    { name: "Categories", href: "/admin/categories", icon: Tags, active: false },
    { name: "Services", href: "#", icon: Briefcase, active: false, badge: "Phase 2" },
    { name: "Settings", href: "#", icon: Settings, active: false, badge: "Phase 2" },
  ];

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new" || !i.status).length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesFilter =
      filter === "all" || item.status?.toLowerCase() === filter.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query) ||
      item.phone?.includes(query) ||
      item.service?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
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

        {/* Mobile Navigation Links */}
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
                  {item.name === "Inquiry" && counts.new > 0 && (
                    <span className="rounded-full bg-[#c99a55] px-2 py-0.5 text-[10px] font-bold text-[#041d1a]">
                      {counts.new}
                    </span>
                  )}
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

        {/* Mobile Bottom Utility Links */}
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
                  {item.name === "Inquiry" && counts.new > 0 && (
                    <span className="rounded-full bg-[#c99a55] px-2 py-0.5 text-[10px] font-bold text-[#041d1a]">
                      {counts.new}
                    </span>
                  )}
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
            {/* Mobile Hamburger Menu Button (≥ 44×44px click area, clearly visible on ≤ 768px) */}
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
                Inquiries
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

        {/* Inquiries Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-10">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header info & filters */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f5f0e8]">
                  Client Inquiries
                </h2>
                <p className="mt-1 text-xs text-[#f5f0e8]/60">
                  Manage incoming project requests submitted via &quot;Let&apos;s Talk&quot;.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#f5f0e8]/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inquiries…"
                  className="w-full rounded-xl border border-[#c99a55]/20 bg-[#062623]/70 py-2 pl-9 pr-3 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 outline-none transition-colors focus:border-[#c99a55]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#c99a55]/15 pb-4">
              {[
                { key: "all", label: "All Inquiries", count: counts.all },
                { key: "new", label: "New", count: counts.new },
                { key: "contacted", label: "Contacted", count: counts.contacted },
                { key: "closed", label: "Closed", count: counts.closed },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-mono transition-all ${
                    filter === tab.key
                      ? "bg-[#c99a55] text-[#031513] font-bold"
                      : "bg-[#062623]/60 text-[#f5f0e8]/70 hover:bg-[#062623] hover:text-[#f5f0e8]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      filter === tab.key
                        ? "bg-[#031513]/20 text-[#031513]"
                        : "bg-[#031513] text-[#d1aa6b]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {actionNotice && (
              <div className="rounded-xl border border-[#c99a55]/30 bg-[#c99a55]/10 p-3 text-xs font-mono text-[#d1aa6b]">
                {actionNotice}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#c99a55]/15 bg-[#062623]/30">
                <Loader2 className="h-6 w-6 animate-spin text-[#d1aa6b]" />
              </div>
            ) : filteredInquiries.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl border border-[#c99a55]/15 bg-[#062623]/40 p-8 sm:p-12 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c99a55]/20 bg-[#c99a55]/10 text-[#d1aa6b]">
                  <MailCheck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#f5f0e8]">
                  No inquiries found
                </h3>
                <p className="mt-2 text-xs text-[#f5f0e8]/50">
                  {search
                    ? "No inquiries matching your search criteria."
                    : "Submissions from the 'Let's Talk' form will appear here in real-time."}
                </p>
              </div>
            ) : (
              /* Inquiries List */
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => {
                  const rawDigits = inquiry.phone
                    ? inquiry.phone.replace(/[^0-9]/g, "")
                    : "";
                  const waNumber = rawDigits.startsWith("91")
                    ? rawDigits
                    : `91${rawDigits}`;

                  return (
                    <div
                      key={inquiry._id}
                      className="group relative overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-[#062623]/70 p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-[#c99a55]/40"
                    >
                      {/* Top bar of card */}
                      <div className="flex flex-col justify-between gap-3 border-b border-[#c99a55]/10 pb-4 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#f5f0e8]">
                              {inquiry.name}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                inquiry.status === "contacted"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : inquiry.status === "closed"
                                  ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {inquiry.status || "new"}
                            </span>
                          </div>
                          <span className="mt-1 inline-block rounded border border-[#c99a55]/25 bg-[#c99a55]/10 px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b]">
                            {inquiry.service}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs text-[#f5f0e8]/50">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {inquiry.createdAt
                              ? new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </span>
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="my-4 flex flex-wrap gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Regarding your Ravion inquiry - ${inquiry.service || "Web Services"}`)}`}
                            onClick={() => {
                              window.location.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Regarding your Ravion inquiry - ${inquiry.service || "Web Services"}`)}`;
                            }}
                            className="flex items-center gap-1.5 text-[#f5f0e8]/80 transition-colors hover:text-[#d1aa6b]"
                          >
                            <Mail className="h-3.5 w-3.5 text-[#d1aa6b]" />
                            <span>{inquiry.email}</span>
                          </a>
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inquiry.email)}&su=${encodeURIComponent(`Regarding your Ravion inquiry - ${inquiry.service || "Web Services"}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border border-[#c99a55]/30 bg-[#c99a55]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#d1aa6b] transition-all hover:bg-[#c99a55]/20 hover:text-white"
                            title="Open Gmail compose in browser"
                          >
                            Gmail
                          </a>
                        </div>

                        <a
                          href={`tel:${inquiry.phone}`}
                          className="flex items-center gap-1.5 text-[#f5f0e8]/80 transition-colors hover:text-[#d1aa6b]"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#d1aa6b]" />
                          <span>{inquiry.phone}</span>
                        </a>

                        {rawDigits && (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-emerald-400 transition-colors hover:text-emerald-300"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="rounded-xl border border-[#c99a55]/10 bg-[#041a18]/70 p-3.5 sm:p-4">
                        <p className="text-xs font-mono text-[#d1aa6b] uppercase tracking-wider mb-1">
                          Message:
                        </p>
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#f5f0e8]/90">
                          {inquiry.message}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-[10px] text-[#f5f0e8]/50 uppercase">
                            Set Status:
                          </span>
                          <button
                            onClick={() => updateStatus(inquiry._id, "new")}
                            className={`rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all ${
                              inquiry.status === "new" || !inquiry.status
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                                : "bg-[#041a18] text-[#f5f0e8]/50 hover:text-[#f5f0e8]"
                            }`}
                          >
                            New
                          </button>
                          <button
                            onClick={() => updateStatus(inquiry._id, "contacted")}
                            className={`rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all ${
                              inquiry.status === "contacted"
                                ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                                : "bg-[#041a18] text-[#f5f0e8]/50 hover:text-[#f5f0e8]"
                            }`}
                          >
                            Contacted
                          </button>
                          <button
                            onClick={() => updateStatus(inquiry._id, "closed")}
                            className={`rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all ${
                              inquiry.status === "closed"
                                ? "bg-gray-500/30 text-gray-300 border border-gray-500/50"
                                : "bg-[#041a18] text-[#f5f0e8]/50 hover:text-[#f5f0e8]"
                            }`}
                          >
                            Closed
                          </button>
                        </div>

                        <button
                          onClick={() => deleteInquiry(inquiry._id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1 text-xs text-red-300 transition-colors hover:bg-red-900/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
