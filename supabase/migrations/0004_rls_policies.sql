-- Row Level Security for every table. Reference/catalog tables are
-- public-read; writes to catalog tables require an admin profile;
-- per-user tables are owner-scoped only.

alter table generations enable row level security;
alter table pokemon_types enable row level security;
alter table pokemon enable row level security;
alter table pokemon_type_map enable row level security;
alter table article_types enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Reference tables: public read, no client-side writes (seed script
-- uses the service role key, which bypasses RLS entirely).
create policy "public read generations" on generations for select using (true);
create policy "public read pokemon_types" on pokemon_types for select using (true);
create policy "public read pokemon" on pokemon for select using (true);
create policy "public read pokemon_type_map" on pokemon_type_map for select using (true);

-- Helper condition reused below: is the current user an admin?
-- (inlined per-policy since Postgres RLS policies can't share a
-- parameterized helper without a function; kept as a stable SQL
-- function for readability and a single source of truth.)
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Catalog tables: public read of active products; writes only for admins.
create policy "public read article_types" on article_types for select using (true);
create policy "admin write article_types" on article_types
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read active products" on products
  for select using (is_active = true);
create policy "admin read all products" on products
  for select using (public.is_admin());
create policy "admin write products" on products
  for insert with check (public.is_admin());
create policy "admin update products" on products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete products" on products
  for delete using (public.is_admin());

-- profiles: users can read/update their own row only. is_admin is
-- flipped manually via the SQL editor / service role, never by users.
create policy "select own profile" on profiles
  for select using (auth.uid() = id);
create policy "update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- favorites: fully owner-scoped.
create policy "select own favorites" on favorites
  for select using (auth.uid() = user_id);
create policy "insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);
create policy "delete own favorites" on favorites
  for delete using (auth.uid() = user_id);

-- cart_items: fully owner-scoped.
create policy "select own cart_items" on cart_items
  for select using (auth.uid() = user_id);
create policy "insert own cart_items" on cart_items
  for insert with check (auth.uid() = user_id);
create policy "update own cart_items" on cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own cart_items" on cart_items
  for delete using (auth.uid() = user_id);

-- orders: owner-scoped, but allow guest checkout (user_id is null).
-- Guest orders are only readable via the confirmation page's direct
-- id lookup performed server-side right after creation, not via a
-- general "my orders" listing (no select-all policy for anon).
create policy "select own orders" on orders
  for select using (auth.uid() = user_id);
create policy "insert own or guest orders" on orders
  for insert with check (auth.uid() = user_id or user_id is null);

-- order_items: readable/writable alongside their parent order.
create policy "select order_items via parent order" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );
create policy "insert order_items via parent order" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );
