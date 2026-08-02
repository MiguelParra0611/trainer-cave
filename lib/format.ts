export function formatPrice(cents: number, currency = "USD") {
  // COP is conventionally displayed as whole pesos, e.g. "$60.000".
  const locale = currency === "COP" ? "es-CO" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(cents / 100);
}

/** "giratina-altered" -> "Giratina Altered" (reads as the real Forme name for Giratina). */
export function formatPokemonName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
