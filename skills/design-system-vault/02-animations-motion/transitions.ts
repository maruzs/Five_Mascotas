/**
 * ⚡ Transitions & Motion Physics Tokens
 *
 * Cinematic easing curves, spring physics presets, and duration constants
 * designed for elite high-craft digital products (Linear, Raycast, Stripe).
 *
 * Compatible with Framer Motion (motion/react), CSS transitions, and GSAP.
 */

// ==========================================
// 1. Framer Motion Spring Presets
// ==========================================
export const springs = {
  /** Ultra-snappy micro-interactions: buttons, toggles, badges */
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.8,
  },
  /** Smooth & responsive: dropdowns, tooltips, popovers */
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 28,
    mass: 1,
  },
  /** Gentle & elegant: modal dialogs, drawers, route transitions */
  gentle: {
    type: "spring" as const,
    stiffness: 180,
    damping: 24,
    mass: 1.1,
  },
  /** Heavy & grounded: large bento cards, expansive panels */
  heavy: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
    mass: 1.4,
  },
  /** Bouncy & organic: celebratory badges, notification pings */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15,
    mass: 0.9,
  },
  /** Magnetic hover effect damping */
  magnetic: {
    type: "spring" as const,
    stiffness: 250,
    damping: 18,
    mass: 0.5,
  },
} as const;

// ==========================================
// 2. Cinematic Easing Curves (Cubic Béziers)
// ==========================================
export const easings = {
  /** Linear default curve for continuous rotations or progress bars */
  linear: [0, 0, 1, 1],

  /** Standard smooth entrance (ease-out-cubic) */
  easeOutCubic: [0.33, 1, 0.68, 1],

  /** Standard smooth exit (ease-in-cubic) */
  easeInCubic: [0.32, 0, 0.67, 0],

  /** Apple / iOS fluid navigation curve */
  appleEase: [0.25, 0.1, 0.25, 1],

  /** Linear.app signature quick-snap easing */
  linearSnap: [0.16, 1, 0.3, 1],

  /** Stripe fluid panel reveal */
  stripeFluid: [0.4, 0, 0.2, 1],

  /** High-impact dramatic reveal for marketing heroes and kinetic titles */
  cinematicDramatic: [0.76, 0, 0.24, 1],

  /** CSS String equivalents for native stylesheets */
  css: {
    linearSnap: "cubic-bezier(0.16, 1, 0.3, 1)",
    appleEase: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    stripeFluid: "cubic-bezier(0.4, 0, 0.2, 1)",
    cinematicDramatic: "cubic-bezier(0.76, 0, 0.24, 1)",
  },
} as const;

// ==========================================
// 3. Durations (Milliseconds & Seconds)
// ==========================================
export const durations = {
  instant: 0.1,
  fast: 0.2,
  medium: 0.35,
  slow: 0.6,
  cinematic: 0.9,
  deliberate: 1.4,

  // Milliseconds equivalent for JS timeouts
  ms: {
    instant: 100,
    fast: 200,
    medium: 350,
    slow: 600,
    cinematic: 900,
    deliberate: 1400,
  },
} as const;

// ==========================================
// 4. Stagger Variants for Framer Motion
// ==========================================
export const staggerVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: springs.snappy,
    },
  },
} as const;

export default {
  springs,
  easings,
  durations,
  staggerVariants,
};
