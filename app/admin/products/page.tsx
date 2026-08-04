import Image from "next/image";
import Link from "next/link";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { getAllProductsForAdmin } from "@/lib/admin-catalog";
import { formatPokemonName, formatPrice } from "@/lib/format";
import { productImageUrl } from "@/lib/storage";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">
          Productos
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-brand-red/90"
        >
          Nuevo Producto
        </Link>
      </div>

      <div className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 py-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={productImageUrl(product.primary_image_path)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {product.name}{" "}
                {!product.is_active && (
                  <span className="ml-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-600">
                    inactivo
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-600">
                {product.article_type.name} · {formatPokemonName(product.pokemon.name)} ·{" "}
                {formatPrice(product.price_cents, product.currency)}
              </p>
            </div>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="text-sm text-brand-red hover:underline"
            >
              Editar
            </Link>
            <ProductRowActions productId={product.id} isActive={product.is_active} />
          </div>
        ))}
      </div>
    </div>
  );
}
