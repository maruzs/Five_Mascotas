import React from "react";

export interface MicroSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 🔘 Micro Switch Toggle (Ágora UI-05)
 *
 * Interruptor táctil accesible con micro-física de resorte, soporte WAI-ARIA
 * (`role="switch"`, `aria-checked`), teclado y feedback táctil.
 */
export const MicroSwitch: React.FC<MicroSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
}) => {
  const toggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${
        disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"
      } ${className}`}
      onClick={toggle}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Switch Track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          checked
            ? "bg-indigo-600 dark:bg-indigo-500"
            : "bg-slate-200 dark:bg-white/20"
        }`}
      >
        {/* Switch Thumb */}
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default MicroSwitch;
