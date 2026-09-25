import React, { useEffect, useRef, useState } from "react";

export interface DepthMaskRevealProps {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * 🏔️ Depth Mask Parallax Reveal (Ágora SCR-03)
 *
 * Efecto cinematográfico donde una imagen o escena se expande desde una máscara
 * geométrica con escalado inverso (scale parallax) y desenfoque dinámico al scroll.
 */
export const DepthMaskReveal: React.FC<DepthMaskRevealProps> = ({
  imageUrl,
  title = "Perspectiva Inmersiva",
  subtitle = "Arquitectura visual con profundidad de campo vinculada al scroll",
  className = "",
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.15);
  const [borderRadius, setBorderRadius] = useState(48);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));

      // Scale down image from 1.25 to 1.0
      setScale(1.25 - progress * 0.25);
      // Reduce rounded corners to full bleed
      setBorderRadius(Math.max(0, 48 - progress * 48));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`relative min-h-[70vh] w-full overflow-hidden px-4 py-16 sm:px-8 ${className}`}
    >
      <div
        className="relative mx-auto aspect-video max-w-6xl overflow-hidden shadow-2xl transition-[border-radius] duration-150 ease-out will-change-transform"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {/* Parallax Image */}
        <img
          src={imageUrl}
          alt={title}
          style={{ transform: `scale(${scale})` }}
          className="h-full w-full object-cover will-change-transform transition-transform duration-100 ease-out"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Text Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 text-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Showcase Editorial
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepthMaskReveal;
