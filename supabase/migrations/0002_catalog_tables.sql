-- Catalog data curated by the site admin. Public read (active products
-- only); writes come either from the seed script (service role) or from
-- the admin panel (RLS-gated, see 0004_rls_policies.sql).

create table article_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  pokemon_id integer not null references pokemon (id),
  article_type_id uuid not null references article_types (id),
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  primary_image_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (pokemon_id, article_type_id)
);

create index products_pokemon_id_idx on products (pokemon_id);
create index products_article_type_id_idx on products (article_type_id);
create index products_is_active_idx on products (is_active);
