import React, { useState, useRef, KeyboardEvent } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  content: React.ReactNode;
}

export interface KeyboardTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}

/**
 * 📑 Accessible Keyboard Tabs (Ágora UI-02)
 *
 * Sistema de pestañas accesible con soporte completo de flechas del teclado
 * (`ArrowRight`, `ArrowLeft`, `Home`, `End`), foco automático y panel de contenido dinámico.
 */
export const KeyboardTabs: React.FC<KeyboardTabsProps> = ({
  tabs,
  defaultTabId,
  className = "",
}) => {
  const [activeId, setActiveId] = useState(defaultTabId || tabs[0]?.id || "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = tabs.findIndex((t) => t.id === activeId);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== index) {
      const nextTab = tabs[nextIndex];
      if (nextTab) {
        setActiveId(nextTab.id);
        tabRefs.current[nextIndex]?.focus();
      }
    }
  };

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label="Navigation Tabs"
        className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-white/[0.08] dark:bg-[#12141a]"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[idx] = el)}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e222b] dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {activeTab && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#0f1115]"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
};

export default KeyboardTabs;
