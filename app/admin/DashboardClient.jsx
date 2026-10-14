"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Sparkles,
  Link2,
  Layers,
  FileText,
  CheckCircle,
  Plus,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Tags,
  Image as ImageIcon,
  MailCheck,
  FolderKanban,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function DashboardClient({ user }) {
  const [metrics, setMetrics] = useState({
    summary: {
      totalDigitalProducts: 0,
      totalAffiliateProducts: 0,
      totalPublishedLinks: 0,
      totalBioSections: 0,
      draftProducts: 0,
      publishedProducts: 0,
    },
    inquiries: { total: 0, new: 0 },
    samples: { total: 0, published: 0 },
    categories: { total: 0 },
    media: { total: 0 },
    loading: true,
  });

  const fetchMetrics = () => {
    fetch("/api/admin/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMetrics({ ...data, loading: false });
        } else {
          setMetrics((prev) => ({ ...prev, loading: false }));
        }
      })
      .catch(() => setMetrics((prev) => ({ ...prev, loading: false })));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const summary = metrics.summary || {
    totalDigitalProducts: 0,
    totalAffiliateProducts: 0,
    totalPublishedLinks: 0,
    totalBioSections: 0,
    draftProducts: 0,
    publishedProducts: 0,
  };

  const statCards = [
    {
      title: "Digital Products",
      value: summary.totalDigitalProducts,
      subtitle: "Downloadable guides & templates",
      icon: Package,
      href: "/admin/products?type=digital",
      badge: "Digital",
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/30",
    },
    {
      title: "Affiliate Products",
      value: summary.totalAffiliateProducts,
      subtitle: "Monetized recommendations",
      icon: TrendingUp,
      href: "/admin/products?type=affiliate",
      badge: "Affiliate",
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/30",
    },
    {
      title: "Published Links",
      value: summary.totalPublishedLinks,
      subtitle: "Active links in bio",
      icon: Link2,
      href: "/admin/links",
      badge: "Active",
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Bio Page Sections",
      value: summary.totalBioSections,
      subtitle: "Visible content blocks",
      icon: Layers,
      href: "/admin/bio",
      badge: "Live",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/30",
    },
    {
      title: "Published Products",
      value: summary.publishedProducts,
      subtitle: "Live in store & bio",
      icon: CheckCircle,
      href: "/admin/products?status=Published",
      badge: "Live",
      color: "from-teal-500/20 to-teal-500/5",
      borderColor: "border-teal-500/30",
    },
    {
      title: "Draft Products",
      value: summary.draftProducts,
      subtitle: "Unpublished items",
      icon: FileText,
      href: "/admin/products?status=Draft",
      badge: "In Progress",
      color: "from-orange-500/20 to-orange-500/5",
      borderColor: "border-orange-500/30",
    },
  ];

  const quickActions = [
    {
      label: "Add Digital Product",
      href: "/admin/products?action=new-digital",
      icon: Package,
      description: "Upload an ebook, guide, template or file",
      highlight: true,
    },
    {
      label: "Add Affiliate Product",
      href: "/admin/products?action=new-affiliate",
      icon: TrendingUp,
      description: "Add an Amazon or partner affiliate product",
      highlight: false,
    },
    {
      label: "Add New Link",
      href: "/admin/links?action=new",
      icon: Link2,
      description: "Create an external or social link for bio",
      highlight: false,
    },
    {
      label: "Edit Bio Page",
      href: "/admin/bio",
      icon: Sparkles,
      description: "Visual builder with live mobile & desktop preview",
      highlight: true,
    },
    {
      label: "Manage Categories",
      href: "/admin/categories",
      icon: Tags,
      description: "Organize products, services, and links",
      highlight: false,
    },
    {
      label: "Preview Website",
      href: "/bio",
      icon: ExternalLink,
      description: "View published public bio page in new tab",
      external: true,
      highlight: false,
    },
  ];

  return (
    <AdminLayout
      user={user}
      title="Dashboard Overview"
      subtitle="Website Control Center"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-1.5 rounded-xl border border-[#c99a55]/25 bg-[#062623] px-3 py-1.5 text-xs text-[#f5f0e8] hover:border-[#c99a55]"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${metrics.loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/bio"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-3.5 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all"
          >
            <span>Live Bio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#c99a55]/20 bg-gradient-to-r from-[#062b28] via-[#041d1a] to-[#031513] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#c99a55]/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full border border-[#c99a55]/30 bg-[#031513]/60 px-3 py-1 font-mono text-[11px] text-[#dfb77b] uppercase tracking-wider mb-3">
              No-Code Website CMS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#f5f0e8] font-medium leading-tight">
              Manage your digital space with <em className="text-[#c99a55] italic">zero code.</em>
            </h2>
            <p className="mt-2 text-sm text-[#f5f0e8]/75 leading-relaxed">
              Control your bio page sections, digital products, affiliate recommendations, external links, and brand settings seamlessly.
            </p>
          </div>
        </div>

        {/* 6 Required Summary Cards */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#f5f0e8]">Content Overview</h3>
            <span className="font-mono text-xs text-[#d1aa6b]">Real-time Database Metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a55] hover:shadow-xl hover:shadow-[#c99a55]/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-[#c99a55]/20 bg-[#031513]/70 px-2 py-0.5 font-mono text-[10px] text-[#d1aa6b] uppercase">
                      {card.badge}
                    </span>
                    <Icon className="h-5 w-5 text-[#c99a55] transition-transform group-hover:scale-110" />
                  </div>

                  <div className="mt-4">
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f0e8]">
                      {metrics.loading ? "—" : card.value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#f5f0e8]">{card.title}</p>
                    <p className="text-xs text-[#f5f0e8]/60 mt-0.5">{card.subtitle}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 font-mono text-[11px] text-[#c99a55] opacity-0 transition-opacity group-hover:opacity-100">
                    <span>Manage</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#f5f0e8]">Quick Actions</h3>
            <span className="font-mono text-xs text-[#d1aa6b]">Direct Workflows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                    action.highlight
                      ? "border-[#c99a55]/40 bg-[#062623] hover:border-[#c99a55] hover:bg-[#072f2b]"
                      : "border-[#c99a55]/15 bg-[#041d1a]/80 hover:border-[#c99a55]/50 hover:bg-[#062623]"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      action.highlight
                        ? "bg-[#c99a55] text-[#031513]"
                        : "border border-[#c99a55]/20 bg-[#031513] text-[#c99a55] group-hover:bg-[#c99a55] group-hover:text-[#031513]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm text-[#f5f0e8] group-hover:text-[#d1aa6b] transition-colors">
                        {action.label}
                      </p>
                      {action.external && <ExternalLink className="h-3.5 w-3.5 text-[#d1aa6b]" />}
                    </div>
                    <p className="text-xs text-[#f5f0e8]/60 mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary Hub: Inquiries, Samples, Media, Settings */}
        <div className="rounded-2xl border border-[#c99a55]/15 bg-[#041d1a]/60 p-6">
          <h3 className="font-serif text-lg font-semibold text-[#f5f0e8] mb-4">Website Assets & Operations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/admin/inquiry"
              className="rounded-xl border border-[#c99a55]/10 bg-[#031513] p-4 hover:border-[#c99a55]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#d1aa6b]">
                <MailCheck className="h-4 w-4" />
                <span>Inquiries</span>
              </div>
              <p className="mt-2 text-2xl font-bold font-serif text-[#f5f0e8]">
                {metrics.loading ? "—" : metrics.inquiries?.total || 0}
              </p>
              <p className="text-[11px] text-[#f5f0e8]/60 mt-0.5">
                {metrics.inquiries?.new ? `${metrics.inquiries.new} unread` : "All read"}
              </p>
            </Link>

            <Link
              href="/admin/samples"
              className="rounded-xl border border-[#c99a55]/10 bg-[#031513] p-4 hover:border-[#c99a55]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#d1aa6b]">
                <FolderKanban className="h-4 w-4" />
                <span>Samples</span>
              </div>
              <p className="mt-2 text-2xl font-bold font-serif text-[#f5f0e8]">
                {metrics.loading ? "—" : metrics.samples?.total || 0}
              </p>
              <p className="text-[11px] text-[#f5f0e8]/60 mt-0.5">Client showcase work</p>
            </Link>

            <Link
              href="/admin/media"
              className="rounded-xl border border-[#c99a55]/10 bg-[#031513] p-4 hover:border-[#c99a55]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#d1aa6b]">
                <ImageIcon className="h-4 w-4" />
                <span>Media</span>
              </div>
              <p className="mt-2 text-2xl font-bold font-serif text-[#f5f0e8]">
                {metrics.loading ? "—" : metrics.media?.total || 0}
              </p>
              <p className="text-[11px] text-[#f5f0e8]/60 mt-0.5">ImageKit uploads</p>
            </Link>

            <Link
              href="/admin/settings"
              className="rounded-xl border border-[#c99a55]/10 bg-[#031513] p-4 hover:border-[#c99a55]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#d1aa6b]">
                <Tags className="h-4 w-4" />
                <span>Categories</span>
              </div>
              <p className="mt-2 text-2xl font-bold font-serif text-[#f5f0e8]">
                {metrics.loading ? "—" : metrics.categories?.total || 0}
              </p>
              <p className="text-[11px] text-[#f5f0e8]/60 mt-0.5">Global taxonomies</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
