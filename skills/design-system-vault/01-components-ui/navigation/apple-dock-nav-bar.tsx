import React, { useState } from 'react';

export interface DockItem {
  id: string;
  label: string;
  iconUrl?: string;
  iconComponent?: React.ReactNode;
  onClick?: () => void;
}

export interface AppleDockNavBarProps {
  items: DockItem[];
  className?: string;
}

/**
 * AppleDockNavBar (Stable Smooth Interpolation)
 * 
 * Mejoras aplicadas:
 * - Eliminación de saltos y vibraciones al evitar modificar el ancho del flex-item.
 * - Ancho de ítems fijo (w-[50px]) para que la barra no altere sus dimensiones totales ni active scrollbars.
 * - Magnificación basada puramente en `transform: scale(...) translate3d(...)` con origen en la base.
 * - Tooltip superior sin empujar el layout.
 */
export const AppleDockNavBar: React.FC<AppleDockNavBarProps> = ({
  items,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className={`fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none select-none ${className}`}>
      <div 
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex items-end gap-1.5 px-3 py-2.5 bg-neutral-900/60 dark:bg-black/50 backdrop-blur-2xl border border-white/20 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      >
        {items.map((item, index) => {
          let scale = 1.0;
          let translateY = 0;

          if (hoveredIndex !== null) {
            const distance = Math.abs(index - hoveredIndex);
            if (distance === 0) {
              scale = 1.5;
              translateY = -14;
            } else if (distance === 1) {
              scale = 1.25;
              translateY = -7;
            } else if (distance === 2) {
              scale = 1.08;
              translateY = -2;
            }
          }

          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={item.onClick}
              className="relative flex flex-col items-center justify-end cursor-pointer w-[50px] h-[50px] origin-bottom"
            >
              {/* Tooltip */}
              <div
                className={`absolute -top-9 px-2.5 py-1 bg-neutral-950/90 text-white text-[11px] font-medium tracking-wide rounded-md shadow-lg border border-white/10 pointer-events-none transition-all duration-200 whitespace-nowrap z-30 ${
                  isHovered ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-1'
                }`}
              >
                {item.label}
              </div>

              {/* Contenedor del Icono con Escala Pura (Sin alterar el box-model) */}
              <div
                className="w-[44px] h-[44px] rounded-2xl flex items-center justify-center p-1 transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                  transformOrigin: 'bottom center',
                }}
              >
                {item.iconUrl ? (
                  <img
                    src={item.iconUrl}
                    alt={item.label}
                    className="w-full h-full object-contain rounded-xl pointer-events-none shadow-md"
                  />
                ) : (
                  item.iconComponent
                )}
              </div>

              {/* Punto indicador */}
              <span className={`w-1 h-1 rounded-full bg-white/60 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default AppleDockNavBar;
