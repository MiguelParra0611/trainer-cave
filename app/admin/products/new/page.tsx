import { ProductForm } from "@/components/admin/ProductForm";
import { getArticleTypeOptions, getPokemonOptions } from "@/lib/admin-catalog";

export default async function NewProductPage() {
  const [pokemonOptions, articleTypeOptions] = await Promise.all([
    getPokemonOptions(),
    getArticleTypeOptions(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy dark:text-white">
        New Product
      </h1>
      <div className="mt-6 max-w-lg">
        <ProductForm pokemonOptions={pokemonOptions} articleTypeOptions={articleTypeOptions} />
      </div>
    </div>
  );
}
