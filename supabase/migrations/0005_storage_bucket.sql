-- product-images bucket: public read (product photos are marketing
-- assets, not sensitive), writes restricted to admins. The seed
-- script uses the service role key, which bypasses these policies.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "admin write product-images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.is_admin()
  );

create policy "admin update product-images" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.is_admin()
  ) with check (
    bucket_id = 'product-images' and public.is_admin()
  );

create policy "admin delete product-images" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.is_admin()
  );
