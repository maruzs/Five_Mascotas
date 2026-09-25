import React, { useState, useRef } from "react";

export interface ProximityItem {
  id: string;
  icon: string;
  label: string;
}

export interface ProximitySidebarProps {
  items?: ProximityItem[];
  className?: string;
}

/**
 * 📡 Proximity Sidebar (Rare UI)
 *
 * Barra de navegación que reacciona de forma continua calculando
 * la distancia euclidiana del cursor respecto a cada icono (estilo dock de macOS).
 */
export const ProximitySidebar: React.FC<ProximitySidebarProps> = ({
  items = [
    { id: "1", icon: "⚡", label: "Overview" },
    { id: "2", icon: "📊", label: "Metrics" },
    { id: "3", icon: "🛡️", label: "Security" },
    { id: "4", icon: "💬", label: "Support" },
    { id: "5", icon: "⚙️", label: "Config" },
  ],
  className = "",
}) => {
  const [mouseY, setMouseY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouseY(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setMouseY(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-xl backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0c0e12]/85 ${className}`}
    >
      {items.map((item, idx) => {
        // Calculate item center Y
        const itemCenterY = 16 + idx * 44;
        const distance = mouseY !== null ? Math.abs(mouseY - itemCenterY) : 100;
        // Scale between 1.0 and 1.35 based on proximity
        const scale = Math.max(1, 1.35 - distance / 120);

        return (
          <div key={item.id} className="group relative flex items-center justify-center">
            <button
              style={{
                transform: `scale(${scale})`,
                transition: mouseY !== null ? "transform 0.05s ease-out" : "transform 0.3s ease-out",
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm transition-colors hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:hover:bg-indigo-500"
            >
              {item.icon}
            </button>

            {/* Tooltip on proximity */}
            <div className="pointer-events-none absolute left-14 z-20 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 dark:bg-white dark:text-slate-900">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProximitySidebar;
