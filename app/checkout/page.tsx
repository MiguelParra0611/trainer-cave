"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/client";
import type { ProductWithRelations } from "@/types/domain";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

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

  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  function validatePayment(): string | null {
    if (paymentMethod === "card") {
      if (cardName.trim().length === 0) return "Ingresa el nombre en la tarjeta.";
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        return "El número de tarjeta debe tener 16 dígitos.";
      }
      const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(cardExpiry);
      if (!expiryMatch) return "Ingresa la fecha de vencimiento como MM/AA.";
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      if (month < 1 || month > 12) return "Ingresa un mes de vencimiento válido.";
      const expiryDate = new Date(year, month);
      if (expiryDate.getTime() <= Date.now()) return "Esta tarjeta está vencida.";
      if (cardCvc.length < 3 || cardCvc.length > 4) return "El CVC debe tener 3 o 4 dígitos.";
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
      return "Ingresa un correo de PayPal válido.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const paymentValidationError = validatePayment();
    if (paymentValidationError) {
      setPaymentError(paymentValidationError);
      return;
    }
    setPaymentError(null);
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Algo salió mal.");
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
          Por favor{" "}
          <Link href="/login?next=/checkout" className="text-brand-red underline">
            inicia sesión
          </Link>{" "}
          para continuar con el pago.
        </p>
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-500 dark:text-zinc-600">
          Tu carrito está vacío.{" "}
          <Link href="/" className="text-brand-red underline">
            Explorar el catálogo
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Finalizar Compra
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-600">
        Este es un checkout simulado — no se cobra ningún pago real.
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
            Nombre
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
            Dirección de envío
          </label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <p className="block text-sm font-medium">Pago</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-600">
            Pago simulado — no se contacta a ninguna red de tarjetas ni a
            PayPal, y nada de lo que ingreses aquí se envía a nuestro
            servidor.
          </p>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              aria-pressed={paymentMethod === "card"}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                paymentMethod === "card"
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              Tarjeta
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("paypal")}
              aria-pressed={paymentMethod === "paypal"}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                paymentMethod === "paypal"
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              PayPal
            </button>
          </div>

          {paymentMethod === "card" ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium" htmlFor="card-name">
                  Nombre en la tarjeta
                </label>
                <input
                  id="card-name"
                  autoComplete="cc-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="card-number">
                  Número de tarjeta
                </label>
                <input
                  id="card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium" htmlFor="card-expiry">
                    Vencimiento
                  </label>
                  <input
                    id="card-expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium" htmlFor="card-cvc">
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <label className="block text-sm font-medium" htmlFor="paypal-email">
                Correo de PayPal
              </label>
              <input
                id="paypal-email"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          )}

          {paymentError && <p className="mt-2 text-sm text-brand-red">{paymentError}</p>}
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting || rows.length === 0}
          className="w-full rounded-full bg-brand-red px-4 py-3 font-medium text-white hover:bg-brand-red/90 disabled:opacity-70"
        >
          {submitting ? "Procesando pedido…" : `Pagar ${formatPrice(totalCents, currency)}`}
        </button>
      </form>
    </div>
  );
}
