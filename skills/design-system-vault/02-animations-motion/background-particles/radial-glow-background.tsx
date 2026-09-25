import React, { useEffect, useRef, useState } from "react";

export interface RadialGlowBackgroundProps {
  /** Main children content rendered above background */
  children?: React.ReactNode;
  /** Primary halo color in hex/rgba (default: indigo/violet) */
  primaryColor?: string;
  /** Secondary halo color in hex/rgba (default: cyan/teal) */
  secondaryColor?: string;
  /** Whether mouse pointer gently pulls the central halo */
  interactive?: boolean;
  /** Background base color (default: ultra dark OLED #07080a) */
  backgroundColor?: string;
  /** Enable subtle film grain texture overlay */
  withGrain?: boolean;
  /** Custom container class */
  className?: string;
}

/**
 * 🌌 Radial Glow Background (Dark Tech / OLED Halos)
 *
 * Immersive ambient background featuring animated organic radial gradients
 * that gently breathe and react to pointer movement, inspired by Linear.app and Raycast.
 */
export const RadialGlowBackground: React.FC<RadialGlowBackgroundProps> = ({
  children,
  primaryColor = "rgba(99, 102, 241, 0.15)", // Indigo-500
  secondaryColor = "rgba(56, 189, 248, 0.12)", // Sky-400
  interactive = true,
  backgroundColor = "#08090a",
  withGrain = true,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // percentages

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const target = containerRef.current;
    if (target) {
      target.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (target) {
        target.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[400px] w-full overflow-hidden isolate ${className}`}
      style={{ backgroundColor }}
    >
      {/* Dynamic Animated Halos */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, ${primaryColor}, transparent 70%),
            radial-gradient(500px circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, ${secondaryColor}, transparent 65%),
            radial-gradient(800px circle at 50% -20%, rgba(139, 92, 246, 0.08), transparent 75%)
          `,
        }}
      />

      {/* Pulsing ambient accent orb (CSS keyframe simulation) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[750px] rounded-full blur-[120px] opacity-40 animate-pulse"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(120, 119, 198, 0.28) 0%, rgba(255,255,255,0) 70%)",
          animationDuration: "8s",
        }}
      />

      {/* Subtle Hairline Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Optional Film Grain Texture Overlay */}
      {withGrain && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Children Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default RadialGlowBackground;
