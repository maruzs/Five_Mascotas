import React, { useState, useEffect } from "react";

export interface StepPlayerProps {
  totalSteps?: number;
  durationPerStep?: number; // ms
  onComplete?: () => void;
  className?: string;
}

/**
 * ⏯️ Step Player Progress Track (Rare UI / iOS Style)
 *
 * Barra de progreso por pasos temporizados (estilo Instagram/iOS Stories)
 * con controles de reproducir, pausar y reiniciar, y estiramiento dinámico de la etapa activa.
 */
export const StepPlayer: React.FC<StepPlayerProps> = ({
  totalSteps = 4,
  durationPerStep = 3000,
  onComplete,
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%

  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50; // update every 50ms
    const stepIncrement = (interval / durationPerStep) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStep < totalSteps - 1) {
            setCurrentStep((c) => c + 1);
            return 0;
          } else {
            setIsPlaying(false);
            onComplete?.();
            return 100;
          }
        }
        return prev + stepIncrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, durationPerStep, onComplete]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const restart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}
    >
      {/* Stepped Progress Track */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isFinished = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`h-1.5 rounded-full bg-slate-200 overflow-hidden transition-all duration-300 dark:bg-white/10 ${
                isCurrent ? "flex-1" : "w-6"
              }`}
            >
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-75"
                style={{
                  width: isFinished ? "100%" : isCurrent ? `${progress}%` : "0%",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Play / Pause / Step Controls */}
      <div className="mt-4 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400">
          Paso {currentStep + 1} de {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
          >
            <span>{isPlaying ? "⏸ Pausar" : "▶ Reproducir"}</span>
          </button>
          <button
            onClick={restart}
            className="flex h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            title="Reiniciar"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPlayer;
