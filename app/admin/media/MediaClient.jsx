"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  Film,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileImage,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function MediaClient({ user }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "image" | "video"
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchMedia();
  }, [typeFilter, search]);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (typeFilter !== "all") query.set("type", typeFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/admin/media?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch (err) {
      console.error(err);
      showNotification("Could not load media library.");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler via ImageKit
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload files");

      showNotification(`Uploaded ${files.length} file(s) to ImageKit!`);
      fetchMedia();
    } catch (err) {
      console.error(err);
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // 1-Click Copy URL
  const handleCopyUrl = (asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset._id);
    showNotification("URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe Delete Asset
  const handleDelete = async (asset) => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${asset._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete media asset.");
      }

      showNotification("Media asset deleted.");
      fetchMedia();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      user={user}
      title="Media Library"
      subtitle="ImageKit Cloud Assets"
      actions={
        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#c99a55]/30 bg-[#062623] px-3 py-1 font-mono text-xs text-[#d1aa6b]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c99a55]" />
              {notice}
            </span>
          )}

          <label className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-4 py-1.5 text-xs font-semibold text-[#031513] hover:bg-[#d1aa6b] transition-all shadow-md shadow-[#c99a55]/20">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Upload Media</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      }
    >
      <div className="space-y-6">
        {uploadError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Upload Drop Area */}
        <div className="relative rounded-2xl border-2 border-dashed border-[#c99a55]/30 bg-[#041d1a]/50 p-6 text-center hover:border-[#c99a55] hover:bg-[#062623]/40 transition-all">
          <label className="cursor-pointer block">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#062623] text-[#c99a55] border border-[#c99a55]/20">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <p className="font-serif text-base font-semibold text-cream">
                {uploading ? "Uploading to ImageKit Cloud..." : "Drag and drop images or click to upload"}
              </p>
              <p className="text-xs text-[#f5f0e8]/60">
                Supports JPG, PNG, WebP, SVG, MP4, WebM (up to 25MB per file)
              </p>
            </div>
          </label>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl border border-[#c99a55]/20 bg-[#041d1a] p-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              All Assets ({media.length})
            </button>
            <button
              onClick={() => setTypeFilter("image")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                typeFilter === "image"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setTypeFilter("video")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                typeFilter === "video"
                  ? "bg-[#c99a55] text-[#031513] font-semibold"
                  : "text-[#f5f0e8]/70 hover:text-white"
              }`}
            >
              Videos
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d1aa6b]" />
            <input
              type="text"
              placeholder="Search media by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#c99a55]/20 bg-[#041d1a] pl-10 pr-4 py-2 text-xs text-[#f5f0e8] placeholder-[#f5f0e8]/40 focus:border-[#c99a55] focus:outline-none"
            />
          </div>
        </div>

        {/* Media Grid */}
        {loading && (
          <div className="p-16 text-center text-[#f5f0e8]/50">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#c99a55] mb-2" />
            Loading media library...
          </div>
        )}

        {!loading && media.length === 0 && (
          <div className="rounded-3xl border border-[#c99a55]/20 bg-[#041d1a]/60 p-16 text-center">
            <ImageIcon className="h-10 w-10 text-[#c99a55]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-cream">No media assets found</h3>
            <p className="text-xs text-[#f5f0e8]/60 mt-1">
              Upload photos, banners, and video clips to use across your website.
            </p>
          </div>
        )}

        {!loading && media.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((asset) => (
              <div
                key={asset._id}
                className="group relative rounded-2xl border border-[#c99a55]/20 bg-[#041d1a] overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:border-[#c99a55]"
              >
                {/* Thumbnail Preview */}
                <div
                  onClick={() => setPreviewAsset(asset)}
                  className="cursor-pointer relative h-36 w-full bg-[#031513] overflow-hidden"
                >
                  {asset.fileType === "video" ? (
                    <div className="h-full w-full flex items-center justify-center bg-black/80 text-[#c99a55]">
                      <Film className="h-8 w-8" />
                    </div>
                  ) : (
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  <span className="absolute top-2 left-2 rounded-md bg-[#031513]/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#d1aa6b] backdrop-blur-sm">
                    {asset.fileType}
                  </span>
                </div>

                {/* Metadata & Actions */}
                <div className="p-3">
                  <p className="font-medium text-xs text-cream truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#f5f0e8]/50 mt-0.5">
                    {formatSize(asset.size)} ·{" "}
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#c99a55]/10">
                    <button
                      onClick={() => handleCopyUrl(asset)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#d1aa6b] hover:bg-[#062623] hover:text-white transition-colors"
                      title="Copy URL to Clipboard"
                    >
                      {copiedId === asset._id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(asset)}
                      className="rounded-lg p-1 text-red-400 hover:bg-red-950/40"
                      title="Delete Asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSET PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#c99a55]/30 bg-[#041d1a] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute right-4 top-4 rounded-full bg-[#062623] p-1.5 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-80 w-full rounded-2xl bg-[#031513] overflow-hidden flex items-center justify-center border border-[#c99a55]/20">
              {previewAsset.fileType === "video" ? (
                <video src={previewAsset.url} controls className="max-h-full max-w-full" />
              ) : (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-cream">
                  {previewAsset.name}
                </h4>
                <p className="font-mono text-xs text-[#d1aa6b] mt-0.5 truncate max-w-md">
                  {previewAsset.url}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewAsset)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c99a55] px-3.5 py-1.5 text-xs font-semibold text-[#031513]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy URL</span>
                </button>
                <a
                  href={previewAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/20 p-2 text-white/80 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
