import { createClient } from "@/lib/supabase/server";
import type {
  ArticleType,
  Generation,
  PokemonType,
  ProductWithRelations,
} from "@/types/domain";

type RawProductRow = {
  id: string;
  pokemon_id: number;
  article_type_id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  primary_image_path: string;
  is_active: boolean;
  pokemon: {
    id: number;
    name: string;
    slug: string;
    generation_id: number;
    sprite_url: string;
    pokedex_number: number;
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    pokemon_type_map: { pokemon_types: PokemonType }[];
  };
  article_type: ArticleType;
};

const PRODUCT_SELECT = `
  id, pokemon_id, article_type_id, name, description, price_cents, currency, primary_image_path, is_active,
  pokemon:pokemon_id (
    id, name, slug, generation_id, sprite_url, pokedex_number,
    hp, attack, defense, special_attack, special_defense, speed,
    pokemon_type_map ( pokemon_types ( id, name, color_hex ) )
  ),
  article_type:article_type_id ( id, slug, name )
`;

function toProductWithRelations(row: RawProductRow): ProductWithRelations {
  const { pokemon, ...product } = row;
  const { pokemon_type_map, ...pokemonFields } = pokemon;
  return {
    ...product,
    pokemon: {
      ...pokemonFields,
      types: pokemon_type_map.map((t) => t.pokemon_types),
    },
    article_type: row.article_type,
  };
}

export type CatalogFilterParams = {
  type?: string;
  gen?: string;
  article?: string;
};

export async function getCatalogData(filters: CatalogFilterParams = {}) {
  const supabase = await createClient();

  const [productsRes, typesRes, generationsRes, articleTypesRes] =
    await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true)
        .returns<RawProductRow[]>(),
      supabase.from("pokemon_types").select("*").order("name"),
      supabase.from("generations").select("*").order("id"),
      supabase.from("article_types").select("*").order("name"),
    ]);

  if (productsRes.error) throw productsRes.error;
  if (typesRes.error) throw typesRes.error;
  if (generationsRes.error) throw generationsRes.error;
  if (articleTypesRes.error) throw articleTypesRes.error;

  let products = (productsRes.data ?? []).map(toProductWithRelations);

  if (filters.type) {
    products = products.filter((p) =>
      p.pokemon.types.some((t) => t.name === filters.type),
    );
  }
  if (filters.gen) {
    const genId = Number(filters.gen);
    products = products.filter((p) => p.pokemon.generation_id === genId);
  }
  if (filters.article) {
    products = products.filter((p) => p.article_type.slug === filters.article);
  }

  return {
    products,
    types: (typesRes.data ?? []) as PokemonType[],
    generations: (generationsRes.data ?? []) as Generation[],
    articleTypes: (articleTypesRes.data ?? []) as ArticleType[],
  };
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .returns<RawProductRow[]>()
    .maybeSingle();

  if (error) throw error;
  return data ? toProductWithRelations(data) : null;
}
