"use client";

import { useEffect, useState } from "react";
import { addToCart, getCart, subscribeToCart } from "@/lib/cart";

export function AddToCartButton({
  productId,
  compact = false,
  className = "",
}: {
  productId: string;
  compact?: boolean;
  className?: string;
}) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    function refresh() {
      setInCart(getCart().some((item) => item.productId === productId));
    }
    refresh();
    return subscribeToCart(refresh);
  }, [productId]);

  const sizeClasses = compact ? "px-3 py-1.5 text-sm" : "px-6 py-2.5";

  return (
    <button
      type="button"
      onClick={() => addToCart(productId)}
      className={`rounded-full bg-brand-red font-medium text-white transition-colors hover:bg-brand-red/90 disabled:opacity-70 ${sizeClasses} ${className}`}
      disabled={inCart}
    >
      {inCart ? "Agregado ✓" : "Agregar al Carrito"}
    </button>
  );
}
