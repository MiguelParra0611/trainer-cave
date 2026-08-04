"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartItemRow } from "@/components/cart/CartItemRow";
import {
  getCart,
  removeFromCart,
  subscribeToCart,
  updateQuantity,
} from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, ProductWithRelations } from "@/types/domain";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, ProductWithRelations>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function refresh() {
      setItems(getCart());
    }
    refresh();
    return subscribeToCart(refresh);
  }, []);

  useEffect(() => {
    const ids = items.map((item) => item.productId);
    if (ids.length === 0) {
      setProducts({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids)
      .returns<RawProductRow[]>()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const byId = Object.fromEntries(
          data.map((row) => [row.id, toProductWithRelations(row)]),
        );
        setProducts(byId);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // items array identity changes on every cart mutation, which is exactly when we want to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)]);

  const rows = items
    .map((item) => ({ item, product: products[item.productId] }))
    .filter((row): row is { item: CartItem; product: ProductWithRelations } => Boolean(row.product));

  const subtotalCents = rows.reduce(
    (sum, { item, product }) => sum + product.price_cents * item.quantity,
    0,
  );
  const currency = rows[0]?.product.currency ?? "USD";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Carrito</h1>

      {!loading && rows.length === 0 ? (
        <p className="mt-4 text-zinc-500 dark:text-zinc-600">
          Tu carrito está vacío.{" "}
          <Link href="/" className="text-brand-red underline">
            Explorar el catálogo
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-6">
            {rows.map(({ item, product }) => (
              <CartItemRow
                key={item.productId}
                product={product}
                quantity={item.quantity}
                onQuantityChange={(quantity) => updateQuantity(item.productId, quantity)}
                onRemove={() => removeFromCart(item.productId)}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-lg font-semibold">Subtotal</span>
            <span className="text-lg font-semibold text-brand-red">
              {formatPrice(subtotalCents, currency)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-brand-red px-4 py-3 text-center font-medium text-white hover:bg-brand-red/90"
          >
            Ir a Pagar
          </Link>
        </>
      )}
    </div>
  );
}
