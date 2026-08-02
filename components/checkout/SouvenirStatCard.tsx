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

export function SouvenirStatCard({
  pokemonName,
  spriteUrl,
  stats,
}: {
  pokemonName: string;
  spriteUrl: string;
  stats: StatBlock;
}) {
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
      <dl className="mt-4 space-y-1.5">
        {STATS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <dt className="w-16 shrink-0 text-zinc-500 dark:text-zinc-600">{label}</dt>
            <dd className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-1.5 rounded-full bg-brand-blue"
                  style={{
                    width: `${Math.min(100, (stats[key] / MAX_STAT) * 100)}%`,
                  }}
                />
              </div>
            </dd>
            <dd className="w-6 shrink-0 text-right font-medium text-brand-navy">
              {stats[key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
