import React, { useState } from 'react';

export interface PolaroidItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface PolaroidWheelSliderProps {
  items: PolaroidItem[];
  defaultIndex?: number;
  onSelect?: (item: PolaroidItem, index: number) => void;
  className?: string;
}

/**
 * PolaroidWheelSlider (OSMO Arch Wheel Carousel)
 * 
 * Recrea la cinemática de carrusel1.mp4:
 * 1. Tarjetas estilo Polaroid retro con marco blanco/crema y pie con tipografía bold/condensada.
 * 2. Distribución en arco / rueda cóncava inferior:
 *    - Inclinación en Z progresiva (`rotateZ: offset * 8.5deg`).
 *    - Desplazamiento parabólico vertical (`translateY: Math.pow(absOffset, 2) * 22px`).
 *    - Curvatura 3D tangencial (`rotateY: -offset * 12deg`, `translateZ`).
 * 3. Soporte de navegación por click, botones Prev/Next con píldora flotante e indicadores.
 */
export const PolaroidWheelSlider: React.FC<PolaroidWheelSliderProps> = ({
  items,
  defaultIndex = 2,
  onSelect,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);

  const total = items.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full py-12 select-none overflow-hidden ${className}`}>
      
      {/* Escenario de Rueda en Arco 3D */}
      <div 
        className="relative w-full max-w-5xl h-[440px] flex items-center justify-center"
        style={{ perspective: '1100px', perspectiveOrigin: 'center 40%' }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((item, index) => {
            let offset = index - currentIndex;

            // Bucle continuo
            while (offset > total / 2) offset -= total;
            while (offset < -total / 2) offset += total;

            const absOffset = Math.abs(offset);
            const isCenter = offset === 0;

            // Fórmulas de rotación de la rueda / arco
            const translateX = offset * 210;
            const translateY = Math.pow(absOffset, 1.85) * 26; // Se hunden en arco hacia abajo
            const rotateZ = offset * 8.5;                     // Inclinación tangencial a la rueda
            const rotateY = -offset * 11;                    // Ligera perspectiva hacia el centro
            const translateZ = -absOffset * 40;
            const scale = Math.max(0.85, 1 - absOffset * 0.05);
            const opacity = absOffset > 2.5 ? 0 : 1;
            const zIndex = 30 - Math.round(absOffset * 10);

            return (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  onSelect?.(item, index);
                }}
                className={`absolute w-[200px] sm:w-[220px] bg-[#f0ede6] text-neutral-900 rounded-[22px] p-3 pb-4 shadow-[0_22px_45px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-650 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform ${
                  isCenter ? 'ring-2 ring-white/60 shadow-[0_28px_60px_rgba(0,0,0,0.65)]' : ''
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformOrigin: '50% 120%', // Origen de rotación en el centro de la rueda inferior
                }}
              >
                {/* Fotografía de la Polaroid */}
                <div className="w-full h-[220px] sm:h-[240px] rounded-[16px] overflow-hidden bg-neutral-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    loading="lazy"
                  />
                </div>

                {/* Pie de Foto Polaroid con Título en Mayúsculas Bold */}
                <div className="pt-3 pb-1 text-center">
                  <h3 className="text-sm sm:text-base font-black tracking-wider uppercase text-neutral-900 font-sans">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Flotante Estilo Píldora OSMO */}
      <div className="mt-4 flex items-center bg-[#151916]/90 border border-white/10 rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-md z-40">
        
        {/* Prev */}
        <button
          onClick={handlePrev}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer focus:outline-none"
        >
          Prev
        </button>

        {/* Indicadores de Puntos */}
        <div className="flex items-center gap-1.5 px-3">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                idx === currentIndex
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-100 transition-all active:scale-95 shadow cursor-pointer focus:outline-none"
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default PolaroidWheelSlider;
