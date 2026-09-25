import React, { useState } from "react";

export interface InPlaceDeleteButtonProps {
  onConfirm: () => void;
  itemName?: string;
  className?: string;
}

/**
 * 🗑️ In-Place Delete Button (Rare UI)
 *
 * Botón de eliminación destructivo que solicita confirmación en el mismo contenedor
 * mediante micro-transición sin interrumpir el flujo con ventanas modales invasivas.
 */
export const InPlaceDeleteButton: React.FC<InPlaceDeleteButtonProps> = ({
  onConfirm,
  itemName = "elemento",
  className = "",
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm();
      setIsConfirming(false);
      setIsDeleting(false);
    }, 600);
  };

  return (
    <div className={`relative inline-flex items-center overflow-hidden rounded-xl transition-all ${className}`}>
      {!isConfirming ? (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Eliminar {itemName}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-500 p-1 text-xs text-white shadow-md animate-in fade-in zoom-in-95 dark:border-rose-400">
          <span className="px-2 font-semibold">¿Confirmar?</span>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="rounded-lg bg-white px-2.5 py-1 font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? "Borrando..." : "Sí, borrar"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="rounded-lg bg-black/20 px-2 py-1 font-semibold text-white transition hover:bg-black/30"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default InPlaceDeleteButton;
