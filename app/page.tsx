import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ScrollToCatalog } from "@/components/catalog/ScrollToCatalog";
import { Hero } from "@/components/home/Hero";
import { getCatalogData } from "@/lib/catalog";
import { productImageUrl } from "@/lib/storage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; gen?: string; article?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { products, types, generations, articleTypes } = await getCatalogData(
    params,
  );

  return (
    <div>
      <Suspense fallback={null}>
        <ScrollToCatalog />
      </Suspense>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-center font-heading text-4xl font-extrabold text-brand-navy sm:text-left">
          <span className="uppercase tracking-wide">Trainer</span>{" "}
          <span className="uppercase text-brand-blue tracking-wide">Cave</span>
        </h1>
        <p className="mt-2 text-center text-zinc-600 dark:text-zinc-600 sm:max-w-xl sm:text-left">
          Merch ficticio de Pokémon, hecho solo con fines de portafolio. Nada
          aquí está realmente a la venta.
        </p>

        <div id="catalogo" className="mt-8 grid scroll-mt-6 grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <aside>
            <CatalogFilters
              types={types}
              generations={generations}
              articleTypes={articleTypes}
            />
          </aside>

          <div>
            {params.q && (
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-600">
                Resultados para <span className="font-medium text-brand-navy">&quot;{params.q}&quot;</span>
              </p>
            )}
            {products.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-600">
                Ningún producto coincide con estos filtros.
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
    </div>
  );
}
