/** Official Spanish Pokémon type names, for display only — the English
 * `name` from PokeAPI stays as the underlying value (filter query params,
 * DB rows), this is purely a UI label lookup. */
const TYPE_LABELS_ES: Record<string, string> = {
  normal: "Normal",
  fighting: "Lucha",
  flying: "Volador",
  poison: "Veneno",
  ground: "Tierra",
  rock: "Roca",
  bug: "Bicho",
  ghost: "Fantasma",
  steel: "Acero",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  psychic: "Psíquico",
  ice: "Hielo",
  dragon: "Dragón",
  dark: "Siniestro",
  fairy: "Hada",
};

export function translateType(name: string) {
  return TYPE_LABELS_ES[name] ?? name;
}
