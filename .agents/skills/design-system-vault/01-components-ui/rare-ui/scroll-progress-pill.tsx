import React, { useState, useEffect } from "react";

export interface SectionItem {
  id: string;
  title: string;
}

export interface ScrollProgressPillProps {
  sections?: SectionItem[];
  className?: string;
}

/**
 * 📜 Scroll Progress Pill (Rare UI)
 *
 * Píldora flotante que mide el avance del scroll en tiempo real
 * y se expande en un menú squircle desplegable con accesos directos a las secciones.
 */
export const ScrollProgressPill: React.FC<ScrollProgressPillProps> = ({
  sections = [
    { id: "hero", title: "Portada" },
    { id: "cards", title: "Tarjetas & Bento" },
    { id: "dashboards", title: "Métricas" },
    { id: "ecommerce", title: "Catálogo" },
  ],
  className = "",
}) => {
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      const pct = Math.min(100, Math.max(0, Math.round((current / (totalScroll || 1)) * 100)));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsExpanded(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      {/* Expanded Section Menu */}
      {isExpanded && (
        <div className="mb-3 w-48 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#0f1115]/95">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Saltar a sección
          </div>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => jumpTo(sec.id)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <span>{sec.title}</span>
              <span className="text-[10px] text-slate-400">#</span>
            </button>
          ))}
        </div>
      )}

      {/* Pill Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 shadow-xl backdrop-blur-xl transition hover:border-indigo-400 active:scale-95 dark:border-white/[0.1] dark:bg-[#0c0e12]"
      >
        {/* Circular Progress Arc */}
        <div className="relative flex h-5 w-5 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="9"
              className="stroke-slate-200 dark:stroke-white/10"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray="56.5"
              strokeDashoffset={56.5 - (56.5 * progress) / 100}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {progress}%
        </span>
      </button>
    </div>
  );
};

export default ScrollProgressPill;
