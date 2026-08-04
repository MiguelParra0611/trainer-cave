export function PokedexBonus({
  flavorText,
  cryUrl,
}: {
  flavorText: string | null;
  cryUrl: string | null;
}) {
  if (!flavorText && !cryUrl) return null;

  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
        Entrada de la Pokédex
      </p>
      {flavorText && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-600">
          {flavorText}
        </p>
      )}
      {cryUrl && (
        <div className="mt-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- a short game sound effect, not spoken content */}
          <audio controls src={cryUrl} className="h-8 w-full max-w-xs" />
        </div>
      )}
      <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
        En vivo desde PokéAPI
      </p>
    </div>
  );
}
