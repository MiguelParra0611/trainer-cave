export type Generation = {
  id: number;
  name: string;
  display_name: string;
};

export type PokemonType = {
  id: number;
  name: string;
  color_hex: string | null;
};

export type Pokemon = {
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
};

export type PokemonWithTypes = Pokemon & {
  types: PokemonType[];
};

export type ArticleType = {
  id: string;
  slug: string;
  name: string;
};

export type Product = {
  id: string;
  pokemon_id: number;
  article_type_id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  primary_image_path: string;
  is_active: boolean;
};

export type ProductWithRelations = Product & {
  pokemon: PokemonWithTypes;
  article_type: ArticleType;
};

export type CartItem = {
  productId: string;
  quantity: number;
};
