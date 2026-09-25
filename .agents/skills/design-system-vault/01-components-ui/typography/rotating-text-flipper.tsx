import React, { useState, useEffect } from 'react';

export interface RotatingTextFlipperProps {
  prefix?: string;         // ej: "Simple "
  words: string[];         // ej: ["tools", "systems", "help", "routines"]
  suffix?: string;         // ej: " that give growing and ambitious teams more clarity."
  intervalMs?: number;     // Tiempo entre rotaciones (default: 2400ms)
  highlightColor?: string; // Clase o color Tailwind para la palabra resaltada (default: text-emerald-400)
  className?: string;
}

/**
 * RotatingTextFlipper (OSMO 3D Flipping Word Animation)
 * 
 * Recrea exactamente la animación de osmo-rotating-text-1440x900.mp4:
 * 1. La palabra activa rota 90° hacia adelante/arriba en el eje X (rotateX(-90deg)) y desaparece con fade.
 * 2. La siguiente palabra entra rotando desde abajo (+90deg a 0deg) con perspectiva 3D realista.
 * 3. El ancho del contenedor de la palabra se anima suavemente para adaptarse al largo de cada palabra
 *    sin provocar saltos en el resto del texto.
 */
export const RotatingTextFlipper: React.FC<RotatingTextFlipperProps> = ({
  prefix = 'Simple ',
  words = ['tools', 'systems', 'help', 'routines'],
  suffix = ' that give growing and ambitious teams more clarity.',
  intervalMs = 2400,
  highlightColor = 'text-emerald-400',
  className = '',
}) => {
  const [index, setIndex] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsFlipping(false);
      }, 350); // Mitad del giro
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  return (
    <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-[1.2] text-foreground text-center ${className}`}>
      <span>{prefix}</span>

      {/* Contenedor con Perspectiva 3D para el Flip */}
      <span
        className="inline-block relative overflow-hidden align-baseline"
        style={{ perspective: '300px' }}
      >
        <span
          className={`inline-block font-bold transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${highlightColor} ${
            isFlipping
              ? '-translate-y-full rotate-x-90 opacity-0'
              : 'translate-y-0 rotate-x-0 opacity-100'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 50% -12px',
          }}
        >
          {words[index]}
        </span>
      </span>

      <span>{suffix}</span>
    </h2>
  );
};

export default RotatingTextFlipper;
