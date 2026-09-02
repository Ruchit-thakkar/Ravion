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
} from "lucide-react";

export default function DashboardClient({ user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Samples", icon: FolderKanban, active: false, badge: "Phase 2" },
    { name: "Categories", icon: Tags, active: false, badge: "Phase 2" },
    { name: "Services", icon: Briefcase, active: false, badge: "Phase 2" },
    { name: "Inquiries", icon: MailCheck, active: false, badge: "Phase 2" },
    { name: "Settings", icon: Settings, active: false, badge: "Phase 2" },
  ];

  return (
    <div className="flex min-h-screen bg-[#031513] text-[#f5f0e8] selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Sidebar Navigation */}
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
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-[#c99a55]/15 text-[#d1aa6b] border border-[#c99a55]/30 font-semibold"
                    : "text-[#f5f0e8]/50 hover:bg-[#062623] hover:text-[#f5f0e8]/80 cursor-not-allowed opacity-60"
                }`}
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
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#c99a55]/15 bg-[#031513]/80 px-6 backdrop-blur-md md:px-10">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-widest text-[#d1aa6b] uppercase">
              RAVION ADMIN
            </p>
            <h1 className="font-serif text-xl font-semibold text-[#f5f0e8] md:text-2xl">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
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
              className="inline-flex items-center gap-2 rounded-xl border border-[#c99a55]/30 bg-[#062623] px-4 py-2 text-xs font-medium text-[#f5f0e8] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#0a3531] active:scale-95"
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
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Welcome Greeting Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-gradient-to-r from-[#062623] to-[#041d1a] p-8 shadow-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c99a55]/10 blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c99a55]/30 bg-[#c99a55]/10 px-3 py-1 font-mono text-[10px] font-medium tracking-wider text-[#d1aa6b] uppercase">
                  <Sparkles className="h-3 w-3" />
                  Phase 1 Authentication Active
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold text-[#f5f0e8] md:text-4xl">
                  Welcome, <span className="text-[#d1aa6b]">{displayName}</span>
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#f5f0e8]/70">
                  Your administrator session is authenticated and protected with HttpOnly JWT cookies and MongoDB bcrypt verification.
                </p>
              </div>
            </div>

            {/* Admin Dashboard Placeholder Card */}
            <div className="rounded-2xl border border-[#c99a55]/20 bg-[#062623]/60 p-10 text-center shadow-xl backdrop-blur-sm sm:p-16">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c99a55]/30 bg-[#c99a55]/10 text-[#d1aa6b]">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#f5f0e8] md:text-3xl">
                Admin Dashboard
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-[#f5f0e8]/60">
                More admin features (Samples management, ImageKit uploads, Categories, Services, Inquiries, and Settings) will be added in future phases.
              </p>

              {/* Status checklist */}
              <div className="mx-auto mt-8 max-w-md rounded-xl border border-[#c99a55]/15 bg-[#041a18]/70 p-5 text-left text-xs font-mono">
                <div className="mb-2.5 flex items-center justify-between border-b border-[#c99a55]/10 pb-2 text-[#d1aa6b]">
                  <span>SYSTEM STATUS</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400">
                    ONLINE
                  </span>
                </div>
                <div className="space-y-2 text-[#f5f0e8]/70">
                  <div className="flex justify-between">
                    <span>Admin User:</span>
                    <span className="text-[#f5f0e8]">{user?.email}</span>
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
