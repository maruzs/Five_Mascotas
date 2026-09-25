import React, { useState } from "react";

export interface HookItem {
  id: string;
  label: string;
  description?: string;
}

export interface HookSidebarProps {
  items?: HookItem[];
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * 🪝 Hook Sidebar (Rare UI)
 *
 * Barra lateral con riel discontinuo (dashed rail) y enganche magnético ("hook")
 * que se desplaza y encaja de manera precisa en la sección activa.
 */
export const HookSidebar: React.FC<HookSidebarProps> = ({
  items = [
    { id: "intro", label: "01. Introduction", description: "Getting started" },
    { id: "tokens", label: "02. Design Tokens", description: "Color & typography" },
    { id: "motion", label: "03. Motion Physics", description: "Spring presets" },
    { id: "components", label: "04. Primitives", description: "UI library components" },
    { id: "deploy", label: "05. Deployment", description: "Production ship" },
  ],
  defaultSelectedId = "intro",
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
    <nav className={`relative w-72 p-4 ${className}`}>
      {/* Dashed vertical rail */}
      <div className="absolute left-6 top-6 bottom-6 w-[1.5px] border-l-2 border-dashed border-slate-300 dark:border-white/20" />

      {/* Moving active Hook Ring */}
      <div
        className="pointer-events-none absolute left-[21px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 shadow-md shadow-indigo-500/50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] dark:bg-indigo-400"
        style={{
          top: `${24 + selectedIndex * 52}px`,
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="group flex h-11 items-center pl-10 text-left transition-colors"
            >
              <div>
                <div
                  className={`text-xs font-semibold transition-colors ${
                    isSelected
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
                  }`}
                >
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {item.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default HookSidebar;
