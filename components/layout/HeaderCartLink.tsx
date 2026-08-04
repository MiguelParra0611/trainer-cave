"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, subscribeToCart } from "@/lib/cart";

export function HeaderCartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    }
    refresh();
    return subscribeToCart(refresh);
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="Carrito"
      className="relative flex h-9 w-9 items-center justify-center hover:text-brand-yellow"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-brand-navy">
        {count}
      </span>
    </Link>
  );
}
