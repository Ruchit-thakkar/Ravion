"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

export function Art({ sample = {} }) {
  const mediaList =
    sample.media && sample.media.length > 0
      ? sample.media
      : sample.images && sample.images.length > 0
      ? sample.images
      : sample.thumbnail
      ? [{ url: sample.thumbnail, fileType: "image" }]
      : [];

  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="sample-art relative isolate h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-[#c99a55] to-[#103733]">
        <span className="absolute left-5 top-2 text-6xl font-serif text-white/65">
          R
        </span>
        <div className="sample-shape absolute left-1/2 top-20 -translate-x-1/2 -rotate-12" />
      </div>
    );
  }

  const items = mediaList.map((m) =>
    typeof m === "string" ? { url: m, fileType: "image" } : m
  );
  const safeIndex = (index + items.length) % items.length;
  const currentItem = items[safeIndex] || items[0];

  const getItemUrl = (item) => {
    const url = item?.url || item?.src || item;
    return typeof url === "string" ? url : "";
  };

  const currentUrl = getItemUrl(currentItem);
  const isVideo =
    currentItem?.fileType === "video" ||
    (typeof currentUrl === "string" &&
      (currentUrl.endsWith(".mp4") ||
        currentUrl.endsWith(".mkv") ||
        currentUrl.endsWith(".webm") ||
        currentUrl.endsWith(".mov")));

  const handlePrev = (e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % items.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="w-full">
      {/* Main Responsive Media Container */}
      <div
        className="relative mx-auto flex min-h-[280px] max-h-[80vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#031816] p-2 md:p-6 shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isVideo ? (
          <video
            key={currentUrl}
            src={currentUrl}
            controls
            playsInline
            className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
          />
        ) : (
          <img
            key={currentUrl}
            src={currentUrl}
            alt={sample.title || "Portfolio detail"}
            className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain select-none"
          />
        )}

        {/* Desktop & Mobile < > Gallery Navigation Controls */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Previous media"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#c99a55] hover:text-[#031513] hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Next media"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Gallery */}
      {items.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 px-2">
          {items.map((item, idx) => {
            const url = getItemUrl(item);
            const itemIsVideo =
              item?.fileType === "video" ||
              (typeof url === "string" &&
                (url.endsWith(".mp4") ||
                  url.endsWith(".mkv") ||
                  url.endsWith(".webm") ||
                  url.endsWith(".mov")));

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={`relative h-16 w-20 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                  safeIndex === idx
                    ? "border-[#c99a55] scale-105 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`View media ${idx + 1}`}
              >
                {itemIsVideo ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#062623] text-white">
                    <Film size={20} className="text-[#c99a55]" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Art;
