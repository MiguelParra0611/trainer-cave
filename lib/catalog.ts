import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SELECT,
  toProductWithRelations,
  type RawProductRow,
} from "@/lib/product-select";
import type { ArticleType, Generation, PokemonType } from "@/types/domain";

export type CatalogFilterParams = {
  type?: string;
  gen?: string;
  article?: string;
  q?: string;
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
  if (filters.q) {
    const query = filters.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.pokemon.name.toLowerCase().includes(query),
    );
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
