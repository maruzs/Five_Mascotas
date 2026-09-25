import React from "react";

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export interface BentoCardProps {
  title: string;
  description: string;
  headerGraphic?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
  ctaText?: string;
  ctaHref?: string;
  colSpan?: "col-span-1" | "col-span-2" | "col-span-3" | "md:col-span-2" | "lg:col-span-2" | "lg:col-span-3";
  rowSpan?: "row-span-1" | "row-span-2";
  className?: string;
  children?: React.ReactNode;
}

/**
 * 🍱 Bento Grid (Aceternity / Apple Inspired)
 *
 * Modular asymmetric grid container for modern SaaS feature presentation.
 */
export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[22rem] ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * 📦 Bento Card Item
 *
 * Feature showcase card with smooth hover elevation, hairline border,
 * gradient accents, and optional interactive visual slots.
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  description,
  headerGraphic,
  icon,
  badge,
  ctaText,
  ctaHref,
  colSpan = "col-span-1",
  rowSpan = "row-span-1",
  className = "",
  children,
}) => {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl dark:border-white/[0.08] dark:bg-[#0f1115] dark:hover:border-white/[0.18] ${colSpan} ${rowSpan} ${className}`}
    >
      {/* Subtle hover background highlight gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-sky-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-indigo-500/[0.08] dark:to-sky-500/[0.06]" />

      {/* Header graphic / Interactive preview area */}
      {headerGraphic && (
        <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/80 p-2 dark:bg-[#15181e]">
          {headerGraphic}
        </div>
      )}

      {/* Children custom slot */}
      {children && <div className="relative z-10 my-2 flex-1">{children}</div>}

      {/* Card Information */}
      <div className="relative z-10 flex flex-col">
        {badge && (
          <span className="mb-2 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {badge}
          </span>
        )}

        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {/* Action CTA */}
      {ctaText && (
        <div className="relative z-10 mt-4 pt-2">
          <a
            href={ctaHref || "#"}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {ctaText}
            <svg
              className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default BentoGrid;
