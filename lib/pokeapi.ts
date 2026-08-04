const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export type PokeApiType = {
  slot: number;
  type: { name: string; url: string };
};

export type PokeApiStat = {
  base_stat: number;
  stat: { name: string };
};

export type PokeApiPokemon = {
  id: number;
  name: string;
  types: PokeApiType[];
  stats: PokeApiStat[];
  sprites: {
    other: {
      "official-artwork": { front_default: string | null };
    };
  };
  cries: { latest: string | null; legacy: string | null };
};

export type PokeApiSpecies = {
  id: number;
  generation: { name: string; url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
};

async function pokeApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${POKEAPI_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`PokeAPI request failed: ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchPokemon(id: number, init?: RequestInit) {
  return pokeApiFetch<PokeApiPokemon>(`/pokemon/${id}`, init);
}

export function fetchPokemonSpecies(id: number, init?: RequestInit) {
  return pokeApiFetch<PokeApiSpecies>(`/pokemon-species/${id}`, init);
}

/** Parses the trailing numeric id out of a PokeAPI resource URL, e.g. ".../generation/1/" -> 1 */
export function parseIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) throw new Error(`Could not parse id from PokeAPI url: ${url}`);
  return Number(match[1]);
}

/**
 * Live runtime lookup used by the product detail page: a Spanish
 * Pokedex flavor text entry, cached for 24h via Next.js fetch caching
 * by the caller (this function is just the network call).
 */
export function getSpanishFlavorText(species: PokeApiSpecies): string | null {
  const entry = species.flavor_text_entries.find(
    (e) => e.language.name === "es",
  );
  return entry ? entry.flavor_text.replace(/[\n\f­]/g, " ") : null;
}
