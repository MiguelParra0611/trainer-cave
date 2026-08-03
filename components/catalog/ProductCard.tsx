import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { TypeBadge } from "@/components/product/TypeBadge";
import { formatPokemonName, formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/types/domain";

export function ProductCard({
  product,
  imageUrl,
  onFavoriteToggle,
}: {
  product: ProductWithRelations;
  imageUrl: string;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:border-brand-red hover:shadow-md dark:border-zinc-800">
      {/* Sibling to the Link below, not a descendant — nesting a <button> inside
          an <a> would bubble clicks into the anchor and trigger navigation. */}
      <FavoriteButton
        productId={product.id}
        compact
        className="absolute right-2 top-2 z-10"
        onToggle={onFavoriteToggle}
      />

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <div className="space-y-2 bg-zinc-100 p-4 pb-2 dark:bg-zinc-300">
          <div className="flex flex-wrap gap-1.5">
            {product.pokemon.types.map((type) => (
              <TypeBadge key={type.id} name={type.name} colorHex={type.color_hex} />
            ))}
          </div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-600">
            {product.article_type.name} · {formatPokemonName(product.pokemon.name)}
          </p>
          <p className="font-semibold text-brand-red">
            {formatPrice(product.price_cents, product.currency)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <AddToCartButton productId={product.id} compact className="w-full" />
      </div>
    </div>
  );
}
