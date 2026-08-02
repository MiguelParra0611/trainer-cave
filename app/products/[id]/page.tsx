import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { PokedexBonus } from "@/components/product/PokedexBonus";
import { TypeBadge } from "@/components/product/TypeBadge";
import { getProductById } from "@/lib/catalog";
import { formatPokemonName, formatPrice } from "@/lib/format";
import {
  fetchPokemon,
  fetchPokemonSpecies,
  getEnglishFlavorText,
} from "@/lib/pokeapi";
import { productImageUrl } from "@/lib/storage";

const DAY_IN_SECONDS = 60 * 60 * 24;

async function getPokedexBonus(pokemonId: number) {
  try {
    const [pokemon, species] = await Promise.all([
      fetchPokemon(pokemonId, { next: { revalidate: DAY_IN_SECONDS } }),
      fetchPokemonSpecies(pokemonId, { next: { revalidate: DAY_IN_SECONDS } }),
    ]);
    return {
      flavorText: getEnglishFlavorText(species),
      cryUrl: pokemon.cries.latest,
    };
  } catch {
    // PokeAPI is a third party we don't control — never let it break
    // the product page, just skip the bonus section.
    return { flavorText: null, cryUrl: null };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const { flavorText, cryUrl } = await getPokedexBonus(product.pokemon.id);
  const pokemonName = formatPokemonName(product.pokemon.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={productImageUrl(product.primary_image_path)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
          />
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            {product.pokemon.types.map((type) => (
              <TypeBadge key={type.id} name={type.name} colorHex={type.color_hex} />
            ))}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-brand-navy dark:text-white">
            {product.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {product.article_type.name} · {pokemonName}
          </p>
          <p className="mt-3 text-2xl font-semibold text-brand-navy dark:text-brand-blue">
            {formatPrice(product.price_cents, product.currency)}
          </p>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          <p className="mt-4 rounded-md bg-brand-gold/20 px-3 py-2 text-sm font-medium text-brand-navy dark:text-brand-yellow">
            Includes a {pokemonName} collectible stats card with every order.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <AddToCartButton productId={product.id} />
            <FavoriteButton productId={product.id} />
          </div>

          <PokedexBonus flavorText={flavorText} cryUrl={cryUrl} />
        </div>
      </div>
    </div>
  );
}
