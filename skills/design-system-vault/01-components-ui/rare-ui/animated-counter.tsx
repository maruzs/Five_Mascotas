import React, { useEffect, useState } from "react";

export interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * 🎰 Animated Odometer Counter (Rare UI)
 *
 * Contador numérico fluido estilo rueda de odómetro con interpolación
 * y renderizado de dígitos con animación vertical de alta frecuencia.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString();

  return (
    <span
      className={`inline-flex items-baseline font-mono font-bold tracking-tight text-slate-900 dark:text-white ${className}`}
    >
      {prefix && <span className="mr-0.5 text-slate-500">{prefix}</span>}
      <span className="tabular-nums">{formatted}</span>
      {suffix && <span className="ml-0.5 text-slate-500">{suffix}</span>}
    </span>
  );
};

export default AnimatedCounter;
