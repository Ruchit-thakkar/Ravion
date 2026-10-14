"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MailCheck,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function InquiryClient({ user }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "new" | "read"
  const [search, setSearch] = useState("");
  const [actionNotice, setActionNotice] = useState("");

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

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 3500);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
      showNotification(`Inquiry marked as ${newStatus}.`);
    } catch (err) {
      console.error(err);
      showNotification("Could not update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");

      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      showNotification("Inquiry deleted.");
    } catch (err) {
      console.error(err);
      showNotification("Could not delete inquiry.");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const isNew = inq.status?.toLowerCase() === "new" || !inq.status;
    if (filter === "new" && !isNew) return false;
    if (filter === "read" && isNew) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inq.name?.toLowerCase().includes(q) ||
      inq.email?.toLowerCase().includes(q) ||
      inq.message?.toLowerCase().includes(q) ||
      inq.service?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout
      user={user}
      title="Client Inquiries"
      subtitle="Direct website contact submissions"
      actions={
        actionNotice && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
            {actionNotice}
          </span>
        )
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl border border-[#c99a55]/20 bg-[#041d1a] p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              All Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "new"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              Unread / New
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "read"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              Archived / Read
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d1aa6b]" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] pl-10 pr-4 py-2 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 focus:border-[#c99a55] focus:outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center text-[#f5f0e8]/50">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#c99a55] mb-2" />
            Loading inquiries...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInquiries.length === 0 && (
          <div className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/60 p-16 text-center">
            <MailCheck className="h-10 w-10 text-[#c99a55]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-cream">No inquiries found</h3>
            <p className="text-xs text-[#f5f0e8]/60 mt-1">
              New client inquiries submitted on the homepage will appear here.
            </p>
          </div>
        )}

        {/* Inquiries List */}
        {!loading && filteredInquiries.length > 0 && (
          <div className="space-y-4">
            {filteredInquiries.map((inq) => {
              const isNew = inq.status?.toLowerCase() === "new" || !inq.status;
              return (
                <div
                  key={inq._id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                    isNew
                      ? "border-[#c99a55]/40 bg-[#041d1a] shadow-lg"
                      : "border-white/10 bg-[#031513]/60 opacity-80"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-cream">
                          {inq.name}
                        </h4>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[9px] uppercase font-bold ${
                            isNew
                              ? "bg-[#c99a55] text-[#031513]"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {isNew ? "New" : "Read"}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#d1aa6b] mt-0.5">
                        {inq.service || "General Inquiry"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(inq._id, isNew ? "read" : "new")}
                        className="rounded-xl border border-[#c99a55]/20 bg-[#062623] px-3 py-1.5 text-xs text-[#d1aa6b] hover:border-[#c99a55]"
                      >
                        {isNew ? "Mark Read" : "Mark Unread"}
                      </button>
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="rounded-xl p-2 text-red-400 hover:bg-red-950/40"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-[#f5f0e8]/90 leading-relaxed whitespace-pre-wrap bg-[#031513]/60 p-4 rounded-xl border border-white/5">
                    {inq.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#f5f0e8]/70 pt-2 border-t border-[#c99a55]/10">
                    <a
                      href={`mailto:${inq.email}`}
                      className="flex items-center gap-1.5 hover:text-[#d1aa6b]"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#c99a55]" />
                      <span>{inq.email}</span>
                    </a>

                    {inq.phone && (
                      <a
                        href={`tel:${inq.phone}`}
                        className="flex items-center gap-1.5 hover:text-[#d1aa6b]"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#c99a55]" />
                        <span>{inq.phone}</span>
                      </a>
                    )}

                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#f5f0e8]/40 ml-auto">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(inq.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
