"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="rounded-full bg-brand-navy px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-blue disabled:opacity-70"
      disabled={added}
    >
      {added ? "Added to cart ✓" : "Add to Cart"}
    </button>
  );
}
