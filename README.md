# Trainer Cave

> **Portfolio project — not a real store.** Trainer Cave is a fictional
> e-commerce site built purely to demonstrate full-stack web development
> skills. No real products are sold and no real payments are processed
> anywhere in this app.
>
> Pokémon and all related names, images, and data are trademarks of
> Nintendo, Game Freak, and The Pokémon Company. This project is an
> unofficial fan project, not affiliated with or endorsed by them.
> Pokémon reference data is sourced from the public
> [PokéAPI](https://pokeapi.co/).

## What this is

A Pokémon-themed merch storefront (action figures, crochet plushies,
apparel) with a browsable/filterable catalog, product pages, a
localStorage-backed cart, a simulated checkout flow, user accounts with
favorites, and an admin panel for managing the catalog — built to show
off frontend, backend, database, and external API integration in one
project.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) — frontend and
  backend (Server Components, Route Handlers)
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Supabase](https://supabase.com) — Postgres database, Auth, and
  Storage, with Row Level Security on every table
- [PokéAPI](https://pokeapi.co/) — Pokémon reference data (species,
  types, stats, sprites), synced at seed time; product pages also make
  a live request for Pokédex flavor text and cry audio
- [Vercel](https://vercel.com) — deployment

## Architecture

- **Catalog data** (Pokémon, types, generations, article types,
  products) lives in Supabase Postgres, seeded from PokéAPI plus this
  repo's own product data — see `supabase/seed/`.
- **Cart** is client-side (`localStorage`) for guests; logged-in users
  get it persisted server-side in `cart_items`.
- **Checkout** is entirely simulated — it writes a real `orders` /
  `order_items` row to demonstrate an actual backend write, but no
  payment is ever processed.
- **Admin panel** (`/admin`) lets a promoted admin user manage products
  without touching SQL, gated by Supabase Auth + RLS.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project's URL and anon key (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`). The `SUPABASE_SERVICE_ROLE_KEY` is
   only needed if you plan to run the seed script yourself — grab it
   from your Supabase project's **Settings > API** page. It's never
   used outside `supabase/seed/`.

3. Apply the migrations in `supabase/migrations/` to your Supabase
   project, in order (via the Supabase SQL editor, CLI, or MCP).

4. Seed reference + catalog data:

   ```bash
   npm run seed
   ```

   This pulls Pokémon data from PokéAPI and uploads product images from
   `supabase/seed/images/` (not committed to this repo — see
   `supabase/seed/products.ts` for the product list).

5. Run the dev server:

   ```bash
   npm run dev
   ```

## Deployment

Deployed on Vercel, connected to this repo's `main` branch. Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
Vercel project environment variables — the service role key is never
needed at runtime and should never be added there.
