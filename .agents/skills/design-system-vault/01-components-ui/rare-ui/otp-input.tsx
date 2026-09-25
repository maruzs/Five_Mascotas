import React, { useState, useRef, KeyboardEvent } from "react";

export interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  className?: string;
}

/**
 * 🔢 OTP Verification Input (Rare UI)
 *
 * Input de código de un solo uso (OTP) con casillas de dígitos individuales,
 * animación de foco deslizante y avance automático entre ranuras.
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  className = "",
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    // Only allow last character
    const char = val.slice(-1);
    const next = [...values];
    next[idx] = char;
    setValues(next);

    if (char && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === length && !next.includes("")) {
      onComplete?.(fullCode);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {values.map((digit, idx) => (
        <div key={idx} className="relative h-12 w-11">
          <input
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="h-full w-full rounded-xl border border-slate-200 bg-white text-center font-mono text-lg font-bold text-slate-900 shadow-sm transition-all focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-[#0f1115] dark:text-white dark:focus:border-indigo-400"
          />
        </div>
      ))}
    </div>
  );
};

export default OtpInput;
