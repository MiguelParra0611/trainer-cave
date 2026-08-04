"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart, subscribeToCart } from "@/lib/cart";

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
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
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function FloatingActions() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function refresh() {
      setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    }
    refresh();
    return subscribeToCart(refresh);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideCart = pathname.startsWith("/cart") || pathname.startsWith("/checkout");

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-navy shadow-lg transition-all duration-300 hover:bg-zinc-100 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUpIcon />
      </button>

      {!hideCart && (
        <Link
          href="/cart"
          aria-label="Carrito"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-lg hover:bg-brand-red/90"
        >
          <CartIcon />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 text-xs font-bold text-brand-navy">
            {cartCount}
          </span>
        </Link>
      )}
    </div>
  );
}
