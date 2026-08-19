"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProductWithRelations } from "@/types/domain";

type Option = { id: string | number; name: string; slug: string };

// Mirrors the product-images bucket's allowed_mime_types/file_size_limit
// (see supabase/migrations) — validated client-side too so bad uploads are
// rejected with a clear message instead of a raw storage error. SVG is
// deliberately excluded: it can carry embedded script/XSS if ever served
// or opened directly.
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProductForm({
  pokemonOptions,
  articleTypeOptions,
  initialProduct,
}: {
  pokemonOptions: Option[];
  articleTypeOptions: Option[];
  initialProduct?: ProductWithRelations;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [pokemonId, setPokemonId] = useState(String(initialProduct?.pokemon_id ?? pokemonOptions[0]?.id ?? ""));
  const [articleTypeId, setArticleTypeId] = useState(
    String(initialProduct?.article_type_id ?? articleTypeOptions[0]?.id ?? ""),
  );
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [pricePesos, setPricePesos] = useState(
    initialProduct ? String(initialProduct.price_cents / 100) : "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!isEditing && !imageFile) {
      setError("Se requiere una imagen para un producto nuevo.");
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    const pokemon = pokemonOptions.find((p) => String(p.id) === pokemonId);
    const articleType = articleTypeOptions.find((a) => String(a.id) === articleTypeId);
    if (!pokemon || !articleType) {
      setError("Elige un Pokémon y un tipo de artículo.");
      setSubmitting(false);
      return;
    }

    let primaryImagePath = initialProduct?.primary_image_path ?? "";
    if (imageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        setError("La imagen debe ser PNG, JPEG, WEBP o GIF.");
        setSubmitting(false);
        return;
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        setError("La imagen no puede superar 5 MB.");
        setSubmitting(false);
        return;
      }
      const ext = imageFile.name.slice(imageFile.name.lastIndexOf("."));
      const path = `${pokemon.slug}/${articleType.slug}${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }
      primaryImagePath = path;
    }

    const payload = {
      pokemon_id: Number(pokemonId),
      article_type_id: articleTypeId,
      name,
      description,
      price_cents: Math.round(Number(pricePesos) * 100),
      currency: "COP",
      primary_image_path: primaryImagePath,
    };

    const { error: saveError } = isEditing
      ? await supabase.from("products").update(payload).eq("id", initialProduct!.id)
      : await supabase.from("products").insert(payload);

    if (saveError) {
      setError(saveError.message);
      setSubmitting(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="pokemon">
            Pokémon
          </label>
          <select
            id="pokemon"
            value={pokemonId}
            onChange={(e) => setPokemonId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {pokemonOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="articleType">
            Tipo de artículo
          </label>
          <select
            id="articleType"
            value={articleTypeId}
            onChange={(e) => setArticleTypeId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {articleTypeOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="price">
          Precio (COP)
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="1"
          required
          value={pricePesos}
          onChange={(e) => setPricePesos(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="image">
          {isEditing ? "Reemplazar imagen (opcional)" : "Imagen"}
        </label>
        <input
          id="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-red px-6 py-2.5 font-medium text-white hover:bg-brand-red/90 disabled:opacity-70"
      >
        {submitting ? "Guardando…" : isEditing ? "Guardar Cambios" : "Crear Producto"}
      </button>
    </form>
  );
}
