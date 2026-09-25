import React, { useRef, useState, MouseEvent } from "react";

export interface InteractiveGridHeroProps {
  badgeText?: string;
  badgeHref?: string;
  title?: React.ReactNode;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  metrics?: Array<{ label: string; value: string }>;
  className?: string;
}

/**
 * ⚡ Interactive Grid Hero (Magic UI & Linear Inspired)
 *
 * High-impact SaaS landing hero featuring a reactive ambient grid pattern
 * that illuminates dynamically with pointer movement, complete with glass CTA controls.
 */
export const InteractiveGridHero: React.FC<InteractiveGridHeroProps> = ({
  badgeText = "v2.0 Architecture Release →",
  badgeHref = "#",
  title = (
    <>
      Build high-craft SaaS <br />
      <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
        at the speed of thought.
      </span>
    </>
  ),
  description = "An uncompromising design system and component architecture engineered for solo-founders and elite product studios.",
  primaryAction = { label: "Start Building Now", href: "#" },
  secondaryAction = { label: "Explore Interactive Demo", href: "#" },
  metrics = [
    { label: "Active Deployments", value: "14,200+" },
    { label: "Render Latency", value: "<12ms" },
    { label: "Conversion Lift", value: "+34.8%" },
  ],
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative min-h-[640px] w-full overflow-hidden bg-[#08090a] px-6 py-24 text-white sm:py-32 lg:px-8 ${className}`}
    >
      {/* 1. Base Grid Layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* 2. Interactive Spotlight Beam on Grid */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.18), transparent 80%)`,
        }}
      />

      {/* 3. Ambient Top Glow Halo */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full blur-[140px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* 4. Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Release Pill Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.08]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <a href={badgeHref} className="hover:text-white">
              {badgeText}
            </a>
          </div>
        )}

        {/* Main Kinetic Headline */}
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg sm:leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {primaryAction && (
            <a
              href={primaryAction.href || "#"}
              onClick={primaryAction.onClick}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition-transform duration-150 hover:bg-slate-100 active:scale-[0.98]"
            >
              {primaryAction.label}
            </a>
          )}

          {secondaryAction && (
            <a
              href={secondaryAction.href || "#"}
              onClick={secondaryAction.onClick}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 text-sm font-medium text-white backdrop-blur-md transition-all duration-150 hover:border-white/30 hover:bg-white/[0.08] active:scale-[0.98]"
            >
              {secondaryAction.label}
            </a>
          )}
        </div>

        {/* Social Proof / Metrics Row */}
        {metrics && metrics.length > 0 && (
          <div className="mt-16 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-10 text-center">
            {metrics.map((metric, idx) => (
              <div key={idx} className="px-4">
                <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs text-slate-400 sm:text-sm">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveGridHero;
