import React from "react";

export type ViewMode = "grid" | "list" | "compact" | "cards";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
  className?: string;
}

/**
 * ⊞ View Mode Toggle (Ágora UI-09)
 *
 * Conmutador segmentado para alternar entre modos de presentación
 * de catálogos y tablas: Rejilla (Grid), Lista (List), Compacto (Compact) y Tarjetas (Cards).
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onChange,
  modes = ["grid", "list", "compact", "cards"],
  className = "",
}) => {
  const icons: Record<ViewMode, React.ReactNode> = {
    grid: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    list: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    compact: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    cards: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-white/[0.08] dark:bg-[#12141a] ${className}`}
    >
      {modes.map((m) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-label={`Vista ${m}`}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e222b] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {icons[m]}
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeToggle;
