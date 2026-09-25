import React from "react";

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * 🪜 Progress Stepper (Ágora UI-06)
 *
 * Componente de flujo de pasos y onboarding con estados completados, activos y pendientes,
 * barra de progreso conectora y diseño responsivo.
 */
export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isClickable = onStepClick && idx <= currentStepIndex;

          return (
            <li
              key={step.id}
              className={`relative flex flex-1 flex-col items-center text-center ${
                idx !== steps.length - 1
                  ? "after:absolute after:left-[50%] after:top-4 after:h-[2px] after:w-full after:-translate-y-1/2 after:content-[''] " +
                    (idx < currentStepIndex
                      ? "after:bg-indigo-600 dark:after:bg-indigo-500"
                      : "after:bg-slate-200 dark:after:bg-white/10")
                  : ""
              }`}
            >
              {/* Step Circle */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepClick?.(idx)}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isCompleted
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : isCurrent
                    ? "border-2 border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-500/20 dark:bg-[#0f1115] dark:text-indigo-400"
                    : "border border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
                } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>

              {/* Step Title */}
              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent
                    ? "text-indigo-600 dark:text-indigo-400"
                    : isCompleted
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.title}
              </span>

              {step.description && (
                <span className="hidden text-[10px] text-slate-400 sm:inline-block">
                  {step.description}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProgressStepper;
