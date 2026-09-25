import React, { useRef, useState, MouseEvent } from "react";

export interface ChromaticLiquidMetalProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * 🪙 Chromatic Liquid Metal (Libraries.dev "metal-fx")
 *
 * Superficie metálica líquida reflectante con distorsión iridiscente
 * y reflejos especulares dinámicos que reaccionan a la luz del puntero.
 */
export const ChromaticLiquidMetal: React.FC<ChromaticLiquidMetalProps> = ({
  children,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-3xl border border-white/20 p-8 shadow-2xl ${className}`}
      style={{
        background: `
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%),
          linear-gradient(135deg, #1e222d 0%, #0d0f14 50%, #151821 100%)
        `,
      }}
    >
      {/* Specular Chromatic Ribbon */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-300"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, #e0e7ff 0%, #38bdf8 30%, #ec4899 60%, transparent 75%)
          `,
        }}
      />

      {/* Brushed Hairline Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ChromaticLiquidMetal;
