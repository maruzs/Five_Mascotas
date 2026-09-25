import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";

export interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  /** Magnetic pull distance strength (default: 0.35) */
  strength?: number;
  /** Spring physics config for release return */
  springConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  children: React.ReactNode;
  className?: string;
}

/**
 * 🧲 Magnetic Button (Motion Primitives / Awwwards Inspired)
 *
 * Interactive button with spring physics that dynamically gravitates toward the cursor
 * when hovered, creating a tactile and organic pull feeling.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  strength = 0.35,
  springConfig = { stiffness: 220, damping: 18, mass: 0.4 },
  children,
  className = "",
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  // Position motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to eliminate jitter
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);

    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    x.set(0);
    y.set(0);
    onMouseLeave?.(e);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 pointer-events-none">
        {children}
      </span>
    </motion.button>
  );
};

export default MagneticButton;
