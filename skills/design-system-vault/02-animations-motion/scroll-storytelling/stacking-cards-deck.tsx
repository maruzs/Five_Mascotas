import React from "react";

export interface StackingCardItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  color?: string;
  content?: React.ReactNode;
}

export interface StackingCardsDeckProps {
  cards: StackingCardItem[];
  className?: string;
}

/**
 * 🃏 Stacking Cards Deck (Ágora SCR-05)
 *
 * Baraja de tarjetas que se apilan secuencialmente en una posición sticky superior,
 * creando una sensación táctil de capas acumulativas sin romper el flujo del scroll.
 */
export const StackingCardsDeck: React.FC<StackingCardsDeckProps> = ({
  cards,
  className = "",
}) => {
  return (
    <div className={`relative mx-auto max-w-4xl py-12 ${className}`}>
      {cards.map((card, idx) => {
        // Sticky offset increments slightly per card
        const topOffset = 80 + idx * 24;

        return (
          <div
            key={card.id}
            className="sticky mb-12 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl transition-all dark:border-white/[0.1] dark:bg-[#0f1115]"
            style={{
              top: `${topOffset}px`,
              zIndex: idx + 1,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {card.badge || `0${idx + 1}`}
              </span>
              <span className="text-xs font-mono text-slate-400">
                LAYER {idx + 1} OF {cards.length}
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {card.description}
            </p>

            {card.content && <div className="mt-6">{card.content}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default StackingCardsDeck;
