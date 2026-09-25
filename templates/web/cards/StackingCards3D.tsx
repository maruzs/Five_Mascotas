import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

export interface StackingCardItem {
  id: string | number;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  mediaPlaceholderBg?: string;
}

export interface StackingCards3DProps {
  items?: StackingCardItem[];
  className?: string;
  topOffsetVh?: number; // e.g., 10svh = 10
  cardHeightVh?: number; // e.g., 80svh = 80
}

const DEFAULT_ITEMS: StackingCardItem[] = [
  {
    id: "card-1",
    title: "Here's a sticky card",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    bgColor: "#e8c4b8", // Terracotta nude
    textColor: "#2b1a12",
  },
  {
    id: "card-2",
    title: "Here's a sticky card",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    bgColor: "#dde3c0", // Soft Sage
    textColor: "#1d2212",
  },
  {
    id: "card-3",
    title: "Here's a sticky card",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    bgColor: "#c9d6e8", // Pale Steel Blue
    textColor: "#121a24",
  },
  {
    id: "card-4",
    title: "Here's a sticky card",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    bgColor: "#e6d3a3", // Sandy Warm Gold
    textColor: "#241c0c",
  },
  {
    id: "card-5",
    title: "Here's a sticky card",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
    bgColor: "#d8c7e8", // Soft Lavender
    textColor: "#1c1224",
  },
];

interface CardWrapperProps {
  item: StackingCardItem;
  index: number;
  total: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  topOffsetVh: number;
  cardHeightVh: number;
}

const CardItem: React.FC<CardWrapperProps> = ({
  item,
  index,
  total,
  containerRef,
  topOffsetVh,
  cardHeightVh,
}) => {
  const isLast = index === total - 1;

  // We track the scroll progress of the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate animation window:
  // When this card is being covered by the next card
  const step = 1 / total;
  const start = index * step;
  const end = (index + 1) * step;

  // 3D Perspective pushback values
  const rotateX = useTransform(
    scrollYProgress,
    [start, end],
    isLast ? [0, 0] : [0, 25]
  );
  const scale = useTransform(
    scrollYProgress,
    [start, end],
    isLast ? [1, 1] : [1, 0.85]
  );
  const brightness = useTransform(
    scrollYProgress,
    [start, end],
    isLast ? [1, 1] : [1, 0.45]
  );

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
      }}
      className="w-full flex justify-center"
    >
      <motion.div
        style={{
          top: `${topOffsetVh}vh`,
          height: `${cardHeightVh}vh`,
          backgroundColor: item.bgColor,
          color: item.textColor,
          transformOrigin: "50% 100%",
          rotateX,
          scale,
          filter: useTransform(brightness, (b) => `brightness(${b})`),
          perspective: "60em",
          transformStyle: "preserve-3d",
        }}
        className="sticky w-full max-w-[960px] rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden flex flex-col justify-between"
      >
        {/* Card Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-none font-sans max-w-[6em]">
            {item.title}
          </h2>
          <p className="text-sm md:text-base leading-relaxed opacity-80 font-normal">
            {item.description}
          </p>
        </div>

        {/* Card Bottom Inset / Media Canvas */}
        <div
          style={{
            backgroundColor: item.mediaPlaceholderBg || "rgba(0, 0, 0, 0.09)",
          }}
          className="w-full flex-1 mt-8 rounded-[1.25rem] min-h-[220px] transition-all"
        />
      </motion.div>
    </div>
  );
};

export const StackingCards3D: React.FC<StackingCards3DProps> = ({
  items = DEFAULT_ITEMS,
  className = "",
  topOffsetVh = 10,
  cardHeightVh = 80,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black ${className}`}
      style={{
        perspective: "1200px",
      }}
    >
      {items.map((item, index) => (
        <CardItem
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          containerRef={containerRef}
          topOffsetVh={topOffsetVh}
          cardHeightVh={cardHeightVh}
        />
      ))}
    </div>
  );
};

export default StackingCards3D;
