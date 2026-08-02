import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
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

  const products = (data ?? []).map((row) => toProductWithRelations(row.product));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy dark:text-white">
        Favorites
      </h1>

      {products.length === 0 ? (
        <p className="mt-4 text-zinc-500 dark:text-zinc-400">
          No favorites yet.{" "}
          <Link href="/" className="text-brand-navy underline dark:text-brand-blue">
            Browse the catalog
          </Link>{" "}
          and tap the heart on a product.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageUrl={productImageUrl(product.primary_image_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
