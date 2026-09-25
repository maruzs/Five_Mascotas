import React, { useState } from 'react';

export interface FeaturePillItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string; // Imagen o video de acción/lifestyle
  mediaType?: 'image' | 'video';
}

export interface ExpandingFeaturePillsProps {
  productImage: string; // Imagen base del producto en reposo (ej: mochila, zapato, laptop)
  productAlt?: string;
  features: FeaturePillItem[];
  className?: string;
}

/**
 * ExpandingFeaturePills (OSMO Interactive Product Showcase)
 * 
 * Recrea la cinemática de osmo-expanding-feature-pills-1440x900.mp4:
 * 1. En reposo: Muestra el producto sobre un fondo con retícula/diana radial, y una columna de píldoras compactas con botón "+".
 * 2. Al hacer clic en una píldora:
 *    - La píldora se expande en una tarjeta redondeada fluida con descripción detallada.
 *    - El botón "+" rota 45° convirtiéndose en una "x" o minimizador.
 *    - La mitad derecha cambia dinámicamente de la imagen del producto a la escena multimedia (video/imagen) correspondiente a esa feature.
 * 3. Botón de cierre "X" superior derecho que restaura la vista general del producto.
 */
export const ExpandingFeaturePills: React.FC<ExpandingFeaturePillsProps> = ({
  productImage,
  productAlt = 'Product Showcase',
  features,
  className = '',
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeFeature = features.find((f) => f.id === activeId);

  const handleToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`relative w-full max-w-6xl mx-auto p-4 sm:p-8 select-none ${className}`}>
      
      {/* Contenedor Bento Principal Dividido en 2 Columnas */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#131416] border border-white/10 rounded-[36px] p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[560px]">
        
        {/* COLUMNA IZQUIERDA: Lista de Píldoras Expansibles (5 columnas) */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-3 z-20">
          {features.map((feature) => {
            const isExpanded = feature.id === activeId;

            return (
              <div
                key={feature.id}
                className={`w-full transition-all duration-450 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl border ${
                  isExpanded
                    ? 'bg-[#222429] border-white/20 p-5 shadow-lg'
                    : 'bg-[#1b1c20] hover:bg-[#202227] border-white/5 px-4 py-3 cursor-pointer'
                }`}
                onClick={() => !isExpanded && handleToggle(feature.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-semibold tracking-tight transition-colors ${
                    isExpanded ? 'text-white font-bold' : 'text-neutral-300'
                  }`}>
                    {feature.title}
                  </span>

                  {/* Botón Circular "+" / "x" */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(feature.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 focus:outline-none cursor-pointer ${
                      isExpanded
                        ? 'bg-white/20 text-white rotate-45'
                        : 'bg-white/10 text-neutral-400 hover:text-white rotate-0'
                    }`}
                    aria-label="Toggle feature"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>

                {/* Contenido Expandido */}
                {isExpanded && (
                  <div className="mt-3 pt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed transition-opacity duration-300 animate-fadeIn">
                    {feature.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* COLUMNA DERECHA: Escenario Visual con Cambio Dinámico (7 columnas) */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[380px] lg:min-h-full rounded-2xl overflow-hidden bg-[#0c0d0f] border border-white/5">
          
          {/* Fondo Diana / Retícula Técnica (cuando está en reposo) */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${activeId ? 'opacity-0' : 'opacity-40'}`}>
            <div className="w-[360px] h-[360px] rounded-full border border-dashed border-white/20 flex items-center justify-center">
              <div className="w-[240px] h-[240px] rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-[120px] h-[120px] rounded-full border border-dashed border-white/20" />
              </div>
            </div>
          </div>

          {/* Estado 1: Producto en Reposo */}
          <div className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            activeId ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
          }`}>
            <img
              src={productImage}
              alt={productAlt}
              className="max-h-[440px] max-w-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.7)]"
            />
          </div>

          {/* Estado 2: Escena Multimedia de la Característica Activa */}
          {features.map((f) => {
            const isActive = f.id === activeId;
            return (
              <div
                key={f.id}
                className={`absolute inset-0 transition-all duration-650 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isActive
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                {f.mediaType === 'video' ? (
                  <video
                    src={f.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={f.mediaUrl}
                    alt={f.title}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            );
          })}

          {/* Botón de Cerrar "X" Superior Derecho (Aparece cuando hay una feature activa) */}
          <button
            onClick={() => setActiveId(null)}
            className={`absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/20 transition-all duration-300 focus:outline-none cursor-pointer ${
              activeId ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            aria-label="Cerrar vista y volver al producto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

        </div>

      </div>

    </div>
  );
};

export default ExpandingFeaturePills;
