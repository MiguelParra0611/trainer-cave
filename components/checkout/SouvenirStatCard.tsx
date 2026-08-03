const STATS: { key: keyof StatBlock; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Attack" },
  { key: "defense", label: "Defense" },
  { key: "special_attack", label: "Sp. Atk" },
  { key: "special_defense", label: "Sp. Def" },
  { key: "speed", label: "Speed" },
];

const MAX_STAT = 255;

type StatBlock = {
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
};

function StatBars({
  stats,
  trackClassName,
  fillClassName,
  labelClassName,
  valueClassName,
}: {
  stats: StatBlock;
  trackClassName: string;
  fillClassName: string;
  labelClassName: string;
  valueClassName: string;
}) {
  return (
    <dl className="space-y-1.5">
      {STATS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2 text-xs">
          <dt className={`w-14 shrink-0 ${labelClassName}`}>{label}</dt>
          <dd className="flex-1">
            <div className={`h-1.5 w-full rounded-full ${trackClassName}`}>
              <div
                className={`h-1.5 rounded-full ${fillClassName}`}
                style={{
                  width: `${Math.min(100, (stats[key] / MAX_STAT) * 100)}%`,
                }}
              />
            </div>
          </dd>
          <dd className={`w-6 shrink-0 text-right font-medium ${valueClassName}`}>
            {stats[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SouvenirStatCard({
  pokemonName,
  spriteUrl,
  cardImageUrl,
  stats,
}: {
  pokemonName: string;
  spriteUrl: string;
  cardImageUrl?: string | null;
  stats: StatBlock;
}) {
  if (cardImageUrl) {
    return (
      <div className="relative aspect-[5/7] w-full max-w-[240px] overflow-hidden rounded-xl border-2 border-brand-gold shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element -- custom per-Pokémon artwork, not one of our own optimizable assets */}
        <img
          src={cardImageUrl}
          alt={pokemonName}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3 pb-3 pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-gold">
            Collectible Card
          </p>
          <h4 className="mb-2 font-semibold capitalize text-white">{pokemonName}</h4>
          <StatBars
            stats={stats}
            trackClassName="bg-white/20"
            fillClassName="bg-brand-gold"
            labelClassName="text-white/70"
            valueClassName="text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs rounded-xl border-2 border-brand-gold bg-white p-4 shadow-sm dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- souvenir card is a small, static-shaped visual; plain img avoids next/image layout ceremony here */}
        <img src={spriteUrl} alt={pokemonName} className="h-16 w-16 object-contain" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
            Collectible Card
          </p>
          <h4 className="font-semibold capitalize text-brand-navy">
            {pokemonName}
          </h4>
        </div>
      </div>
      <div className="mt-4">
        <StatBars
          stats={stats}
          trackClassName="bg-zinc-100 dark:bg-zinc-800"
          fillClassName="bg-brand-blue"
          labelClassName="text-zinc-500 dark:text-zinc-600"
          valueClassName="text-brand-navy"
        />
      </div>
    </div>
  );
}
