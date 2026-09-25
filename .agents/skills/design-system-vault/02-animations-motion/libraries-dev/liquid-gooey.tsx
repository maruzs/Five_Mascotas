import React, { useState } from "react";

export interface GooeyTab {
  id: string;
  label: string;
}

export interface LiquidGooeyProps {
  tabs?: GooeyTab[];
  className?: string;
}

/**
 * 💧 Liquid Gooey Navigation (Libraries.dev & Rare UI)
 *
 * Navegación líquida orgánica con filtro SVG `feColorMatrix` y `feGaussianBlur`
 * donde el indicador de selección se estira y fusiona como una gota viscosa.
 */
export const LiquidGooey: React.FC<LiquidGooeyProps> = ({
  tabs = [
    { id: "overview", label: "Overview" },
    { id: "integrations", label: "Integrations" },
    { id: "analytics", label: "Analytics" },
    { id: "security", label: "Security" },
  ],
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className={`relative flex items-center justify-center p-4 ${className}`}>
      {/* SVG Gooey Filter */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Filtered Container */}
      <div
        style={{ filter: "url(#liquid-gooey-filter)" }}
        className="relative flex items-center gap-2 rounded-full bg-slate-900/90 p-2 dark:bg-[#12141a]"
      >
        {/* Dynamic morphing blob */}
        <div
          className="absolute h-10 w-24 rounded-full bg-indigo-500 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: `${8 + activeIndex * 104}px`,
          }}
        />

        {/* Tab Buttons */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative z-10 flex h-10 w-24 items-center justify-center text-xs font-bold text-white transition-colors duration-200"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LiquidGooey;
