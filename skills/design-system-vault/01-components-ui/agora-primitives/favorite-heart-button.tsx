import React, { useState } from "react";

export interface FavoriteHeartButtonProps {
  isFavorite?: boolean;
  onToggle?: (favorite: boolean) => void;
  size?: number;
  count?: number;
  className?: string;
}

/**
 * 💖 Favorite Heart Button (Ágora UI-11)
 *
 * Botón de favoritos táctil con micro-explosión de partículas SVG,
 * animación elástica de escala y contador numérico interactivo.
 */
export const FavoriteHeartButton: React.FC<FavoriteHeartButtonProps> = ({
  isFavorite = false,
  onToggle,
  size = 20,
  count,
  className = "",
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    const next = !favorite;
    setFavorite(next);
    if (next) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`group relative inline-flex items-center gap-1.5 rounded-full p-2 text-xs font-semibold transition-transform active:scale-90 focus:outline-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Heart SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={`transition-all duration-300 ${
            favorite
              ? "fill-rose-500 stroke-rose-500 scale-110"
              : "fill-transparent stroke-slate-400 group-hover:stroke-rose-400"
          } ${animating ? "animate-[bounce_0.5s_ease-out]" : ""}`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>

        {/* Burst particles */}
        {animating && (
          <div className="pointer-events-none absolute inset-0 -m-3 flex items-center justify-center">
            <span className="absolute h-1.5 w-1.5 -translate-y-3 rounded-full bg-rose-400 animate-ping" />
            <span className="absolute h-1.5 w-1.5 translate-x-3 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute h-1.5 w-1.5 translate-y-3 rounded-full bg-indigo-400 animate-ping" />
            <span className="absolute h-1.5 w-1.5 -translate-x-3 rounded-full bg-pink-400 animate-ping" />
          </div>
        )}
      </div>

      {count !== undefined && (
        <span
          className={`tabular-nums transition-colors ${
            favorite ? "text-rose-500 font-bold" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {favorite ? count + 1 : count}
        </span>
      )}
    </button>
  );
};

export default FavoriteHeartButton;
