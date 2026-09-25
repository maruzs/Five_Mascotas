import React, { CSSProperties } from "react";

export interface BorderBeamProps {
  /** Size of beam in px (default: 200) */
  size?: number;
  /** Duration of full border loop in seconds (default: 12) */
  duration?: number;
  /** Border width of container in px (default: 1.5) */
  borderWidth?: number;
  /** Anchor percentage for beam offset (default: 90) */
  anchor?: number;
  /** Primary glow color from */
  colorFrom?: string;
  /** Secondary glow color to */
  colorTo?: string;
  /** Beam delay in seconds */
  delay?: number;
  className?: string;
}

/**
 * ⚡ Border Beam (Libraries.dev & Magic UI Inspired)
 *
 * An animated luminous beam traveling along the border perimeter of any element or card.
 * Uses pure CSS conic gradient and container masks for high-performance 60fps execution.
 */
export const BorderBeam: React.FC<BorderBeamProps> = ({
  size = 200,
  duration = 12,
  borderWidth = 1.5,
  anchor = 90,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
  className = "",
}) => {
  return (
    <div
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--anchor": `${anchor}%`,
          "--border-width": `${borderWidth}px`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width))_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] animate-border-beam [animation-delay:var(--delay)] [animation-duration:var(--duration)] [background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] [offset-anchor:calc(var(--anchor))_50%] [offset-path:rect(0_auto_auto_0_round_calc(var(--size)))]"
      />
      <style>{`
        @keyframes border-beam {
          to {
            offset-distance: 100%;
          }
        }
        .animate-border-beam {
          animation: border-beam var(--duration) infinite linear;
        }
      `}</style>
    </div>
  );
};

export default BorderBeam;
