"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  FolderKanban,
  Grid,
  Home,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

export default function AdminSidebar({
  admin,
  isOpen = false,
  onClose = () => {},
  onLogout = () => {},
  loggingOut = false,
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      status: "active",
      phase: "Phase 2",
    },
    {
      name: "Website Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
      status: "active",
      phase: "Phase 3",
    },
    {
      name: "Client Inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
      active: pathname.startsWith("/admin/inquiries"),
      status: "active",
      phase: "Phase 4",
    },
    {
      name: "Portfolio Samples",
      href: "/admin/samples",
      icon: FolderKanban,
      active: pathname.startsWith("/admin/samples"),
      status: "active",
      phase: "Phase 5",
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Grid,
      active: pathname.startsWith("/admin/categories"),
      status: "active",
      phase: "Phase 6",
    },
    {
      name: "Link in Bio",
      href: "/admin/bio",
      icon: Link2,
      active: pathname.startsWith("/admin/bio"),
      status: "active",
      phase: "Phase 7",
    },
  ];

  const adminEmail = admin?.email || "admin@ravion.in";
  const adminDisplayName = adminEmail.split("@")[0];
  const initial = adminDisplayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#031513]/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-[#082d2a]/12 bg-[#051c19] text-[#f5f0e8] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#f5f0e8]/10 px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            title="Return to Public Website"
          >
            <img
              src="/assets/ravion_logo_svg-01.svg"
              alt="Ravion"
              className="h-8 w-auto brightness-0 invert"
            />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-semibold tracking-widest text-[#c99a55] uppercase">
                STUDIO WORKSPACE
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#f5f0e8]/60 hover:bg-white/10 hover:text-white lg:hidden transition-colors cursor-pointer"
            aria-label="Close sidebar navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Eyebrow Label */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium tracking-widest text-[#c99a55] uppercase">
              NAVIGATION
            </span>
            <span className="rounded-full bg-[#c99a55]/15 px-2 py-0.5 font-mono text-[9px] font-semibold text-[#dfb77b]">
              PHASE 2
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isClickable = item.status === "active";

            if (isClickable) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-medium transition-all duration-200 ${
                    item.active
                      ? "bg-[#c99a55] text-[#031513] shadow-md font-semibold"
                      : "text-[#f5f0e8]/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={item.active ? "text-[#031513]" : "text-[#c99a55] group-hover:scale-110 transition-transform"}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase ${
                      item.active
                        ? "bg-[#031513]/15 text-[#031513] font-bold"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    Active
                  </span>
                </Link>
              );
            }

            // Future phase coming soon item
            return (
              <div
                key={item.name}
                className="group flex cursor-default select-none items-center justify-between rounded-xl px-3.5 py-3 text-xs font-medium text-[#f5f0e8]/45 transition-colors hover:bg-white/5"
                title={`${item.name} is scheduled for ${item.phase}.`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className="text-[#f5f0e8]/30" />
                  <span>{item.name}</span>
                </div>
                <span className="rounded-md border border-[#c99a55]/20 bg-[#c99a55]/10 px-2 py-0.5 font-mono text-[9px] font-medium text-[#c99a55]/80">
                  {item.phase}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Quick Link to Public Website */}
        <div className="px-4 py-3 border-t border-[#f5f0e8]/10">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-[#f5f0e8]/80 transition-all hover:border-[#c99a55]/50 hover:bg-white/10 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink size={14} className="text-[#c99a55]" />
              <span>Live Website</span>
            </div>
            <span className="font-mono text-[10px] text-white/50">ravion.in</span>
          </Link>
        </div>

        {/* Administrator Profile Card */}
        <div className="border-t border-[#f5f0e8]/10 bg-[#031513]/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c99a55] font-serif text-sm font-bold text-[#031513] shadow-inner">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white capitalize">
                  {adminDisplayName}
                </p>
                <p className="truncate font-mono text-[10px] text-[#c99a55]">
                  {admin?.role || "Superuser"}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 cursor-pointer"
              title="Sign Out"
              aria-label="Sign out of Admin Dashboard"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
