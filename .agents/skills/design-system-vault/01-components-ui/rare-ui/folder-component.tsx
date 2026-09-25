import React, { useState } from "react";

export interface FolderCard {
  id: string;
  title: string;
  color?: string;
  tag?: string;
}

export interface FolderComponentProps {
  name: string;
  count?: number;
  cards?: FolderCard[];
  folderColor?: string;
  className?: string;
}

/**
 * 📁 3D Animated Folder Component (Rare UI)
 *
 * Carpeta interactiva tridimensional cuyas fichas interiores se despliegan
 * en abanico (fan out) al pasar el cursor y se elevan al hacer clic,
 * con solapa frontal inclinada en perspectiva 3D.
 */
export const FolderComponent: React.FC<FolderComponentProps> = ({
  name = "Proyectos SaaS",
  count = 3,
  cards = [
    { id: "1", title: "API Integrations", color: "bg-indigo-500", tag: "Backend" },
    { id: "2", title: "Design System Tokens", color: "bg-sky-500", tag: "UI/UX" },
    { id: "3", title: "Analytics Engine", color: "bg-emerald-500", tag: "Data" },
  ],
  folderColor = "#4f46e5", // Indigo-600
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative flex flex-col items-center justify-center p-6 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div
        className="relative h-44 w-60 cursor-pointer select-none"
        style={{ perspective: "1000px" }}
      >
        {/* 1. Folder Back Plate */}
        <div
          className="absolute inset-0 rounded-2xl shadow-xl transition-transform duration-300"
          style={{
            backgroundColor: folderColor,
            filter: "brightness(0.85)",
          }}
        >
          {/* Top Folder Tab */}
          <div
            className="absolute -top-3 left-4 h-5 w-20 rounded-t-lg"
            style={{ backgroundColor: folderColor, filter: "brightness(0.85)" }}
          />
        </div>

        {/* 2. Internal Nested Cards (Fan out on hover / Open on click) */}
        <div className="absolute inset-x-3 top-4 bottom-2 z-10">
          {cards.map((card, idx) => {
            // Fan out rotation angles
            const fanAngle = (idx - 1) * 10;
            const fanY = isHovered ? -16 - idx * 12 : -idx * 4;
            const openY = isOpen ? -60 - idx * 28 : fanY;
            const rotate = isOpen ? (idx - 1) * 16 : isHovered ? fanAngle : 0;

            return (
              <div
                key={card.id}
                className={`absolute inset-x-0 h-28 rounded-xl border border-white/20 p-3 text-white shadow-md transition-all duration-300 ease-out ${card.color}`}
                style={{
                  transform: `translateY(${openY}px) rotate(${rotate}deg)`,
                  zIndex: idx + 1,
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold opacity-90">
                  <span>{card.tag}</span>
                  <span>#0{idx + 1}</span>
                </div>
                <div className="mt-2 text-xs font-bold">{card.title}</div>
              </div>
            );
          })}
        </div>

        {/* 3. Folder Front Flap (3D Tilted Forward) */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 rounded-2xl border-t border-white/25 shadow-2xl transition-transform duration-500 ease-out"
          style={{
            backgroundColor: folderColor,
            transformOrigin: "bottom center",
            transform: isHovered || isOpen ? "rotateX(-38deg) scaleY(0.92)" : "rotateX(0deg)",
            zIndex: 20,
          }}
        >
          <div className="flex h-full flex-col justify-between p-4 text-white">
            <div className="h-1.5 w-10 rounded-full bg-white/30" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-tight">{name}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                {count} items
              </span>
            </div>
          </div>
        </div>
      </div>

      <span className="mt-4 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
        {isOpen ? "Haz clic para cerrar" : "Pasa el mouse y haz clic para abrir"}
      </span>
    </div>
  );
};

export default FolderComponent;
