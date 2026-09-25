import React, { useState } from 'react';

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  shopName: string;
  address: string;
  orderNo: string;
  date: string;
  items: ReceiptItem[];
  taxRate?: number;
  currencySymbol?: string;
  footerMessage?: string;
}

export interface ReceiptPrinterModalProps {
  receipt?: ReceiptData;
  onPrintComplete?: () => void;
  className?: string;
}

/**
 * ReceiptPrinterModal (Accurate 2-Stage Animation)
 * 
 * Etapa 1: La máquina imprime el recibo y lo desliza hacia abajo desde la ranura.
 * Etapa 2: Efecto corte de cuchilla (Tear-off cut). El recibo se desprende, asciende y
 *          se posiciona en primer plano (z-30) con zoom ampliado (scale-125) justo sobre la máquina.
 */
export const ReceiptPrinterModal: React.FC<ReceiptPrinterModalProps> = ({
  receipt = {
    shopName: 'Shop Name',
    address: 'Address 123, City, State, ZIP Code',
    orderNo: '#001234',
    date: '2026-01-03 11:48',
    items: [
      { name: 'First item', qty: 1, price: 5.99 },
      { name: 'Second item', qty: 1, price: 21.49 },
      { name: 'Third item', qty: 2, price: 6.20 },
      { name: 'Fourth item', qty: 1, price: 3.79 },
      { name: 'Fifth item', qty: 5, price: 1.29 },
    ],
    taxRate: 0.13,
    currencySymbol: '$',
    footerMessage: 'Thank you!',
  },
  onPrintComplete,
  className = '',
}) => {
  const [phase, setPhase] = useState<'idle' | 'printing' | 'cut_focus'>('idle');

  const subtotal = receipt.items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * (receipt.taxRate || 0);
  const total = subtotal + tax;
  const currency = receipt.currencySymbol || '$';

  const handleStart = () => {
    if (phase === 'printing') return;
    if (phase === 'cut_focus') {
      // Reiniciar
      setPhase('idle');
      return;
    }

    // 1. Iniciar impresión hacia abajo
    setPhase('printing');

    // 2. A los 2.4s: corte y salto al frente ampliado (scale-up sobre la máquina)
    setTimeout(() => {
      setPhase('cut_focus');
      onPrintComplete?.();
    }, 2400);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 select-none ${className}`}>
      {/* Contenedor relativo con altura suficiente para la animación */}
      <div className="relative flex flex-col items-center w-[340px] min-h-[460px] pt-8">
        
        {/* Cuerpo de la Impresora */}
        <div className={`relative z-10 w-full h-[88px] bg-[#dfdacf] dark:bg-[#2d2c33] rounded-b-xl rounded-t-sm shadow-[0_12px_28px_rgba(0,0,0,0.25)] border-t border-white/50 p-3 flex items-center justify-between transition-opacity duration-500 ${phase === 'cut_focus' ? 'opacity-80' : 'opacity-100'}`}>
          
          {/* Pantalla LCD */}
          <div className="flex items-center px-3 h-[38px] w-[210px] bg-[#1a1c18] rounded-md border border-neutral-700 shadow-inner overflow-hidden">
            <span className={`text-xs font-mono tracking-wider ${phase === 'printing' ? 'text-emerald-400 animate-pulse' : phase === 'cut_focus' ? 'text-cyan-400' : 'text-neutral-400'}`}>
              {phase === 'printing' ? 'Printing...' : phase === 'cut_focus' ? 'Ready! Click reset' : 'Click to print'}
            </span>
          </div>

          {/* Botón */}
          <button
            onClick={handleStart}
            disabled={phase === 'printing'}
            className="w-[44px] h-[38px] rounded-md bg-[#cfcbbe] hover:bg-[#c2beaf] border border-neutral-400/40 flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
            title={phase === 'cut_focus' ? 'Reiniciar' : 'Imprimir'}
          >
            <svg className={`w-5 h-5 ${phase === 'printing' ? 'animate-spin text-neutral-600' : 'text-neutral-800'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {phase === 'cut_focus' ? (
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16 M3 21v-5h5" />
              ) : (
                <path d="M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z" />
              )}
            </svg>
          </button>

          {/* Ranura */}
          <div className="absolute -bottom-1.5 left-4 right-4 h-2 bg-[#201f22] rounded-sm shadow-inner" />
        </div>

        {/* El Recibo de Papel con animación de 2 fases */}
        <div
          className={`absolute w-[240px] bg-[#faf9f5] text-neutral-800 transition-all duration-700 ease-out overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.35)] ${
            phase === 'idle'
              ? 'top-[110px] max-h-0 opacity-0 pointer-events-none scale-100 z-0'
              : phase === 'printing'
              ? 'top-[110px] max-h-[380px] opacity-100 scale-100 z-0'
              : 'top-[30px] max-h-[380px] opacity-100 scale-125 z-30'
          }`}
        >
          {/* Troquelado superior (después del corte) */}
          {phase === 'cut_focus' && (
            <div className="w-full h-2 overflow-hidden bg-[#faf9f5]">
              <svg viewBox="0 0 240 8" preserveAspectRatio="none" className="w-full h-full text-[#dfdacf] dark:text-[#2d2c33] fill-current">
                <polygon points="0,0 8,8 16,0 24,8 32,0 40,8 48,0 56,8 64,0 72,8 80,0 88,8 96,0 104,8 112,0 120,8 128,0 136,8 144,0 152,8 160,0 168,8 176,0 184,8 192,0 200,8 208,0 216,8 224,0 232,8 240,0" />
              </svg>
            </div>
          )}

          {/* Contenido */}
          <div className="p-4 font-mono text-[10px] leading-snug">
            <div className="flex justify-between items-start border-b border-dashed border-neutral-300 pb-2 mb-2">
              <div>
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-neutral-900">{receipt.shopName}</h3>
                <p className="text-[9px] text-neutral-500 whitespace-pre-line mt-0.5">{receipt.address}</p>
                <p className="text-[8px] text-neutral-400 mt-1">
                  Order No. <span className="text-neutral-700 font-semibold">{receipt.orderNo}</span>
                </p>
                <p className="text-[8px] text-neutral-400">{receipt.date}</p>
              </div>
              <div className="w-7 h-7 rounded bg-neutral-200/70 flex items-center justify-center text-neutral-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider pb-0.5 border-b border-neutral-200">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-neutral-700 text-[9px]">
                  <span className="truncate max-w-[110px]">{it.name}</span>
                  <span className="text-neutral-400">{it.qty} x</span>
                  <span className="font-medium">{(it.qty * it.price).toFixed(2)} {currency}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-neutral-300 pt-1.5 space-y-0.5">
              <div className="flex justify-between text-neutral-600 text-[9px]">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} {currency}</span>
              </div>
              {receipt.taxRate && (
                <div className="flex justify-between text-neutral-600 text-[9px]">
                  <span>Tax ({(receipt.taxRate * 100).toFixed(0)}%)</span>
                  <span>{tax.toFixed(2)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] font-bold text-neutral-900 pt-0.5 border-t border-neutral-200">
                <span>Total</span>
                <span>{total.toFixed(2)} {currency}</span>
              </div>
            </div>

            {receipt.footerMessage && (
              <div className="text-center text-neutral-500 text-[9px] mt-2.5 uppercase tracking-widest font-bold">
                {receipt.footerMessage}
              </div>
            )}
          </div>

          {/* Troquelado inferior */}
          <div className="w-full h-2.5 overflow-hidden">
            <svg viewBox="0 0 240 10" preserveAspectRatio="none" className="w-full h-full text-[#faf9f5] fill-current">
              <polygon points="0,0 8,10 16,0 24,10 32,0 40,10 48,0 56,10 64,0 72,10 80,0 88,10 96,0 104,10 112,0 120,10 128,0 136,10 144,0 152,10 160,0 168,10 176,0 184,10 192,0 200,10 208,0 216,10 224,0 232,10 240,0" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceiptPrinterModal;
