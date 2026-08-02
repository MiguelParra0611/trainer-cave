-- Per-user data. RLS restricts every table here to its owning user
-- (see 0004_rls_policies.sql).

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false
);

-- Auto-create a profile row whenever a new auth user signs up, so
-- `is_admin` always has a row to promote later (manually, via SQL).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create index order_items_order_id_idx on order_items (order_id);
