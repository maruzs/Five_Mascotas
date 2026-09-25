import React, { useEffect, useRef, useState } from "react";

export interface WordOpacityRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

/**
 * ✨ Word Opacity Reveal on Scroll (Ágora SCR-02)
 *
 * Lectura que cobra vida: cada palabra transiciona progresivamente
 * desde un estado tenue/translúcido hacia opacidad 100% conforme avanza el scroll.
 */
export const WordOpacityReveal: React.FC<WordOpacityRevealProps> = ({
  text,
  className = "",
  wordClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const words = text.split(" ");

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress while container is in viewport
      const totalDistance = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentPos / (totalDistance * 0.75)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`mx-auto max-w-4xl py-24 text-2xl font-semibold leading-relaxed tracking-tight sm:text-4xl md:text-5xl ${className}`}
    >
      <p className="flex flex-wrap gap-x-2.5 gap-y-2">
        {words.map((word, idx) => {
          const wordStep = idx / words.length;
          const isRevealed = scrollProgress >= wordStep;
          const opacity = Math.max(0.12, Math.min(1, (scrollProgress - wordStep) * words.length + 0.12));

          return (
            <span
              key={idx}
              style={{
                opacity: isRevealed ? opacity : 0.12,
                filter: isRevealed ? "blur(0px)" : "blur(2px)",
                transition: "opacity 0.2s ease-out, filter 0.2s ease-out",
              }}
              className={`inline-block select-none will-change-[opacity,filter] ${wordClassName}`}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
};

export default WordOpacityReveal;
