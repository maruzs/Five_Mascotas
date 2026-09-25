import React, { useEffect, useRef } from "react";

export type MatrixOrbState = "idle" | "listening" | "thinking";

export interface MatrixOrbProps {
  state?: MatrixOrbState;
  size?: number;
  dotColor?: string;
  className?: string;
}

/**
 * 🌐 Matrix Orb (Rare UI & Libraries.dev Inspired)
 *
 * Futuristic 3D dot-matrix sphere animating through AI states (idle, listening, thinking)
 * with mathematical spherical coordinate rotation and depth-shaded points.
 */
export const MatrixOrb: React.FC<MatrixOrbProps> = ({
  state = "thinking",
  size = 220,
  dotColor = "#6366f1",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    let angleX = 0;

    // Generate sphere points on Fibonacci spiral
    const numPoints = 180;
    const points: { x: number; y: number; z: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    const radius = size * 0.38;

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({ x: x * radius, y: y * radius, z: z * radius });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const speed = state === "thinking" ? 0.03 : state === "listening" ? 0.04 : 0.01;
      angleY += speed;
      angleX += speed * 0.4;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const centerX = size / 2;
      const centerY = size / 2;

      // Project and sort points by Z for depth
      const projected = points.map((p) => {
        // Rotate around Y
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Pulsing breathing wave on radius
        const pulse = state === "thinking" ? Math.sin(angleY * 4 + p.y * 0.05) * 6 : 0;

        return {
          x: centerX + x1 + (x1 / radius) * pulse,
          y: centerY + y2 + (y2 / radius) * pulse,
          z: z2,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Render dots
      projected.forEach((pt) => {
        const depth = (pt.z + radius) / (radius * 2); // 0 (back) to 1 (front)
        const dotRadius = Math.max(1, depth * 2.8);
        const opacity = Math.max(0.15, Math.min(1, depth * 0.95 + 0.05));

        ctx.fillStyle = dotColor;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [state, size, dotColor]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default MatrixOrb;
