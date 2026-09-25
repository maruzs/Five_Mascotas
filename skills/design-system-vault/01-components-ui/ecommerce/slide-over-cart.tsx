import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CartItem {
  id: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface SlideOverCartProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: CartItem[];
  freeShippingThreshold?: number;
  onCheckout?: (items: CartItem[], total: number) => void;
}

const defaultCartItems: CartItem[] = [
  {
    id: "item-1",
    title: "Minimalist Mechanical Keyboard",
    variant: "OLED Stealth / Linear switches",
    price: 189.0,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80",
  },
  {
    id: "item-2",
    title: "Desk Mat (Merino Wool)",
    variant: "Charcoal Slate / 900x400mm",
    price: 64.0,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=300&q=80",
  },
];

/**
 * 🛒 Slide-Over Cart Drawer
 *
 * High-conversion e-commerce slide-over drawer featuring fluid Framer Motion
 * physics, quantity adjustment, free shipping progress bar, and checkout lock.
 */
export const SlideOverCart: React.FC<SlideOverCartProps> = ({
  isOpen,
  onClose,
  initialItems = defaultCartItems,
  freeShippingThreshold = 250,
  onCheckout,
}) => {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = discountApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 15;
  const total = subtotal - discount + shipping;

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="w-screen max-w-md border-l border-slate-200/80 bg-white shadow-2xl flex flex-col justify-between dark:border-white/[0.08] dark:bg-[#0c0e12]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Shopping Bag
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="border-b border-slate-100 bg-slate-50/75 px-6 py-3 dark:border-white/[0.06] dark:bg-[#111318]">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>
                    {subtotal >= freeShippingThreshold
                      ? "🎉 You unlocked Free Worldwide Shipping!"
                      : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`}
                  </span>
                  <span>{freeShippingProgress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Cart Items Scroll Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <svg
                      className="h-12 w-12 text-slate-300 dark:text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
                      Your bag is empty
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Explore our collections to discover high-craft gear.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {items.map((item) => (
                      <div key={item.id} className="flex py-4 gap-4">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-18 w-18 shrink-0 rounded-xl object-cover bg-slate-100 dark:bg-white/5"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500">{item.variant}</p>
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Quantity & Delete Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-rose-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Footer & Checkout */}
              {items.length > 0 && (
                <div className="border-t border-slate-200/80 p-6 dark:border-white/[0.08] dark:bg-[#0a0c10]">
                  {/* Promo Code Row */}
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (try 'SOLO10')"
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (promoCode.toUpperCase() === "SOLO10") setDiscountApplied(true);
                      }}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Discount (10%)</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-2 text-sm font-bold text-slate-900 dark:border-white/10 dark:text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => onCheckout?.(items, total)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Proceed to Checkout (${total.toFixed(2)})
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideOverCart;
