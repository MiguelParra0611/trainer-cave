import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "@/components/product/TypeBadge";
import { formatPokemonName, formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/types/domain";

export function ProductCard({
  product,
  imageUrl,
}: {
  product: ProductWithRelations;
  imageUrl: string;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:border-brand-blue hover:shadow-md dark:border-zinc-800"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.pokemon.types.map((type) => (
            <TypeBadge key={type.id} name={type.name} colorHex={type.color_hex} />
          ))}
        </div>
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {product.article_type.name} · {formatPokemonName(product.pokemon.name)}
        </p>
        <p className="font-semibold text-brand-navy dark:text-brand-blue">
          {formatPrice(product.price_cents, product.currency)}
        </p>
      </div>
    </Link>
  );
}
