"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  LogOut,
  Menu,
  RotateCw,
  ShieldCheck,
  User,
} from "lucide-react";

export default function AdminHeader({
  admin,
  onOpenMobileMenu = () => {},
  onRefresh = () => {},
  isRefreshing = false,
  onLogout = () => {},
  loggingOut = false,
}) {
  const adminEmail = admin?.email || "admin@ravion.in";
  const adminName = adminEmail.split("@")[0];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#082d2a]/10 bg-white/75 px-4 backdrop-blur-md sm:px-8">
      {/* Left side: Hamburger Toggle & Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-[#082d2a]/15 bg-white p-2.5 text-[#082d2a] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#082d2a] hover:text-[#f5f0e8] lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#082d2a]">
              Admin <em className="font-serif italic font-normal text-[#c99a55]">Dashboard</em>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#c99a55]/30 bg-[#c99a55]/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#8b714e] uppercase">
              <ShieldCheck size={11} className="text-[#c99a55]" />
              <span>Phase 2 Active</span>
            </span>
          </div>
          <p className="hidden text-xs text-[#082d2a]/65 sm:block">
            Welcome back, <span className="font-medium text-[#082d2a] capitalize">{adminName}</span> — Creative studio performance and activity overview.
          </p>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#082d2a]/5 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Refresh metrics data"
          aria-label="Refresh dashboard data"
        >
          <RotateCw
            size={13}
            className={`text-[#c99a55] ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#082d2a]/15 bg-white px-3.5 py-2 text-xs font-medium text-[#082d2a] shadow-sm transition-all hover:border-[#c99a55] hover:bg-[#082d2a] hover:text-[#f5f0e8] active:scale-95"
          title="Open live public website in new tab"
        >
          <span>View Site</span>
          <ArrowUpRight size={13} className="opacity-70" />
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#082d2a] px-4 py-2 text-xs font-medium text-[#f5f0e8] shadow-sm transition-all duration-300 hover:bg-[#c99a55] hover:text-[#031513] active:scale-95 disabled:opacity-50 cursor-pointer"
          aria-label="Sign out of Admin Dashboard"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign Out"}</span>
        </button>
      </div>
    </header>
  );
}
