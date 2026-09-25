import React, { useState, useEffect } from 'react';

export interface AnchorSection {
  id: string;
  num: string; // ej: "01", "02"
  label: string;
}

export interface SectionAnchorDockProps {
  sections: AnchorSection[];
  activeSectionId?: string;
  onSelectSection?: (section: AnchorSection) => void;
  className?: string;
}

/**
 * SectionAnchorDock (OSMO Section Anchor Dock)
 * 
 * Basado en la animación de osmo-section-anchor-dock-1440x900.mp4:
 * 1. Píldora inferior flotante minimalista que muestra la sección activa mientras se hace scroll
 *    (ej: "01 Discovery", "02 Strategy", "03 Design", "04 Development", "05 Launch").
 * 2. Transición suave del texto al cruzar entre secciones.
 * 3. Al hacer clic, se expande verticalmente hacia arriba un menú emergente translúcido con
 *    la lista completa de secciones numeradas.
 * 4. Al seleccionar una sección, realiza un scroll suave hacia el ancla y colapsa el menú.
 */
export const SectionAnchorDock: React.FC<SectionAnchorDockProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>(activeSectionId || sections[0]?.id || '');

  // Sincronizar si cambia desde afuera
  useEffect(() => {
    if (activeSectionId) {
      setCurrentId(activeSectionId);
    }
  }, [activeSectionId]);

  const activeSection = sections.find((s) => s.id === currentId) || sections[0];

  const handleSelect = (section: AnchorSection) => {
    setCurrentId(section.id);
    setIsOpen(false);
    onSelectSection?.(section);

    // Scroll al elemento
    const targetEl = document.getElementById(section.id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none select-none ${className}`}>
      
      {/* Backdrop invisible para cerrar al hacer clic afuera */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 pointer-events-auto bg-black/20 backdrop-blur-[2px] transition-opacity"
        />
      )}

      <div className="relative pointer-events-auto flex flex-col items-center">
        
        {/* Menú Desplegable Superior (Se abre hacia arriba) */}
        <div
          className={`absolute bottom-14 flex flex-col gap-1 p-2 bg-[#1b1e2e]/95 dark:bg-[#151824]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-w-[200px] transition-all duration-300 origin-bottom ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
        >
          {sections.map((sec) => {
            const isSelected = sec.id === currentId;
            return (
              <button
                key={sec.id}
                onClick={() => handleSelect(sec)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left w-full cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`font-mono text-[11px] ${isSelected ? 'text-white' : 'text-neutral-500'}`}>
                  {sec.num}
                </span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Píldora Flotante Principal */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/95 text-neutral-900 hover:bg-white active:scale-95 transition-all duration-300 rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.4)] border border-white/20 cursor-pointer focus:outline-none"
        >
          {/* Número */}
          <span className="font-mono text-xs font-bold text-neutral-500 group-hover:text-neutral-700 transition-colors">
            {activeSection?.num}
          </span>

          {/* Nombre de Sección con animación fade suave */}
          <span className="text-xs font-bold tracking-wide transition-all">
            {activeSection?.label}
          </span>

          {/* Indicador de flecha/chevron */}
          <svg
            className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

      </div>
    </div>
  );
};

export default SectionAnchorDock;
