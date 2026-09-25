import React, { CSSProperties } from "react";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shimmer sweep color (default: white beam) */
  shimmerColor?: string;
  /** Shimmer size in pixels (default: 0.1em) */
  shimmerSize?: string;
  /** Shimmer cycle duration in seconds (default: 3s) */
  shimmerDuration?: string;
  /** Background color of button surface (default: #0f1115) */
  background?: string;
  /** Border radius of the button (default: 9999px / pill) */
  borderRadius?: string;
  /** Children content (label, icons) */
  children: React.ReactNode;
  /** Custom additional className */
  className?: string;
}

/**
 * ✨ Shimmer Button (Magic UI Inspired)
 *
 * High-conversion CTA button featuring an orbiting, animated specular light beam
 * along its hairline perimeter with a dark frosted glass surface and responsive click physics.
 */
export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.08em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(15, 17, 21, 0.95)",
      children,
      className = "",
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
            ...style,
          } as CSSProperties
        }
        className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-sm font-medium text-white transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [border-radius:var(--radius)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a] ${className}`}
        {...props}
      >
        {/* Shimmer light beam container */}
        <div className="absolute inset-0 overflow-visible [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-[shimmer-slide_var(--speed)_linear_infinite] [aspect-ratio:1]">
            {/* Rotating conic light beam */}
            <div
              className="absolute -inset-[100%] h-[300%] w-[300%] animate-[shimmer-spin_var(--speed)_linear_infinite] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `conic-gradient(from 0deg, transparent 0 320deg, var(--shimmer-color) 360deg)`,
              }}
            />
          </div>
        </div>

        {/* Backdrop Surface Mask with inner hairline glow */}
        <div
          className="absolute inset-[1px] -z-10 rounded-[calc(var(--radius)-1px)] transition-colors duration-300 [background:var(--bg)] backdrop-blur-xl group-hover:bg-[#181a20]"
          style={{
            boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        />

        {/* Content with smooth hover lift */}
        <div className="relative z-10 flex items-center gap-2 transition-transform duration-200 group-hover:-translate-y-[0.5px]">
          {children}
        </div>

        <style>{`
          @keyframes shimmer-spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
