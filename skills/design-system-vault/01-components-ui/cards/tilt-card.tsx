import React, { useRef, useState, MouseEvent } from "react";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Maximum rotation angle in degrees (default: 14) */
  maxRotation?: number;
  /** Scale up on hover (default: 1.02) */
  hoverScale?: number;
  /** Glare/sheen specular reflection visibility (default: true) */
  glare?: boolean;
  /** Perspective distance in px (default: 1000) */
  perspective?: number;
  className?: string;
}

/**
 * 🕹️ Tilt Card 3D (Aceternity / Hover.dev Inspired)
 *
 * Interactive perspective card that dynamically tilts towards the cursor with
 * specular light sheen reflections, simulating tangible depth and haptic weight.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxRotation = 14,
  hoverScale = 1.02,
  glare = true,
  perspective = 1000,
  className = "",
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation between -maxRotation and +maxRotation
    const rotateY = ((mouseX - centerX) / centerX) * maxRotation;
    const rotateX = -((mouseY - centerY) / centerY) * maxRotation;

    setRotation({ x: rotateX, y: rotateY });

    if (glare) {
      const glareX = (mouseX / rect.width) * 100;
      const glareY = (mouseY / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotation.x.toFixed(2)}deg) rotateY(${rotation.y.toFixed(2)}deg) scale(${hoverScale})`
            : "rotateX(0deg) rotateY(0deg) scale(1)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md will-change-transform dark:border-white/[0.08] dark:bg-[#0f1115] dark:shadow-2xl ${className}`}
        {...props}
      >
        {/* Specular glare reflection overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.7), transparent 80%)`,
              mixBlendMode: "overlay",
            }}
          />
        )}

        {/* Content preserved in 3D plane */}
        <div style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default TiltCard;
