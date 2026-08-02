"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  productId,
  compact = false,
  className = "",
}: {
  productId: string;
  compact?: boolean;
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  const sizeClasses = compact ? "px-3 py-1.5 text-sm" : "px-6 py-2.5";

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`rounded-full bg-brand-red font-medium text-white transition-colors hover:bg-brand-red/90 disabled:opacity-70 ${sizeClasses} ${className}`}
      disabled={added}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
