"use client";

import { useEffect, useState } from "react";
import { addToCart, getCart, removeFromCart, subscribeToCart } from "@/lib/cart";

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
      onClick={() => (inCart ? removeFromCart(productId) : addToCart(productId))}
      aria-label={inCart ? "Quitar del carrito" : "Agregar al carrito"}
      title={inCart ? "Quitar del carrito" : undefined}
      className={`rounded-full font-medium transition-colors ${sizeClasses} ${className} ${
        inCart
          ? "border border-brand-red bg-white text-brand-red hover:bg-red-50"
          : "bg-brand-red text-white hover:bg-brand-red/90"
      }`}
    >
      {inCart ? "Agregado ✓" : "Agregar al Carrito"}
    </button>
  );
}
