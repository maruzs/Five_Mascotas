import React, { useState } from "react";

export interface ColorVariant {
  name: string;
  hex: string;
  imageUrl: string;
}

export interface ProductCardProps {
  id: string;
  title: string;
  category?: string;
  price: number;
  originalPrice?: number;
  stockCount: number; // 0 for sold out, <= 5 for low stock
  variants: ColorVariant[];
  onAddToCart?: (productId: string, variant: ColorVariant) => void;
  className?: string;
}

/**
 * 🛍️ Minimalist E-Commerce Product Card
 *
 * Modern product showcase card featuring interactive color variant switching,
 * dynamic inventory stock badges, wishlist heart toggle, and instant add-to-cart confirmation.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  category = "Essentials",
  price,
  originalPrice,
  stockCount,
  variants,
  onAddToCart,
  className = "",
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant>(
    variants[0] || {
      name: "Default",
      hex: "#000000",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    }
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isSoldOut = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    setIsAdded(true);
    onAddToCart?.(id, selectedVariant);
    setTimeout(() => setIsAdded(false), 1600);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-white/[0.08] dark:bg-[#0f1115] ${className}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-[#15181e]">
        <img
          src={selectedVariant.imageUrl}
          alt={`${title} - ${selectedVariant.name}`}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Stock Badge */}
        <div className="absolute left-2.5 top-2.5">
          {isSoldOut ? (
            <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md dark:bg-white/20">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              Only {stockCount} left
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              In Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-90 dark:bg-black/40 dark:text-white"
          aria-label="Toggle Wishlist"
        >
          <svg
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "fill-transparent text-current"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {category}
          </span>
          <h4 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h4>

          {/* Pricing */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              ${price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Color Swatches */}
        {variants.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5">
            {variants.map((v) => (
              <button
                key={v.name}
                onClick={() => setSelectedVariant(v)}
                className={`h-4 w-4 rounded-full border transition-all ${
                  selectedVariant.name === v.name
                    ? "scale-110 border-indigo-600 ring-2 ring-indigo-500/30 dark:border-white"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: v.hex }}
                title={v.name}
              />
            ))}
          </div>
        )}

        {/* Add To Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`mt-4 flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          }`}
        >
          {isSoldOut ? "Sold Out" : isAdded ? "Added to Bag ✓" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
