"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductWithRelations } from "@/types/domain";

export function FavoritesGrid({
  items,
}: {
  items: { product: ProductWithRelations; imageUrl: string }[];
}) {
  const [favoriteIds, setFavoriteIds] = useState(
    new Set(items.map(({ product }) => product.id)),
  );

  const visibleItems = items.filter(({ product }) => favoriteIds.has(product.id));

  if (visibleItems.length === 0) {
    return (
      <p className="mt-4 text-zinc-500 dark:text-zinc-600">
        No favorites yet.{" "}
        <Link href="/" className="text-brand-red underline">
          Browse the catalog
        </Link>{" "}
        and tap the heart on a product.
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {visibleItems.map(({ product, imageUrl }) => (
        <ProductCard
          key={product.id}
          product={product}
          imageUrl={imageUrl}
          onFavoriteToggle={(isFavorite) => {
            if (isFavorite) return;
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
            });
          }}
        />
      ))}
    </div>
  );
}
