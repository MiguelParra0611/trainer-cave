"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleType, Generation, PokemonType } from "@/types/domain";

function FilterGroup({
  label,
  paramKey,
  options,
  activeValue,
  onChange,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  activeValue: string | null;
  onChange: (paramKey: string, value: string | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(paramKey, null)}
          className={`rounded-full border px-3 py-1 text-xs ${
            activeValue === null
              ? "border-brand-red bg-brand-red text-white"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(paramKey, option.value)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              activeValue === option.value
                ? "border-brand-red bg-brand-red text-white"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CatalogFilters({
  types,
  generations,
  articleTypes,
}: {
  types: PokemonType[];
  generations: Generation[];
  articleTypes: ArticleType[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(paramKey: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <FilterGroup
        label="Type"
        paramKey="type"
        activeValue={searchParams.get("type")}
        onChange={handleChange}
        options={types.map((t) => ({ value: t.name, label: t.name }))}
      />
      <FilterGroup
        label="Generation"
        paramKey="gen"
        activeValue={searchParams.get("gen")}
        onChange={handleChange}
        options={generations.map((g) => ({
          value: String(g.id),
          label: g.display_name,
        }))}
      />
      <FilterGroup
        label="Article"
        paramKey="article"
        activeValue={searchParams.get("article")}
        onChange={handleChange}
        options={articleTypes.map((a) => ({ value: a.slug, label: a.name }))}
      />
    </div>
  );
}
