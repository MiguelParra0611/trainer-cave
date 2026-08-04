"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SouvenirStatCard } from "@/components/checkout/SouvenirStatCard";
import { formatPokemonName, formatPrice } from "@/lib/format";

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  pokemon: {
    name: string;
    spriteUrl: string;
    cardImageUrl: string | null;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
};

type OrderSummary = {
  orderId: string;
  createdAt: string;
  totalCents: number;
  currency: string;
  items: OrderItem[];
};

export default function CheckoutConfirmationPage() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("trainer-cave:last-order");
    if (raw) setOrder(JSON.parse(raw));
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-500 dark:text-zinc-600">
          No se encontró ningún pedido reciente.{" "}
          <Link href="/" className="text-brand-red underline">
            Volver al catálogo
          </Link>
          .
        </p>
      </div>
    );
  }

  const uniquePokemon = Array.from(
    new Map(order.items.map((item) => [item.pokemon.name, item.pokemon])).values(),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        ¡Pedido confirmado!
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-600">
        Pedido <span className="font-mono">{order.orderId}</span> — este es
        un pedido simulado, no se envió ni se cobró nada realmente.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between py-1 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-zinc-800">
          <span>Total</span>
          <span>{formatPrice(order.totalCents, order.currency)}</span>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-brand-navy">
        Tus cartas coleccionables
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-600">
        Cada pedido incluye una carta de estadísticas por cada Pokémon que
        compraste.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        {uniquePokemon.map((pokemon) => (
          <SouvenirStatCard
            key={pokemon.name}
            pokemonName={formatPokemonName(pokemon.name)}
            spriteUrl={pokemon.spriteUrl}
            cardImageUrl={pokemon.cardImageUrl}
            stats={pokemon}
          />
        ))}
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-brand-red px-6 py-2.5 font-medium text-white hover:bg-brand-red/90"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
