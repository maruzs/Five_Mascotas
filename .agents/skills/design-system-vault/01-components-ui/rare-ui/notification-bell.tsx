import React, { useState } from "react";

export interface NotificationBellProps {
  initialCount?: number;
  onClear?: () => void;
  className?: string;
}

/**
 * 🔔 Notification Bell with Swing Physics (Rare UI / iOS Style)
 *
 * Campana de notificaciones interactiva con oscilación pendular física
 * y badge numérico de mensajes no leídos con animación elástica.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  initialCount = 3,
  onClear,
  className = "",
}) => {
  const [count, setCount] = useState(initialCount);
  const [isSwinging, setIsSwinging] = useState(false);

  const handleClick = () => {
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 800);
    if (count > 0) {
      setCount(0);
      onClear?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Ver notificaciones"
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 ${className}`}
    >
      {/* Bell SVG with pendulum swing */}
      <svg
        className={`h-5 w-5 origin-top transition-transform ${
          isSwinging ? "animate-[bell-swing_0.8s_ease-in-out]" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread Count Badge */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
          {count}
        </span>
      )}

      <style>{`
        @keyframes bell-swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(16deg); }
          40% { transform: rotate(-14deg); }
          60% { transform: rotate(8deg); }
          80% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </button>
  );
};

export default NotificationBell;
