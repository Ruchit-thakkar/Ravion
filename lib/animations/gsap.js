"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { defaultAnimationConfig } from "./config";

// Ensure GSAP plugins are registered safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Checks if the user prefers reduced motion or if on mobile
 */
export function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * Custom React Hook for executing GSAP animations with proper React lifecycle & ScrollTrigger cleanup.
 * @param {Function} animationCallback - Callback containing GSAP animations
 * @param {Array} dependencies - Hook dependency array
 */
export function useGSAPAnimation(animationCallback, dependencies = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled) return;
    if (defaultAnimationConfig.respectReducedMotion && isReducedMotion()) return;
    if (!containerRef.current) return;

    // Use gsap.context for bulletproof cleanup in React
    const ctx = gsap.context(() => {
      animationCallback({
        container: containerRef.current,
        gsap,
        ScrollTrigger,
        isMobile: isMobileDevice(),
      });
    }, containerRef);

    return () => {
      ctx.revert(); // Clean up all GSAP tweens and ScrollTriggers on unmount
    };
  }, dependencies);

  return containerRef;
}

/**
 * Helper to create a clean scroll-triggered reveal animation
 */
export function createScrollReveal(target, options = {}) {
  const {
    trigger = target,
    start = "top 85%",
    duration = 0.85,
    y = 35,
    x = 0,
    opacity = 0,
    stagger = 0,
    ease = "power3.out",
    delay = 0,
  } = options;

  return gsap.from(target, {
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "play none none none",
    },
    y,
    x,
    opacity,
    duration,
    stagger,
    ease,
    delay,
    clearProps: "transform,opacity",
  });
}
