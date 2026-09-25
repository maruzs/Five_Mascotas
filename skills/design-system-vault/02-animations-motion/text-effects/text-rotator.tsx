import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface TextRotatorProps {
  /** Array of words or short phrases to rotate through */
  words: string[];
  /** Duration in milliseconds each word remains visible (default: 2800) */
  interval?: number;
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom CSS classes for the active rotating text */
  textClassName?: string;
  /** Transition direction: "vertical" (bottom to top) or "blur-fade" */
  mode?: "vertical" | "blur-fade";
}

/**
 * ⚡ Text Rotator (Kinetic Typography)
 *
 * Smooth, rhythmic text cycler inspired by Linear, Raycast, and Apple product headlines.
 * Uses Framer Motion's AnimatePresence with cubic-bezier curves for fluid word transitions.
 */
export const TextRotator: React.FC<TextRotatorProps> = ({
  words,
  interval = 2800,
  className = "",
  textClassName = "bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent font-extrabold",
  mode = "vertical",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  if (!words || words.length === 0) return null;

  const verticalVariants = {
    initial: {
      y: "110%",
      opacity: 0,
      filter: "blur(6px)",
      rotateX: -40,
    },
    animate: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 28,
        mass: 0.9,
      },
    },
    exit: {
      y: "-110%",
      opacity: 0,
      filter: "blur(6px)",
      rotateX: 40,
      transition: {
        duration: 0.28,
        ease: [0.32, 0, 0.67, 0],
      },
    },
  };

  const blurFadeVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      scale: 0.92,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: [0.32, 0, 0.67, 0],
      },
    },
  };

  const activeVariants = mode === "vertical" ? verticalVariants : blurFadeVariants;

  return (
    <span
      className={`inline-flex items-center overflow-hidden py-1 align-baseline ${className}`}
      style={{ perspective: "1000px" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[currentIndex]}
          variants={activeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`inline-block select-none transform-gpu whitespace-nowrap will-change-transform ${textClassName}`}
          aria-live="polite"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default TextRotator;
