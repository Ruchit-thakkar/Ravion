/**
 * RAVION ANIMATION CONFIGURATION
 * 
 * Central configuration architecture designed for future MongoDB persistence
 * and Admin Panel control without needing component-level changes.
 */

export const defaultAnimationConfig = {
  // Global master switch
  animationEnabled: true,
  // Automatically respects user OS prefers-reduced-motion setting
  respectReducedMotion: true,
  
  // Hero section animation settings
  hero: {
    enabled: true,
    titleStagger: 0.1,
    duration: 0.9,
    ease: "power3.out",
    orbParallaxSpeed: 0.25,
  },

  // About section animation settings
  about: {
    enabled: true,
    yOffset: 40,
    duration: 0.85,
    ease: "power2.out",
  },

  // Services section animation settings
  services: {
    enabled: true,
    cardStagger: 0.16,
    duration: 0.8,
    ease: "power3.out",
    hoverEnabled: true,
  },

  // Work / Samples section animation settings
  work: {
    enabled: true,
    cardStagger: 0.14,
    duration: 0.85,
    ease: "power3.out",
    hoverZoom: 1.05,
    hoverEnabled: true,
  },

  // Contact section animation settings
  contact: {
    enabled: true,
    duration: 0.8,
    ease: "power2.out",
  },

  // Subtle Scroll Parallax settings
  parallax: {
    enabled: true,
    smoothness: 1,
    mobileDisabled: true, // Disable heavy parallax on mobile for performance
  },
};

export function getAnimationConfig() {
  // In future phases, this can fetch or merge from MongoDB / Admin settings
  return defaultAnimationConfig;
}
