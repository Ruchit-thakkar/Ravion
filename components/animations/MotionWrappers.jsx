"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, isReducedMotion, isMobileDevice } from "@/lib/animations/gsap";
import { defaultAnimationConfig } from "@/lib/animations/config";

/**
 * ScrollReveal: Animates its container or elements on scroll.
 */
export function ScrollReveal({
  children,
  className = "",
  y = 35,
  x = 0,
  duration = 0.85,
  delay = 0,
  ease = "power3.out",
  threshold = "top 88%",
  as: Component = "div",
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: threshold,
          toggleActions: "play none none none",
        },
        y,
        x,
        opacity: 0,
        duration,
        delay,
        ease,
        clearProps: "transform,opacity",
      });
    }, ref);

    return () => ctx.revert();
  }, [y, x, duration, delay, ease, threshold]);

  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  );
}

/**
 * StaggerContainer: Animates its child items with staggered delay.
 */
export function StaggerContainer({
  children,
  className = "",
  itemSelector = "> *",
  stagger = 0.12,
  y = 35,
  duration = 0.8,
  ease = "power3.out",
  threshold = "top 85%",
  as: Component = "div",
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion()) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const items = container.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.from(items, {
        scrollTrigger: {
          trigger: container,
          start: threshold,
          toggleActions: "play none none none",
        },
        y,
        opacity: 0,
        stagger,
        duration,
        ease,
        clearProps: "transform,opacity",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [itemSelector, stagger, y, duration, ease, threshold]);

  return (
    <Component ref={containerRef} className={className} {...props}>
      {children}
    </Component>
  );
}

/**
 * ParallaxLayer: Creates subtle depth without horizontal overflowing.
 */
export function ParallaxLayer({
  children,
  className = "",
  speed = 0.2, // speed multiplier relative to scroll
  direction = "y",
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!defaultAnimationConfig.animationEnabled || isReducedMotion() || isMobileDevice()) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const movement = speed * 120;
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
        y: direction === "y" ? -movement : 0,
        x: direction === "x" ? -movement : 0,
        ease: "none",
      });
    }, ref);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}
