import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCatalogData } from "@/lib/catalog";
import { productImageUrl } from "@/lib/storage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; gen?: string; article?: string }>;
}) {
  const params = await searchParams;
  const { products, types, generations, articleTypes } = await getCatalogData(
    params,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl tracking-wide text-brand-navy dark:text-white">
        Trainer <span className="text-brand-blue">Cave</span>
      </h1>
      <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
        Fictional Pokémon merch, made for portfolio purposes only. Nothing
        here is actually for sale.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <CatalogFilters
            types={types}
            generations={generations}
            articleTypes={articleTypes}
          />
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              No products match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      </div>
    </div>
  );
}
