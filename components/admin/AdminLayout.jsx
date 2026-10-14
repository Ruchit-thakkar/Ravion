"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  MailCheck,
  FolderKanban,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  Loader2,
  ChevronRight,
  Globe,
} from "lucide-react";

export default function AdminLayout({ children, user, title, subtitle, actions }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Admin";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Clean, focused navigation — Link in Bio is the central hub
  const navItems = [
    {
      name: "Link in Bio",
      href: "/admin/bio",
      icon: Sparkles,
      badge: "HUB",
      desc: "Profile, Products, Links & Layout",
    },
    {
      name: "Client Inquiries",
      href: "/admin/inquiry",
      icon: MailCheck,
      desc: "Website form submissions",
    },
    {
      name: "Portfolio Samples",
      href: "/admin/samples",
      icon: FolderKanban,
      desc: "Showcase client projects",
    },
    {
      name: "Website Settings",
      href: "/admin/settings",
      icon: Settings,
      desc: "Branding, SEO & defaults",
    },
  ];

  return (
    <div className="min-h-screen bg-[#031513] text-[#f5f0e8] flex flex-col font-sans selection:bg-[#c99a55] selection:text-[#031513]">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-0 right-0 h-48 pointer-events-none bg-[radial-gradient(ellipse_60%_100%_at_50%_-20%,rgba(201,154,85,0.12),transparent)] z-0" />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#031513]/90 backdrop-blur-md border-b border-[#c99a55]/20">
        <Link href="/admin/bio" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#c99a55] to-[#8c672e] flex items-center justify-center p-1.5 shadow-md shadow-[#c99a55]/20">
            <img
              src="/assets/ravion_logo_svg-01.svg"
              alt="Ravion"
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <div>
            <span className="font-serif font-bold tracking-wider text-sm text-[#f5f0e8]">
              RAVION
            </span>
            <span className="block font-mono text-[9px] tracking-widest text-[#c99a55] uppercase">
              Control Hub
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/bio"
            target="_blank"
            className="flex items-center gap-1 rounded-lg bg-[#c99a55]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#c99a55] border border-[#c99a55]/30 hover:bg-[#c99a55]/25"
          >
            <Globe className="h-3 w-3" />
            <span>Live Bio</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#f5f0e8] hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-[#021311] border-r border-[#c99a55]/20">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#c99a55]/15 flex items-center justify-between">
            <Link href="/admin/bio" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#c99a55] via-[#dfb77b] to-[#8c672e] flex items-center justify-center p-2 shadow-lg shadow-[#c99a55]/20 group-hover:scale-105 transition-transform">
                <img
                  src="/assets/ravion_logo_svg-01.svg"
                  alt="Ravion"
                  className="h-full w-full object-contain brightness-0 invert"
                />
              </div>
              <div>
                <span className="font-serif font-bold tracking-wider text-base text-[#f5f0e8] block">
                  RAVION
                </span>
                <span className="font-mono text-[10px] tracking-widest text-[#c99a55] uppercase block">
                  Studio Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-mono tracking-widest uppercase text-[#c99a55]/70">
              Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#c99a55] to-[#b38341] text-[#031513] font-semibold shadow-lg shadow-[#c99a55]/20"
                      : "text-[#f5f0e8]/80 hover:bg-[#062623] hover:text-[#f5f0e8]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-[#031513]" : "text-[#c99a55]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{item.name}</span>
                    <span
                      className={`text-[10px] block truncate mt-0.5 ${
                        isActive ? "text-[#031513]/70 font-normal" : "text-[#f5f0e8]/40"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-[#031513] text-[#c99a55]"
                          : "bg-[#c99a55]/20 text-[#dfb77b] border border-[#c99a55]/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Site Links & Footer */}
          <div className="p-3 border-t border-[#c99a55]/15 space-y-2 bg-[#02100e]">
            {/* Live Bio Link */}
            <Link
              href="/bio"
              target="_blank"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#c99a55]/30 bg-[#062623]/60 hover:bg-[#c99a55]/15 text-xs text-[#d1aa6b] transition-all group"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-[#c99a55]" />
                <span className="font-medium">Open Live Bio</span>
              </div>
              <ExternalLink className="h-3 w-3 text-[#c99a55]/60 group-hover:text-[#c99a55] transition-colors" />
            </Link>

            {/* Main Website Link */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#f5f0e8]/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="text-[11px]">View Homepage (ravion.in)</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            {/* Admin User Card & Logout */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-[#c99a55]/20 border border-[#c99a55]/40 flex items-center justify-center text-[10px] font-bold text-[#c99a55] shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#f5f0e8] truncate">{displayName}</p>
                  <p className="text-[9px] font-mono text-[#c99a55]/80">Authenticated</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1.5 rounded-lg text-[#f5f0e8]/50 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Log Out"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#021311] border-r border-[#c99a55]/20 p-5 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#c99a55]/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#c99a55] to-[#8c672e] flex items-center justify-center p-1.5 shadow-md shadow-[#c99a55]/20">
                    <img
                      src="/assets/ravion_logo_svg-01.svg"
                      alt="Ravion"
                      className="h-full w-full object-contain brightness-0 invert"
                    />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#f5f0e8]">RAVION</span>
                    <span className="block font-mono text-[9px] text-[#c99a55] uppercase">
                      Admin
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#f5f0e8]/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#c99a55] text-[#031513] font-semibold"
                          : "text-[#f5f0e8]/80 hover:bg-[#062623]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#031513] text-[#c99a55]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#c99a55]/20 space-y-2">
                <Link
                  href="/bio"
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#c99a55] text-[#031513] text-xs font-semibold"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>View Live /bio</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-950/30"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          {/* Top Page Header Bar */}
          {(title || actions) && (
            <div className="sticky top-0 z-20 bg-[#031513]/90 backdrop-blur-md border-b border-[#c99a55]/15 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#f5f0e8]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="font-sans text-xs sm:text-sm text-[#f5f0e8]/60 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">{actions}</div>
              )}
            </div>
          )}

          {/* Page Body */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
