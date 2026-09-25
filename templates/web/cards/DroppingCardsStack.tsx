import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DroppingCardItem {
  id: string | number;
  title: string;
  tags: string[];
  imageUrl: string;
  bgColor: string;
  textColor?: string;
  tagColor?: string;
}

export interface DroppingCardsStackProps {
  items?: DroppingCardItem[];
  className?: string;
}

const DEFAULT_ITEMS: DroppingCardItem[] = [
  {
    id: "branding",
    title: "Branding & Identity.",
    tags: ["Brand Strategy", "Logo Design", "Visual Identity"],
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80",
    bgColor: "#f3b755", // Gold/amber
    textColor: "#111827",
    tagColor: "#374151"
  },
  {
    id: "marketing",
    title: "Marketing.",
    tags: ["Ads Creation (Meta, Google)", "SEO Setup", "Email Marketing", "Funnel Strategy", "Analytics"],
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80",
    bgColor: "#f4f4f4", // Crisp White/Off-white
    textColor: "#111827",
    tagColor: "#374151"
  },
  {
    id: "ux",
    title: "UX Strategy.",
    tags: ["UX audits", "Wireframes & Prototypes", "User Testing"],
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    bgColor: "#7a52e0", // Vibrant Purple
    textColor: "#ffffff",
    tagColor: "#e9d5ff"
  },
  {
    id: "development",
    title: "Web & App Dev.",
    tags: ["Fullstack Architecture", "Mobile Native Apps", "High-velocity APIs"],
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
    bgColor: "#caaefc", // Light Violet/Lilac
    textColor: "#1e1b4b",
    tagColor: "#4338ca"
  }
];

export const DroppingCardsStack: React.FC<DroppingCardsStackProps> = ({
  items = DEFAULT_ITEMS,
  className = ""
}) => {
  // Ordered stack of card indices
  const [deck, setDeck] = useState<number[]>(items.map((_, i) => i));
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const handleNext = () => {
    if (animatingId !== null || deck.length <= 1) return;
    setDirection("forward");
    const topIndex = deck[0];
    setAnimatingId(topIndex);

    // After card drops down, recycle to end of deck
    setTimeout(() => {
      setDeck((prev) => [...prev.slice(1), prev[0]]);
      setAnimatingId(null);
    }, 450);
  };

  const handlePrev = () => {
    if (animatingId !== null || deck.length <= 1) return;
    setDirection("backward");
    const lastIndex = deck[deck.length - 1];
    setAnimatingId(lastIndex);

    // Re-insert last card to the front
    setDeck((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
    setTimeout(() => {
      setAnimatingId(null);
    }, 450);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 md:p-12 w-full select-none ${className}`}>
      {/* Cards Viewport */}
      <div className="relative w-full max-w-[560px] h-[340px] md:h-[370px]">
        {deck.map((itemIndex, positionInDeck) => {
          const item = items[itemIndex];
          // We display up to 4 cards in the stack visual depth
          if (positionInDeck > 3) return null;

          const isDroppingFront = direction === "forward" && animatingId === itemIndex && positionInDeck === 0;
          const isEnteringFromTop = direction === "backward" && animatingId === itemIndex && positionInDeck === 0;

          // Cascade offset: front card is at (0, 0), background cards offset down-right
          const offsetX = positionInDeck * 20;
          const offsetY = positionInDeck * 18;
          const zIndex = 40 - positionInDeck * 10;

          return (
            <motion.div
              key={item.id}
              layout
              initial={
                isEnteringFromTop
                  ? { y: -160, x: 0, opacity: 0, rotate: -6, zIndex: 50 }
                  : false
              }
              animate={
                isDroppingFront
                  ? {
                      y: 220,
                      x: 10,
                      rotate: 7,
                      opacity: [1, 1, 0],
                      scale: 0.98,
                      zIndex: 50
                    }
                  : {
                      x: offsetX,
                      y: offsetY,
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                      zIndex: zIndex
                    }
              }
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1] // Snappy organic cubic bezier
              }}
              style={{
                backgroundColor: item.bgColor,
                color: item.textColor || "#111827",
                transformOrigin: "bottom left"
              }}
              className="absolute left-0 top-0 w-[calc(100%-60px)] h-[300px] md:h-[320px] rounded-[28px] p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer border border-black/5"
              onClick={handleNext}
            >
              {/* Card Top Row: Inset Preview Thumbnail & Tag List */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-28 h-20 md:w-36 md:h-24 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-black/10">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{ color: item.tagColor || "currentColor" }}
                      className="text-xs md:text-sm font-medium tracking-tight opacity-90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom Row: Big Bold Typography */}
              <div>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none font-sans">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pill Controls below the Stack */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handlePrev}
          disabled={animatingId !== null}
          aria-label="Previous card"
          className="w-11 h-11 rounded-full bg-slate-800 text-white/70 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={animatingId !== null}
          aria-label="Next card"
          className="w-11 h-11 rounded-full bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DroppingCardsStack;
