"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { productImageUrl } from "@/lib/storage";
import type { ProductWithRelations } from "@/types/domain";

export function CartItemRow({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: {
  product: ProductWithRelations;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-4">
        <Link
          href={`/products/${product.id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900"
        >
          <Image
            src={productImageUrl(product.primary_image_path)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </Link>

        <div className="min-w-0 flex-1 sm:flex-initial">
          <Link href={`/products/${product.id}`} className="font-medium hover:underline">
            {product.name}
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-600">
            {formatPrice(product.price_cents, product.currency)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:ml-auto sm:justify-normal">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuantityChange(quantity - 1)}
            className="h-7 w-7 shrink-0 rounded-full border border-zinc-300 text-sm dark:border-zinc-700"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="h-7 w-7 shrink-0 rounded-full border border-zinc-300 text-sm dark:border-zinc-700"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <p className="w-24 shrink-0 text-right font-medium">
          {formatPrice(product.price_cents * quantity, product.currency)}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-sm text-zinc-400 hover:text-brand-red"
          aria-label="Remove from cart"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
