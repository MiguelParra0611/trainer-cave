import type { ArticleType, PokemonType, ProductWithRelations } from "@/types/domain";

export type RawProductRow = {
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
    card_image_path: string | null;
    pokemon_type_map: { pokemon_types: PokemonType }[];
  };
  article_type: ArticleType;
};

/** Shared select string — usable from either the server or browser Supabase client. */
export const PRODUCT_SELECT = `
  id, pokemon_id, article_type_id, name, description, price_cents, currency, primary_image_path, is_active,
  pokemon:pokemon_id (
    id, name, slug, generation_id, sprite_url, pokedex_number,
    hp, attack, defense, special_attack, special_defense, speed, card_image_path,
    pokemon_type_map ( pokemon_types ( id, name, color_hex ) )
  ),
  article_type:article_type_id ( id, slug, name )
`;

export function toProductWithRelations(row: RawProductRow): ProductWithRelations {
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
