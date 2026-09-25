import React, { useState } from 'react';

export interface SpatialCardItem {
  id: string;
  title: string;
  imageUrl: string;
  tag?: string;
}

export interface SpatialCardsSliderProps {
  items: SpatialCardItem[];
  defaultIndex?: number;
  onCardClick?: (item: SpatialCardItem, index: number) => void;
  className?: string;
}

/**
 * SpatialCardsSlider (OSMO Spatial 3D Curved Carousel)
 * 
 * Recrea exactamente la física y perspectiva espacial 3D de OSMO:
 * - Visión cilíndrica espacial (perspective: 1100px).
 * - Rotación Y en arco (`rotateY(-offset * 14deg)`), profundidad Z (`translateZ(-abs(offset) * 85px)`) y desplazamiento horizontal.
 * - Tarjeta activa con elevación z-index y máxima nitidez; tarjetas periféricas oscurecidas gradualmente.
 * - Controles inferiores flotantes estilo píldora ("Prev", "Next" y puntos indicadores).
 */
export const SpatialCardsSlider: React.FC<SpatialCardsSliderProps> = ({
  items,
  defaultIndex = 2,
  onCardClick,
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
      
      {/* Escenario 3D Espacial */}
      <div 
        className="relative w-full max-w-6xl h-[420px] flex items-center justify-center"
        style={{ perspective: '1100px', perspectiveOrigin: 'center center' }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((item, index) => {
            // Calcular offset relativo al elemento activo (-2, -1, 0, 1, 2)
            let offset = index - currentIndex;
            
            // Tratamiento cíclico para carrusel infinito
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // Si está muy lejos en el cilindro, ocultar suavemente
            const isVisible = absOffset <= 2.5;

            // Fórmulas matemáticas de curvatura espacial:
            const translateX = offset * 215; // Desplazamiento lateral en px
            const translateZ = -Math.pow(absOffset, 1.3) * 95; // Hundimiento en el eje Z
            const rotateY = -offset * 15; // Inclinación tangencial al arco (en grados)
            const scale = Math.max(0.82, 1 - absOffset * 0.08);
            const opacity = isVisible ? Math.max(0.2, 1 - absOffset * 0.28) : 0;
            const zIndex = 30 - Math.round(absOffset * 10);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isCenter) setCurrentIndex(index);
                  else onCardClick?.(item, index);
                }}
                className={`absolute w-[210px] sm:w-[230px] h-[310px] rounded-3xl cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl ${
                  isCenter ? 'ring-2 ring-white/30' : ''
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  zIndex,
                  opacity,
                  filter: isCenter ? 'none' : `brightness(${Math.max(0.45, 1 - absOffset * 0.25)})`,
                }}
              >
                {/* Imagen de Fondo */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                />

                {/* Sombra / Gradiente inferior para texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Título y etiqueta de la tarjeta */}
                <div className="absolute bottom-4 inset-x-0 text-center px-3 pointer-events-none">
                  <h3 className="text-base sm:text-lg font-black tracking-widest uppercase text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  {item.tag && (
                    <span className="text-[10px] text-neutral-300 uppercase tracking-widest opacity-80">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Flotante Estilo Píldora (Prev / Dots / Next) */}
      <div className="mt-6 flex items-center bg-[#1d1b19]/90 dark:bg-neutral-900/90 border border-white/10 rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-md z-40">
        
        {/* Botón Prev */}
        <button
          onClick={handlePrev}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 focus:outline-none cursor-pointer"
        >
          Prev
        </button>

        {/* Indicadores de Puntos */}
        <div className="flex items-center gap-1.5 px-3">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                idx === currentIndex
                  ? 'w-4 bg-amber-200'
                  : 'bg-neutral-600 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* Botón Next */}
        <button
          onClick={handleNext}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#eae0d5] text-neutral-900 hover:bg-white transition-all active:scale-95 shadow focus:outline-none cursor-pointer"
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default SpatialCardsSlider;
