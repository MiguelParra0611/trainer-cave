import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT_SELECT,
  toProductWithRelations,
  type RawProductRow,
} from "@/lib/product-select";
import type { Pokemon } from "@/types/domain";

/** Admin-only: includes inactive products too (RLS allows this only for is_admin()). */
export async function getAllProductsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name")
    .returns<RawProductRow[]>();

  if (error) throw error;
  return (data ?? []).map(toProductWithRelations);
}

export async function getProductByIdForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .returns<RawProductRow[]>()
    .maybeSingle();

  if (error) throw error;
  return data ? toProductWithRelations(data) : null;
}

export async function getPokemonOptions(): Promise<Pick<Pokemon, "id" | "name" | "slug">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pokemon")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getArticleTypeOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_types")
    .select("id, slug, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
