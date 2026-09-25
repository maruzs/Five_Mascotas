import React, { useState } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface BounceSidebarProps {
  items?: SidebarItem[];
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * 🏀 Bounce Sidebar (Rare UI)
 *
 * Barra de navegación vertical con indicador activo elástico ultra-reactivo
 * (bouncy spring) que simula inercia y amortiguación física al cambiar de selección.
 */
export const BounceSidebar: React.FC<BounceSidebarProps> = ({
  items = [
    { id: "dashboard", label: "Dashboard", count: 4 },
    { id: "analytics", label: "Analytics" },
    { id: "customers", label: "Customers", count: 12 },
    { id: "integrations", label: "Integrations" },
    { id: "settings", label: "Settings" },
  ],
  defaultSelectedId = "dashboard",
  onSelect,
  className = "",
}) => {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);

  const selectedIndex = items.findIndex((item) => item.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <nav
      aria-label="Bounce Navigation Sidebar"
      className={`relative w-64 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-white/[0.08] dark:bg-[#0c0e12] ${className}`}
    >
      <div className="relative flex flex-col gap-1">
        {/* Animated Bouncy Indicator Pill */}
        <div
          className="pointer-events-none absolute left-0 right-0 h-10 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-600/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-indigo-500"
          style={{
            top: `${selectedIndex * 44}px`,
          }}
        />

        {/* Sidebar Items */}
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`relative z-10 flex h-10 w-full items-center justify-between px-3.5 text-xs font-semibold transition-colors duration-200 ${
                isSelected
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BounceSidebar;
