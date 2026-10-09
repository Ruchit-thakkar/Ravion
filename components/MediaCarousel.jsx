"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

export function MediaCarousel({ media = [], title = "" }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const items =
    Array.isArray(media) && media.length > 0
      ? media
      : [{ url: "/assets/sample-1.jpg", fileType: "image" }];

  // Auto-slides every 3.5 seconds when not hovered/touched
  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prev) => (prev + 1) % items.length);
  };

  const handleTouchStart = (e) => {
    setIsHovered(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      setIndex((prev) => (prev + 1) % items.length);
    } else if (diff < -45) {
      setIndex((prev) => (prev - 1 + items.length) % items.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const currentItem = items[index] || items[0];
  const isVideo =
    currentItem?.fileType === "video" ||
    (typeof currentItem?.url === "string" &&
      (currentItem.url.endsWith(".mp4") ||
        currentItem.url.endsWith(".mkv") ||
        currentItem.url.endsWith(".webm") ||
        currentItem.url.endsWith(".mov")));

  return (
    <div
      className="relative aspect-[16/11] w-full overflow-hidden bg-[#082d2a]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isVideo ? (
        <video
          key={currentItem.url}
          src={currentItem.url}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          key={currentItem.url}
          src={currentItem.url}
          alt={title || "Portfolio sample"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Video Indicator */}
      {isVideo && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-sm">
          <Film size={12} className="text-[#d1aa6b]" />
          <span>Video</span>
        </span>
      )}

      {/* Desktop < > Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95 group-hover:flex"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-[#c99a55] hover:text-[#031513] active:scale-95 group-hover:flex"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1">
            {items.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1 rounded-full transition-all ${
                  index === dotIdx ? "w-4 bg-[#c99a55]" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MediaCarousel;
