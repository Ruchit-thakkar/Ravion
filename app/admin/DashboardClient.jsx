"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Tags,
  Briefcase,
  MailCheck,
  Settings,
  Shield,
  Loader2,
  ExternalLink,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function DashboardClient({ user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract display name from email (e.g. ruchit@gmail.com -> Ruchit)
  const displayName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Admin";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      // Fallback redirect
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, active: true },
    { name: "Inquiry", href: "/admin/inquiry", icon: MailCheck, active: false },
    { name: "Samples", href: "#", icon: FolderKanban, active: false, badge: "Phase 2" },
    { name: "Categories", href: "#", icon: Tags, active: false, badge: "Phase 2" },
    { name: "Services", href: "#", icon: Briefcase, active: false, badge: "Phase 2" },
    { name: "Settings", href: "#", icon: Settings, active: false, badge: "Phase 2" },
  ];

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
        {/* Mobile Header & Close Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-block"
            >
              <img
                src="/assets/ravion-logo.png"
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
        {/* Brand */}
        <div className="mb-8">
          <Link href="/admin" className="inline-block">
            <img
              src="/assets/ravion-logo.png"
              alt="RAVION"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#d1aa6b] uppercase">
            <Shield className="h-3 w-3" />
            <span>Admin Console</span>
          </div>
        </div>

        {/* Navigation links */}
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

        {/* Bottom utility links */}
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
        {/* Top Header Bar */}
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
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* User status badge */}
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-[#f5f0e8]">
                Welcome, <span className="text-[#d1aa6b]">{displayName}</span>
              </p>
              <p className="font-mono text-[10px] text-[#f5f0e8]/50">
                {user?.email}
              </p>
            </div>

            {/* Header Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-3.5 py-2 text-xs font-medium text-[#f5f0e8] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#0a3531] active:scale-95 sm:px-4"
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

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-10">
          <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
            {/* Welcome Greeting Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-gradient-to-r from-[#062623] to-[#041d1a] p-6 shadow-xl sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c99a55]/10 blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c99a55]/30 bg-[#c99a55]/10 px-3 py-1 font-mono text-[10px] font-medium tracking-wider text-[#d1aa6b] uppercase">
                  <Sparkles className="h-3 w-3" />
                  Phase 1 Authentication Active
                </div>
                <h2 className="mt-4 font-serif text-2xl font-semibold text-[#f5f0e8] sm:text-3xl md:text-4xl">
                  Welcome, <span className="text-[#d1aa6b]">{displayName}</span>
                </h2>
                <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-[#f5f0e8]/70">
                  Your administrator session is authenticated and protected with HttpOnly JWT cookies and MongoDB bcrypt verification.
                </p>
              </div>
            </div>

            {/* Admin Dashboard Placeholder Card */}
            <div className="rounded-2xl border border-[#c99a55]/20 bg-[#062623]/60 p-6 text-center shadow-xl backdrop-blur-sm sm:p-12 md:p-16">
              <div className="mx-auto mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-[#c99a55]/30 bg-[#c99a55]/10 text-[#d1aa6b]">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#f5f0e8]">
                Admin Dashboard
              </h3>
              <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-[#f5f0e8]/60">
                More admin features (Samples management, ImageKit uploads, Categories, Services, Inquiries, and Settings) will be added in future phases.
              </p>

              {/* Status checklist */}
              <div className="mx-auto mt-8 max-w-md rounded-xl border border-[#c99a55]/15 bg-[#041a18]/70 p-4 sm:p-5 text-left text-[11px] sm:text-xs font-mono">
                <div className="mb-2.5 flex items-center justify-between border-b border-[#c99a55]/10 pb-2 text-[#d1aa6b]">
                  <span>SYSTEM STATUS</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400">
                    ONLINE
                  </span>
                </div>
                <div className="space-y-2 text-[#f5f0e8]/70">
                  <div className="flex justify-between">
                    <span>Admin User:</span>
                    <span className="text-[#f5f0e8] truncate max-w-[200px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="text-[#d1aa6b] uppercase">{user?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Storage:</span>
                    <span className="text-emerald-400">Secure HttpOnly Cookie</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password Hash:</span>
                    <span className="text-emerald-400">Bcrypt (Salt Rounds 10)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
