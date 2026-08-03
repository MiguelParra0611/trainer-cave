"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/client";
import type { ProductWithRelations } from "@/types/domain";

export default function CheckoutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, ProductWithRelations>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const cart = getCart();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(Boolean(user));
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    const ids = cart.map((item) => item.productId);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids)
      .returns<RawProductRow[]>()
      .then(({ data }) => {
        if (!data) return;
        setProducts(
          Object.fromEntries(data.map((row) => [row.id, toProductWithRelations(row)])),
        );
        setLoading(false);
      });
    // Runs once on mount — the cart is read once for this checkout attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = cart
    .map((item) => ({ item, product: products[item.productId] }))
    .filter((row): row is { item: (typeof cart)[number]; product: ProductWithRelations } =>
      Boolean(row.product),
    );
  const totalCents = rows.reduce(
    (sum, { item, product }) => sum + product.price_cents * item.quantity,
    0,
  );
  const currency = rows[0]?.product.currency ?? "USD";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    sessionStorage.setItem("trainer-cave:last-order", JSON.stringify(data));
    clearCart();
    router.push("/checkout/confirmation");
  }

  if (!authChecked) return null;

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-500 dark:text-zinc-600">
          Please{" "}
          <Link href="/login?next=/checkout" className="text-brand-red underline">
            log in
          </Link>{" "}
          to continue to checkout.
        </p>
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-500 dark:text-zinc-600">
          Your cart is empty.{" "}
          <Link href="/" className="text-brand-red underline">
            Browse the catalog
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-600">
        This is a simulated checkout — no real payment is collected.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {rows.map(({ item, product }) => (
          <div key={item.productId} className="flex justify-between py-1 text-sm">
            <span>
              {product.name} × {item.quantity}
            </span>
            <span>{formatPrice(product.price_cents * item.quantity, product.currency)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-zinc-800">
          <span>Total</span>
          <span>{formatPrice(totalCents, currency)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="address">
            Shipping address
          </label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting || rows.length === 0}
          className="w-full rounded-full bg-brand-red px-4 py-3 font-medium text-white hover:bg-brand-red/90 disabled:opacity-70"
        >
          {submitting ? "Placing order…" : "Confirm Order"}
        </button>
      </form>
    </div>
  );
}
