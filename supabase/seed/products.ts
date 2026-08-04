/**
 * Product catalog data. `pokemonSlug` must match a slug produced by the
 * reference seed pass (PokeAPI name, kebab-cased). `imageFile` is a
 * filename under supabase/seed/images/, uploaded to the product-images
 * Storage bucket at `{pokemonSlug}/{articleTypeSlug}.jpg`.
 */

export type ArticleTypeSeed = {
  slug: string;
  name: string;
};

export const ARTICLE_TYPES: ArticleTypeSeed[] = [
  { slug: "action-figure", name: "Figura de Acción" },
  { slug: "crochet-plush", name: "Peluche a Crochet" },
  { slug: "t-shirt", name: "Camiseta" },
  { slug: "hoodie", name: "Hoodie" },
  { slug: "cap", name: "Gorra" },
];

export type ProductSeed = {
  pokemonSlug: string;
  articleTypeSlug: string;
  name: string;
  description: string;
  priceCents: number;
  imageFile: string;
};

/** All prices are in Colombian Pesos (COP). */
export const CURRENCY = "COP";

const PRICE_COP: Record<string, number> = {
  cap: 60_000,
  "t-shirt": 75_000,
  hoodie: 120_000,
  "action-figure": 50_000,
  "crochet-plush": 120_000,
};

const DESCRIPTION_TEMPLATE: Record<string, (name: string) => string> = {
  cap: (name) =>
    `Gorra de ${name} en tela, bordado minimalista y pin metálico decorativo al costado.`,
  "t-shirt": (name) =>
    `Camiseta streetwear de ${name} en algodón, diseño frontal minimalista y diseño elaborado en la espalda. Oversize.`,
  hoodie: (name) =>
    `Hoodie tipo streetwear de ${name} en algodón premium, diseño frontal minimalista y diseño elaborado en la espalda. Oversize.`,
  "action-figure": (name) =>
    `Figura de acción de ${name}, súper detallada y de buena calidad.`,
  "crochet-plush": (name) =>
    `Peluche de ${name} tejido en crochet, ultradetallado, de buena calidad.`,
};

const ARTICLE_TYPE_NAMES: Record<string, string> = Object.fromEntries(
  ARTICLE_TYPES.map((a) => [a.slug, a.name]),
);

type CatalogEntry = {
  slug: string;
  displayName: string;
  articleTypes: string[];
};

// One entry per curated Pokemon, matching the images actually
// delivered in supabase/seed/images/ (action figure + crochet plush
// for everyone, plus exactly one clothing item each).
const CATALOG: CatalogEntry[] = [
  { slug: "psyduck", displayName: "Psyduck", articleTypes: ["action-figure", "crochet-plush", "hoodie"] },
  { slug: "gengar", displayName: "Gengar", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "eevee", displayName: "Eevee", articleTypes: ["action-figure", "crochet-plush", "cap"] },
  { slug: "articuno", displayName: "Articuno", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "cyndaquil", displayName: "Cyndaquil", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "aipom", displayName: "Aipom", articleTypes: ["action-figure", "crochet-plush", "hoodie"] },
  { slug: "entei", displayName: "Entei", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "celebi", displayName: "Celebi", articleTypes: ["action-figure", "crochet-plush", "cap"] },
  { slug: "ludicolo", displayName: "Ludicolo", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "tropius", displayName: "Tropius", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "metagross", displayName: "Metagross", articleTypes: ["action-figure", "crochet-plush", "cap"] },
  { slug: "rayquaza", displayName: "Rayquaza", articleTypes: ["action-figure", "crochet-plush", "hoodie"] },
  { slug: "piplup", displayName: "Piplup", articleTypes: ["action-figure", "crochet-plush", "hoodie"] },
  { slug: "buizel", displayName: "Buizel", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "lucario", displayName: "Lucario", articleTypes: ["action-figure", "crochet-plush", "t-shirt"] },
  { slug: "giratina-altered", displayName: "Giratina", articleTypes: ["action-figure", "crochet-plush", "cap"] },
];

export const PRODUCTS: ProductSeed[] = CATALOG.flatMap((pokemon) =>
  pokemon.articleTypes.map((articleTypeSlug) => ({
    pokemonSlug: pokemon.slug,
    articleTypeSlug,
    name: `${ARTICLE_TYPE_NAMES[articleTypeSlug]} de ${pokemon.displayName}`,
    description: DESCRIPTION_TEMPLATE[articleTypeSlug](pokemon.displayName),
    priceCents: PRICE_COP[articleTypeSlug] * 100,
    imageFile: `${pokemon.slug}-${articleTypeSlug}.png`,
  })),
);
