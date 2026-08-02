-- Public buckets already bypass RLS for direct object GET by URL
-- (Supabase docs: "Public buckets... effectively bypass access
-- controls for retrieving and serving files"). The broad SELECT
-- policy below was only enabling bucket *listing*, which the app
-- never needs (it only builds direct public URLs) — drop it per the
-- security advisor's "Public Bucket Allows Listing" warning.
drop policy "public read product-images" on storage.objects;

-- handle_new_user is a trigger-only function (fires on auth.users
-- insert); it references the trigger-only NEW record and was never
-- meant to be invoked directly. Revoke the default PostgREST RPC
-- exposure per the security advisor's SECURITY DEFINER warning.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_admin() is intentionally left executable by anon/authenticated:
-- RLS policies on products/article_types call it, and policy
-- evaluation runs as the querying role, so revoking EXECUTE here
-- would break every catalog read. It only reveals whether the caller
-- is an admin, which isn't sensitive.
