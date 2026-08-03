/**
 * Seeds Supabase from PokeAPI (reference data) and from local
 * products.ts + images/ (catalog data). Idempotent — safe to re-run.
 *
 * Usage: npm run seed   (reads .env.local for Supabase credentials)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "../../lib/supabase/admin";
import {
  fetchPokemon,
  fetchPokemonSpecies,
  parseIdFromUrl,
} from "../../lib/pokeapi";
import { CURATED_POKEMON_IDS } from "./curated-pokemon";
import { TYPE_COLORS } from "./type-colors";
import { ARTICLE_TYPES, CURRENCY, PRODUCTS } from "./products";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// Only the generations actually used by the curated catalog (I-IV).
const GENERATIONS = [
  { id: 1, name: "generation-i", display_name: "Generation I – Kanto" },
  { id: 2, name: "generation-ii", display_name: "Generation II – Johto" },
  { id: 3, name: "generation-iii", display_name: "Generation III – Hoenn" },
  { id: 4, name: "generation-iv", display_name: "Generation IV – Sinnoh" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function statValue(
  stats: { base_stat: number; stat: { name: string } }[],
  name: string,
): number {
  const stat = stats.find((s) => s.stat.name === name);
  if (!stat) throw new Error(`Missing stat "${name}"`);
  return stat.base_stat;
}

async function seedGenerations(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.from("generations").upsert(GENERATIONS);
  if (error) throw error;
  console.log(`Seeded ${GENERATIONS.length} generations.`);
}

async function seedTypes(supabase: ReturnType<typeof createAdminClient>) {
  const res = await fetch("https://pokeapi.co/api/v2/type?limit=30");
  const body = (await res.json()) as { results: { name: string; url: string }[] };

  const rows = body.results
    .filter((t) => t.name in TYPE_COLORS)
    .map((t) => ({
      id: parseIdFromUrl(t.url),
      name: t.name,
      color_hex: TYPE_COLORS[t.name],
    }));

  const { error } = await supabase.from("pokemon_types").upsert(rows);
  if (error) throw error;
  console.log(`Seeded ${rows.length} pokemon types.`);
}

async function seedPokemon(supabase: ReturnType<typeof createAdminClient>) {
  for (const id of CURATED_POKEMON_IDS) {
    const [pokemon, species] = await Promise.all([
      fetchPokemon(id),
      fetchPokemonSpecies(id),
    ]);

    const spriteUrl = pokemon.sprites.other["official-artwork"].front_default;
    if (!spriteUrl) throw new Error(`No official artwork sprite for #${id}`);

    const { error: pokemonError } = await supabase.from("pokemon").upsert({
      id: pokemon.id,
      name: pokemon.name,
      slug: pokemon.name,
      generation_id: parseIdFromUrl(species.generation.url),
      sprite_url: spriteUrl,
      pokedex_number: species.id,
      hp: statValue(pokemon.stats, "hp"),
      attack: statValue(pokemon.stats, "attack"),
      defense: statValue(pokemon.stats, "defense"),
      special_attack: statValue(pokemon.stats, "special-attack"),
      special_defense: statValue(pokemon.stats, "special-defense"),
      speed: statValue(pokemon.stats, "speed"),
    });
    if (pokemonError) throw pokemonError;

    const { error: deleteError } = await supabase
      .from("pokemon_type_map")
      .delete()
      .eq("pokemon_id", pokemon.id);
    if (deleteError) throw deleteError;

    const { error: typeMapError } = await supabase
      .from("pokemon_type_map")
      .insert(
        pokemon.types.map((t) => ({
          pokemon_id: pokemon.id,
          type_id: parseIdFromUrl(t.type.url),
        })),
      );
    if (typeMapError) throw typeMapError;

    console.log(`Seeded pokemon: ${pokemon.name} (#${pokemon.id})`);
    await sleep(75);
  }
}

async function seedArticleTypes(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase
    .from("article_types")
    .upsert(ARTICLE_TYPES, { onConflict: "slug" });
  if (error) throw error;
  console.log(`Seeded ${ARTICLE_TYPES.length} article types.`);
}

async function seedProducts(supabase: ReturnType<typeof createAdminClient>) {
  if (PRODUCTS.length === 0) {
    console.log("No products in supabase/seed/products.ts yet — skipping.");
    return;
  }

  for (const product of PRODUCTS) {
    const { data: pokemon, error: pokemonError } = await supabase
      .from("pokemon")
      .select("id")
      .eq("slug", product.pokemonSlug)
      .single();
    if (pokemonError || !pokemon) {
      throw new Error(
        `Unknown pokemonSlug "${product.pokemonSlug}" — run the reference seed first.`,
      );
    }

    const { data: articleType, error: articleTypeError } = await supabase
      .from("article_types")
      .select("id")
      .eq("slug", product.articleTypeSlug)
      .single();
    if (articleTypeError || !articleType) {
      throw new Error(`Unknown articleTypeSlug "${product.articleTypeSlug}"`);
    }

    const ext = path.extname(product.imageFile).toLowerCase();
    const imagePath = `${product.pokemonSlug}/${product.articleTypeSlug}${ext}`;
    const imageBuffer = await readFile(
      path.join(__dirname, "images", product.imageFile),
    );
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(imagePath, imageBuffer, {
        contentType: CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream",
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { error: productError } = await supabase.from("products").upsert(
      {
        pokemon_id: pokemon.id,
        article_type_id: articleType.id,
        name: product.name,
        description: product.description,
        price_cents: product.priceCents,
        currency: CURRENCY,
        primary_image_path: imagePath,
      },
      { onConflict: "pokemon_id,article_type_id" },
    );
    if (productError) throw productError;

    console.log(`Seeded product: ${product.name}`);
  }
}

async function main() {
  const supabase = createAdminClient();

  await seedGenerations(supabase);
  await seedTypes(supabase);
  await seedPokemon(supabase);
  await seedArticleTypes(supabase);
  await seedProducts(supabase);

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
