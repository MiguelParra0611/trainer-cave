import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  getArticleTypeOptions,
  getPokemonOptions,
  getProductByIdForAdmin,
} from "@/lib/admin-catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, pokemonOptions, articleTypeOptions] = await Promise.all([
    getProductByIdForAdmin(id),
    getPokemonOptions(),
    getArticleTypeOptions(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">
        Editar Producto
      </h1>
      <div className="mt-6 max-w-lg">
        <ProductForm
          pokemonOptions={pokemonOptions}
          articleTypeOptions={articleTypeOptions}
          initialProduct={product}
        />
      </div>
    </div>
  );
}
