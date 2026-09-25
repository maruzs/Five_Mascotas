import React, { useState, useRef } from "react";

export interface CarouselSlide {
  id: string;
  title: string;
  description?: string;
  image?: string;
  badge?: string;
}

export interface TouchCarouselProps {
  slides: CarouselSlide[];
  className?: string;
}

/**
 * 🎠 Accessible Touch Carousel (Ágora UI-04)
 *
 * Carrusel interactivo táctil con soporte de gestos de deslizamiento (touch swipe),
 * controles accesibles de navegación anterior/siguiente y puntos de progreso.
 */
export const TouchCarousel: React.FC<TouchCarouselProps> = ({
  slides,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX || 0;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Track */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full shrink-0 p-6">
            {slide.image && (
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
                {slide.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    {slide.badge}
                  </span>
                )}
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {slide.title}
            </h3>
            {slide.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {slide.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-white/[0.06]">
        {/* Indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                  : "w-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/20 dark:hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Siguiente slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TouchCarousel;
