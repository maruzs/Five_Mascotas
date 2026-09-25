import React, { useState } from "react";

export interface EmojiReactionProps {
  emojis?: string[];
  onReact?: (emoji: string) => void;
  className?: string;
}

/**
 * 😄 Tapback Emoji Reaction Bar (Rare UI / Apple iMessage Inspired)
 *
 * Barra de reacciones con micro-interacción de pulsación que lanza réplicas
 * del emoji seleccionado flotando hacia arriba con desvanecimiento de física suave.
 */
export const EmojiReaction: React.FC<EmojiReactionProps> = ({
  emojis = ["❤️", "👍", "🔥", "🚀", "🎉", "😮"],
  onReact,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);

  const handleSelectEmoji = (emoji: string) => {
    const newId = Date.now() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id: newId, emoji }]);
    onReact?.(emoji);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newId));
    }, 1200);

    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Floating Emojis Stage */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2">
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            className="absolute -translate-x-1/2 text-2xl animate-[float-up_1.2s_ease-out_forwards]"
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Emoji Bar Popover */}
      {isOpen && (
        <div className="absolute -top-14 left-0 z-30 flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in zoom-in-90 dark:border-white/10 dark:bg-[#0f1115]/95">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelectEmoji(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-transform hover:scale-130 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      >
        <span>👏</span>
        <span>Reaccionar</span>
      </button>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.3);
          }
        }
      `}</style>
    </div>
  );
};

export default EmojiReaction;
