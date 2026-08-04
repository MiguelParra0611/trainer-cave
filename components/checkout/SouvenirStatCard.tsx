"use client";

import { useState } from "react";

const STATS: { key: keyof StatBlock; label: string }[] = [
  { key: "hp", label: "PS" },
  { key: "attack", label: "Ataque" },
  { key: "defense", label: "Defensa" },
  { key: "special_attack", label: "At. Esp." },
  { key: "special_defense", label: "Def. Esp." },
  { key: "speed", label: "Velocidad" },
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
  const [flipped, setFlipped] = useState(false);

  // No artwork yet — a single static card, nothing to flip to.
  if (!cardImageUrl) {
    return (
      <div className="w-full max-w-xs rounded-xl border-2 border-brand-gold bg-white p-4 shadow-sm dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- souvenir card is a small, static-shaped visual; plain img avoids next/image layout ceremony here */}
          <img src={spriteUrl} alt={pokemonName} className="h-16 w-16 object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              Carta Coleccionable
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

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-label={`Voltear la carta coleccionable de ${pokemonName}`}
      className="relative aspect-[5/7] w-full max-w-[240px] cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {/* Front — premium illustration */}
        <div
          className="absolute inset-0 overflow-hidden rounded-xl border-2 border-brand-gold shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- custom per-Pokémon artwork, not one of our own optimizable assets */}
          <img
            src={cardImageUrl}
            alt={pokemonName}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Back — plain, consistent layout: name, then stats in the same order every time */}
        <div
          className="absolute inset-0 overflow-hidden rounded-xl border-2 border-brand-gold bg-white p-4 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spriteUrl} alt="" className="h-16 w-16 object-contain" />
            <h4 className="mt-1 font-semibold capitalize text-brand-navy">{pokemonName}</h4>
          </div>
          <div className="mt-4">
            <StatBars
              stats={stats}
              trackClassName="bg-zinc-100"
              fillClassName="bg-brand-red"
              labelClassName="text-zinc-500"
              valueClassName="text-brand-navy"
            />
          </div>
        </div>
      </div>
    </button>
  );
}
