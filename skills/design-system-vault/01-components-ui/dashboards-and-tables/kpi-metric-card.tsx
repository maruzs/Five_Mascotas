import React, { useState } from "react";

export interface KpiMetricCardProps {
  title: string;
  value: string | number;
  change: number; // e.g. 14.2 or -3.5
  changePeriod?: string;
  sparklineData?: number[];
  currencyPrefix?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * 📊 KPI Metric Card with Animated Interactive Sparkline
 *
 * High-density executive analytics card with positive/negative delta badge
 * and an interactive SVG sparkline chart that displays data points on hover.
 */
export const KpiMetricCard: React.FC<KpiMetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = "vs. last month",
  sparklineData = [32, 45, 38, 52, 48, 65, 78, 70, 84, 96],
  currencyPrefix = "",
  icon,
  className = "",
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isPositive = change >= 0;
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = `kpi-grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // SVG Sparkline Geometry Calculation
  const width = 240;
  const height = 54;
  const padding = 6;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  const points = sparklineData.map((val, idx) => {
    const x = padding + (idx / (sparklineData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      {/* Main KPI Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {currencyPrefix}
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      </div>

      {/* Delta Percentage & Period */}
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-slate-500 dark:text-slate-400">{changePeriod}</span>
      </div>

      {/* Interactive SVG Sparkline */}
      <div className="relative mt-4 h-[54px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gradient Under Sparkline */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Hotspots */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 4 : 2}
              fill={hoverIndex === i ? strokeColor : "transparent"}
              stroke={hoverIndex === i ? "#ffffff" : "transparent"}
              strokeWidth={hoverIndex === i ? 1.5 : 0}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        {/* Hover Point Value Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white shadow dark:bg-white dark:text-slate-900"
            style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
          >
            {points[hoverIndex].val}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiMetricCard;
