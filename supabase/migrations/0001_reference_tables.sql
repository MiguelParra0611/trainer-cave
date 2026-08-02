-- Reference data synced from PokeAPI at seed time. Public read-only;
-- only the seed script (service role) ever writes to these.

create table generations (
  id integer primary key,
  name text not null unique,
  display_name text not null
);

create table pokemon_types (
  id integer primary key,
  name text not null unique,
  color_hex text
);

create table pokemon (
  id integer primary key,
  name text not null,
  slug text not null unique,
  generation_id integer not null references generations (id),
  sprite_url text not null,
  pokedex_number integer not null,
  hp integer not null,
  attack integer not null,
  defense integer not null,
  special_attack integer not null,
  special_defense integer not null,
  speed integer not null,
  created_at timestamptz not null default now()
);

create index pokemon_generation_id_idx on pokemon (generation_id);

create table pokemon_type_map (
  pokemon_id integer not null references pokemon (id) on delete cascade,
  type_id integer not null references pokemon_types (id) on delete cascade,
  primary key (pokemon_id, type_id)
);

create index pokemon_type_map_type_id_idx on pokemon_type_map (type_id);
