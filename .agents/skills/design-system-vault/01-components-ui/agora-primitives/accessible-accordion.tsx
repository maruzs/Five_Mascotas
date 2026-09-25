import React, { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccessibleAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

/**
 * 🪗 Accessible Accordion (Ágora UI-01)
 *
 * Acordeón accesible con WAI-ARIA (`aria-expanded`, `aria-controls`),
 * transiciones de altura suaves con CSS grid (`grid-template-rows`) y navegación por teclado.
 */
export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false,
  className = "",
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([items[0]?.id || ""]));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`w-full divide-y divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headerId = `accordion-hdr-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="group first:rounded-t-2xl last:rounded-b-2xl">
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-slate-900 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white dark:hover:text-indigo-400"
              >
                <span>{item.title}</span>
                <span
                  className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10 dark:group-hover:text-white ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </h3>

            {/* Smooth CSS Grid Transition */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-4 pt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccessibleAccordion;
