import React, { useEffect, useRef, useState } from "react";

export interface GalleryCard {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  metric?: string;
}

export interface HorizontalScrollGalleryProps {
  items: GalleryCard[];
  className?: string;
}

/**
 * ↔️ Horizontal Scroll Gallery (Ágora SCR-04)
 *
 * Contenedor sticky que traduce el desplazamiento vertical del usuario en un recorrido
 * horizontal continuo a través de tarjetas de catálogo o portfolio.
 */
export const HorizontalScrollGallery: React.FC<HorizontalScrollGalleryProps> = ({
  items,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalDist = containerRef.current.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / totalDist));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCards = items.length;
  // Calculate horizontal percentage
  const translateX = scrollProgress * (totalCards - 1) * 320;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: `${totalCards * 60}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-8">
        <div
          className="flex gap-6 will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative h-[440px] w-[300px] sm:w-[360px] shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl transition hover:shadow-2xl dark:border-white/[0.08] dark:bg-[#0f1115]"
            >
              <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.metric && (
                  <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {item.metric}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                  {item.category}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollGallery;
