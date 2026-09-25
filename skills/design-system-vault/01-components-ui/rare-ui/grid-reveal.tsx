import React, { useState } from "react";

export interface GridRevealProps {
  imageUrl: string;
  alt?: string;
  gridCols?: number;
  className?: string;
}

/**
 * 🔲 AI Grid Reveal Loader (Rare UI)
 *
 * Efecto de revelado progresivo estilo generación de imágenes por IA (Midjourney/Flux)
 * donde una rejilla holográfica disuelve gradualmente sus celdas para exponer la imagen real.
 */
export const GridReveal: React.FC<GridRevealProps> = ({
  imageUrl,
  alt = "AI Generated Visual",
  gridCols = 8,
  className = "",
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const totalCells = gridCols * gridCols;

  return (
    <div
      className={`group relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl dark:border-white/10 ${className}`}
    >
      {/* Real Image */}
      <img
        src={imageUrl}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Grid Overlay Mask */}
      <div
        className={`pointer-events-none absolute inset-0 grid transition-opacity duration-700 ${
          isRevealed ? "opacity-0" : "opacity-100"
        }`}
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => (
          <div
            key={idx}
            className="border-[0.5px] border-white/5 bg-[#090b0e] transition-opacity duration-500"
            style={{
              transitionDelay: `${(idx % 12) * 40}ms`,
            }}
          />
        ))}
      </div>

      {/* Trigger Button Overlay */}
      <div className="absolute inset-x-4 bottom-4 flex justify-center">
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-xl backdrop-blur-md transition hover:bg-white active:scale-95 dark:bg-[#0c0e12]/90 dark:text-white"
        >
          {isRevealed ? "Ocultar en Rejilla" : "✨ Revelar Imagen IA"}
        </button>
      </div>
    </div>
  );
};

export default GridReveal;
