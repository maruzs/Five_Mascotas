import React, { useState } from "react";

export interface DurationPickerProps {
  initialHours?: number;
  initialMinutes?: number;
  onChange?: (duration: { hours: number; minutes: number }) => void;
  className?: string;
}

/**
 * ⏱️ Duration Picker (Rare UI)
 *
 * Selector táctil de duración con física elástica de resorte, controles de incremento rápido
 * de horas y minutos, y visualización de tiempo formateada.
 */
export const DurationPicker: React.FC<DurationPickerProps> = ({
  initialHours = 2,
  initialMinutes = 30,
  onChange,
  className = "",
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  const changeHours = (delta: number) => {
    const nextH = Math.max(0, Math.min(23, hours + delta));
    setHours(nextH);
    onChange?.({ hours: nextH, minutes });
  };

  const changeMinutes = (delta: number) => {
    let nextM = minutes + delta;
    let nextH = hours;

    if (nextM >= 60) {
      nextM = 0;
      nextH = Math.min(23, nextH + 1);
    } else if (nextM < 0) {
      nextM = 45;
      nextH = Math.max(0, nextH - 1);
    }

    setMinutes(nextM);
    setHours(nextH);
    onChange?.({ hours: nextH, minutes: nextM });
  };

  return (
    <div
      className={`inline-flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}
    >
      {/* Hours Column */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => changeHours(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          ▲
        </button>
        <div className="my-1 flex items-baseline gap-0.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {String(hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">h</span>
        </div>
        <button
          onClick={() => changeHours(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          ▼
        </button>
      </div>

      <span className="font-mono text-xl font-bold text-slate-300 dark:text-white/20">:</span>

      {/* Minutes Column */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => changeMinutes(15)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          ▲
        </button>
        <div className="my-1 flex items-baseline gap-0.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {String(minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">m</span>
        </div>
        <button
          onClick={() => changeMinutes(-15)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          ▼
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-col gap-1 border-l border-slate-100 pl-4 dark:border-white/10">
        {[15, 30, 60].map((mins) => (
          <button
            key={mins}
            onClick={() => {
              setHours(Math.floor(mins / 60));
              setMinutes(mins % 60);
              onChange?.({ hours: Math.floor(mins / 60), minutes: mins % 60 });
            }}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:bg-indigo-600 hover:text-white active:scale-95 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-indigo-500"
          >
            +{mins}m
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationPicker;
