import React, { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export interface ThinkingOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

/**
 * 🔮 Thinking Orb (Libraries.dev & ChatGPT Voice Mode)
 *
 * Animated AI state indicator with multi-frequency procedural wave physics rendered
 * on high-DPI HTML5 Canvas, seamlessly morphing between Idle, Listening, Thinking, and Speaking.
 */
export const ThinkingOrb: React.FC<ThinkingOrbProps> = ({
  state = "thinking",
  size = 220,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += state === "thinking" ? 0.05 : state === "speaking" ? 0.07 : 0.02;

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.32;

      // Color paletting depending on state
      let color1 = "rgba(99, 102, 241, 0.85)"; // Indigo
      let color2 = "rgba(56, 189, 248, 0.75)"; // Sky
      let color3 = "rgba(236, 72, 153, 0.65)"; // Pink

      if (state === "listening") {
        color1 = "rgba(16, 185, 129, 0.85)"; // Emerald
        color2 = "rgba(52, 211, 153, 0.75)";
        color3 = "rgba(14, 165, 233, 0.65)";
      } else if (state === "speaking") {
        color1 = "rgba(244, 63, 94, 0.85)"; // Rose
        color2 = "rgba(251, 146, 60, 0.75)"; // Amber
        color3 = "rgba(168, 85, 247, 0.65)";
      }

      // 1. Draw outer ambient halo
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        baseRadius * 1.5
      );
      haloGrad.addColorStop(0, color1);
      haloGrad.addColorStop(0.6, color2);
      haloGrad.addColorStop(1, "transparent");

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw dynamic fluid organic blobs
      const numPoints = 64;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Multi-frequency wave distortion
        const freq1 = Math.sin(angle * 3 + t) * (state === "idle" ? 4 : 12);
        const freq2 = Math.cos(angle * 5 - t * 1.2) * (state === "idle" ? 2 : 8);
        const freq3 = Math.sin(angle * 2 + t * 0.8) * 6;
        const r = baseRadius + freq1 + freq2 + freq3;

        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        points.push({ x, y });
      }

      // Draw smooth closed polygon
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo((points[0].x + points[numPoints - 1].x) / 2, (points[0].y + points[numPoints - 1].y) / 2);
        for (let i = 0; i < numPoints; i++) {
          const next = points[(i + 1) % numPoints];
          ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + next.x) / 2, (points[i].y + next.y) / 2);
        }
      }
      ctx.closePath();

      const blobGrad = ctx.createLinearGradient(
        centerX - baseRadius,
        centerY - baseRadius,
        centerX + baseRadius,
        centerY + baseRadius
      );
      blobGrad.addColorStop(0, color1);
      blobGrad.addColorStop(0.5, color2);
      blobGrad.addColorStop(1, color3);

      ctx.fillStyle = blobGrad;
      ctx.fill();

      // 3. Specular inner light reflection
      const innerGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.3,
        centerY - baseRadius * 0.3,
        2,
        centerX,
        centerY,
        baseRadius * 0.8
      );
      innerGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      innerGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.1)");
      innerGrad.addColorStop(1, "transparent");

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [state, size]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="will-change-transform"
      />
    </div>
  );
};

export default ThinkingOrb;
