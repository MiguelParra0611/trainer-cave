import { redirect } from "next/navigation";
import { FavoritesGrid } from "@/components/favorites/FavoritesGrid";
import { getCurrentUser } from "@/lib/auth";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(`product:product_id ( ${PRODUCT_SELECT} )`)
    .eq("user_id", user.id)
    .returns<{ product: RawProductRow }[]>();

  if (error) throw error;

  const items = (data ?? []).map((row) => {
    const product = toProductWithRelations(row.product);
    return { product, imageUrl: productImageUrl(product.primary_image_path) };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">
        Favorites
      </h1>

      <FavoritesGrid items={items} />
    </div>
  );
}
