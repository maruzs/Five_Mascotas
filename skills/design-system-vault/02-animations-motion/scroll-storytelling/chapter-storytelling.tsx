import React, { useEffect, useRef, useState } from "react";

export interface Chapter {
  id: string;
  tag: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}

export interface ChapterStorytellingProps {
  chapters: Chapter[];
  className?: string;
}

/**
 * 📖 Chapter Storytelling Experience (Ágora SCR-01)
 *
 * Experiencia de narrativa por capítulos con escena sticky y transición
 * de paneles al avanzar el desplazamiento, inspirada en Apple y Stripe.
 */
export const ChapterStorytelling: React.FC<ChapterStorytellingProps> = ({
  chapters,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.scrollHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (containerHeight - window.innerHeight)));
      const step = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
      setActiveChapter(step);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapters.length]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: `${chapters.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-6">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Chapter Text Information */}
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              {chapters[activeChapter]?.tag}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white transition-all duration-300">
              {chapters[activeChapter]?.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 transition-all duration-300">
              {chapters[activeChapter]?.description}
            </p>

            {/* Chapter Stepper Dots */}
            <div className="mt-8 flex items-center gap-2">
              {chapters.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeChapter
                      ? "w-8 bg-indigo-600 dark:bg-indigo-400"
                      : "w-2 bg-slate-200 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Visual Showcase Stage */}
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 p-8 shadow-2xl dark:border-white/[0.08] dark:bg-[#0f1115]">
            <div className="h-full w-full flex items-center justify-center transition-all duration-500 transform">
              {chapters[activeChapter]?.visual}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterStorytelling;
