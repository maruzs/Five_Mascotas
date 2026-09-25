import React, { useState, useRef, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  sublabel?: string;
  iconPath: string; // SVG path d
}

export interface LiquidFluidTabBarProps {
  items: TabItem[];
  defaultActiveId?: string;
  onChange?: (item: TabItem) => void;
  className?: string;
}

/**
 * LiquidFluidTabBar (CREST Pixel-Perfect Accurate)
 * 
 * Correcciones de Proporción y Anatomía:
 * - Altura de barra calibrada (h-[68px] / py-2.5) con espacio amplio entre los iconos y el borde inferior.
 * - Monte inferior sutil y proporcionado (altura h-[16px] en reposo, nunca invade los iconos).
 * - Borde y superficie limpios sin artefactos rectangulares residuales.
 * - Proyectil líquido (puntito) animado que asciende verticalmente hacia el icono.
 */
export const LiquidFluidTabBar: React.FC<LiquidFluidTabBarProps> = ({
  items,
  defaultActiveId,
  onChange,
  className = '',
}) => {
  const [activeId, setActiveId] = useState<string>(defaultActiveId || items[0]?.id || '');
  const [hillLeft, setHillLeft] = useState<number>(0);
  const [hillScaleX, setHillScaleX] = useState<number>(1);
  const [hillScaleY, setHillScaleY] = useState<number>(1);
  const [dropletActive, setDropletActive] = useState<boolean>(false);
  const [dropletLeft, setDropletLeft] = useState<number>(0);
  const [filledTabId, setFilledTabId] = useState<string>(defaultActiveId || items[0]?.id || '');

  const navbarRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = items[activeIndex] || items[0];

  const handleSelect = (item: TabItem, index: number) => {
    if (item.id === activeId) return;

    const nav = navbarRef.current;
    const btn = buttonsRef.current.get(item.id);
    if (!nav || !btn) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const btnCenter = btnRect.left - navRect.left + btnRect.width / 2;
    const targetHillLeft = btnCenter - 32; // 64px / 2

    const distance = Math.abs(index - activeIndex);

    // 1. Aplana y estira el monte con la velocidad
    setHillScaleX(1 + distance * 0.35);
    setHillScaleY(0.45);
    setHillLeft(targetHillLeft);
    setActiveId(item.id);
    onChange?.(item);

    // 2. Al llegar: rebote elástico y disparo de la gota proyectil
    setTimeout(() => {
      setHillScaleX(0.9);
      setHillScaleY(1.2);
      setTimeout(() => {
        setHillScaleX(1);
        setHillScaleY(1);
      }, 150);

      // Disparar la gota líquida
      setDropletLeft(btnCenter - 5);
      setDropletActive(true);

      // 3. Llenado del icono tras el impacto
      setTimeout(() => {
        setFilledTabId(item.id);
        setDropletActive(false);
      }, 220);
    }, 240);
  };

  useEffect(() => {
    const nav = navbarRef.current;
    const btn = buttonsRef.current.get(activeId);
    if (nav && btn) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left - navRect.left + btnRect.width / 2;
      setHillLeft(btnCenter - 32);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center gap-6 w-full max-w-md select-none ${className}`}>
      {/* Título y Subtítulo dinámico */}
      <div className="text-center transition-all duration-300 transform min-h-[60px]">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          {activeItem?.label}
        </h2>
        {activeItem?.sublabel && (
          <p className="text-sm text-muted-foreground mt-1">
            {activeItem.sublabel}
          </p>
        )}
      </div>

      {/* Contenedor de la Barra Píldora */}
      <div
        ref={navbarRef}
        className="relative flex items-center justify-between w-full h-[68px] px-6 bg-[#322a56] dark:bg-[#322a56] rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.45)] border border-white/10 overflow-hidden"
      >
        {/* Monte Líquido Inferior Proporcionado (Sin tocar iconos) */}
        <div
          className="absolute bottom-0 w-[64px] h-[15px] pointer-events-none transition-all duration-450 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            left: `${hillLeft}px`,
            transform: `scaleX(${hillScaleX}) scaleY(${hillScaleY})`,
            transformOrigin: 'bottom center',
          }}
        >
          <svg viewBox="0 0 64 15" fill="none" className="w-full h-full block">
            <path
              d="M0 15 C18 15 22 0 32 0 C42 0 46 15 64 15 Z"
              fill="#8571ec"
              className=""
            />
          </svg>
        </div>

        {/* Gotita / Proyectil que sube hacia el icono */}
        <div
          className={`absolute bottom-3.5 w-2.5 h-2.5 rounded-full bg-[#9d8ff7] shadow-[0_0_8px_#9d8ff7] pointer-events-none transition-all duration-300 ${
            dropletActive
              ? 'opacity-100 -translate-y-7 scale-75'
              : 'opacity-0 translate-y-0 scale-100'
          }`}
          style={{ left: `${dropletLeft}px` }}
        />

        {/* Botones de navegación (posicionados en la mitad superior de la píldora) */}
        {items.map((item, idx) => {
          const isFilled = item.id === filledTabId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonsRef.current.set(item.id, el);
                else buttonsRef.current.delete(item.id);
              }}
              onClick={() => handleSelect(item, idx)}
              className="relative z-10 flex items-center justify-center -translate-y-0.5 p-2 focus:outline-none transition-transform duration-200 active:scale-95"
              aria-label={item.label}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isFilled ? '2' : '1.8'}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-6 h-6 transition-all duration-300 ${
                  isFilled
                    ? 'text-[#9d8ff7] scale-110'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <path d={item.iconPath} />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LiquidFluidTabBar;
