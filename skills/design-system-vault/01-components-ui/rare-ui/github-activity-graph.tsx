import React, { useState } from "react";

export interface GithubActivityGraphProps {
  username?: string;
  totalContributions?: number;
  className?: string;
}

/**
 * 🟩 GitHub Activity Heatmap Graph (Rare UI)
 *
 * Malla de contribuciones interactiva estilo GitHub con celdas de intensidad de color,
 * panel expandible con estadísticas y ranking de repositorios activos.
 */
export const GithubActivityGraph: React.FC<GithubActivityGraphProps> = ({
  username = "solofounder",
  totalContributions = 1428,
  className = "",
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; count: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Generate 52 weeks x 7 days
  const weeks = 28; // compact display
  const days = 7;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl dark:border-white/[0.08] dark:bg-[#0c0e12] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {username}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalContributions.toLocaleString()} contributions in the last year
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          {expanded ? "Hide Repos" : "Top Repos"}
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
        {Array.from({ length: weeks }).map((_, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {Array.from({ length: days }).map((_, dIdx) => {
              // Procedural intensity level 0-4
              const val = (wIdx * 7 + dIdx * 3) % 5;
              const bgColors = [
                "bg-slate-100 dark:bg-white/5",
                "bg-emerald-200 dark:bg-emerald-950",
                "bg-emerald-400 dark:bg-emerald-800",
                "bg-emerald-500 dark:bg-emerald-600",
                "bg-emerald-600 dark:bg-emerald-400",
              ];

              return (
                <div
                  key={dIdx}
                  onMouseEnter={() => setHoveredCell({ day: wIdx * 7 + dIdx, count: val * 3 })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`h-3 w-3 rounded-[3px] transition-transform hover:scale-125 ${bgColors[val]}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Hover Info */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {hoveredCell
            ? `${hoveredCell.count} commits on day ${hoveredCell.day}`
            : "Hover on cells for commit details"}
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <span className="h-2 w-2 rounded-[2px] bg-slate-100 dark:bg-white/5" />
          <span className="h-2 w-2 rounded-[2px] bg-emerald-300 dark:bg-emerald-900" />
          <span className="h-2 w-2 rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Expandable Top Repos */}
      {expanded && (
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">design-library</span>
            <span className="text-slate-400">842 commits</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">agora-core</span>
            <span className="text-slate-400">386 commits</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubActivityGraph;
