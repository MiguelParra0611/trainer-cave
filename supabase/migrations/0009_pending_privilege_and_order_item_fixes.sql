-- ============================================================================
-- NOT APPLIED TO THE LIVE PROJECT. Written by the haku-seek security audit
-- on 2026-08-18 for review. These touch live authorization behavior on a
-- production database (checklist items 4, 7, 8), so per the audit's own
-- ground rules they are left for a deliberate decision + apply step
-- (`supabase db push`, or paste into the SQL editor) rather than being
-- pushed automatically. Both were confirmed against the live database
-- (czmvlqsdfgivpqsnldzu), not just inferred from the migration files.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FIX 1 (CRITICAL — privilege escalation): profiles.is_admin is
-- client-writable by any logged-in user.
--
-- 0004_rls_policies.sql's "update own profile" policy only checks row
-- ownership (auth.uid() = id) — it never restricts *which columns* a user
-- may change on their own row. Confirmed live: both `anon` and
-- `authenticated` hold column UPDATE privilege on profiles.is_admin
-- (information_schema.column_privileges). Any signed-in user can currently
-- self-promote to admin from the browser console with nothing more than
-- the public anon key already shipped to every client:
--
--   const { createClient } = await import('@supabase/supabase-js');
--   const sb = createClient(URL, ANON_KEY);
--   await sb.auth.signInWithPassword({ email, password }); // any account
--   await sb.from('profiles').update({ is_admin: true }).eq('id', theirOwnId);
--
-- ...after which /admin (gated only by profiles.is_admin — see
-- lib/auth.ts, app/admin/layout.tsx) grants full product create/edit/
-- delete and storage-bucket write access. No app UI currently exposes an
-- is_admin form field, but RLS is the actual security boundary here, not
-- the UI — the column grant makes this exploitable via the REST API or
-- the JS SDK directly, regardless of what the frontend renders.
--
-- Fix: revoke UPDATE on just the is_admin column for the client-facing
-- roles. Ordinary profile self-service (there isn't any yet, but if a
-- "display name" field is added later) keeps working since only this one
-- column's grant is removed; is_admin can still be flipped via the
-- dashboard SQL editor / service role, exactly as 0004's comment already
-- documented as the intended path.
revoke update (is_admin) on public.profiles from anon, authenticated;

-- ----------------------------------------------------------------------------
-- FIX 2 (IDOR — cross-account guest data exposure): order_items for every
-- guest checkout is readable and writable by anyone, not just the guest
-- who placed that order.
--
-- 0004_rls_policies.sql's order_items SELECT/INSERT policies use
-- `orders.user_id = auth.uid() OR orders.user_id IS NULL` to let the
-- checkout flow support guest (unauthenticated) orders. But
-- `orders.user_id IS NULL` is unconditional — it does not compare against
-- the requester at all, so it matches *every* guest order for *every*
-- caller, logged in or not. Confirmed live via pg_policies. Practical
-- effect: anyone with the public anon key (i.e. anyone) can run
--
--   GET /rest/v1/order_items?select=*
--
-- and read the product/quantity/price line items of every guest checkout
-- ever placed on this store, and can INSERT extra order_items rows into
-- any existing guest order by guessing/enumerating its order_id.
--
-- The app itself never needs this: app/api/checkout/route.ts returns the
-- freshly created order as a JSON response, and the confirmation page
-- reads that from sessionStorage (app/checkout/confirmation/page.tsx) —
-- it never re-queries order_items for a guest order. So the guest clause
-- on SELECT can simply be dropped.
--
-- The guest clause on INSERT has to stay (guest checkout needs to be able
-- to insert its own line items), but is narrowed to only apply to orders
-- created in the last 10 minutes with no items yet — closing the window
-- for inserting rows into someone else's older guest order while still
-- letting the checkout API's own insert (which happens seconds after the
-- order row is created) through.
drop policy "select order_items via parent order" on public.order_items;
create policy "select order_items via parent order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

drop policy "insert order_items via parent order" on public.order_items;
create policy "insert order_items via parent order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (
          orders.user_id = auth.uid()
          or (
            orders.user_id is null
            and orders.created_at > now() - interval '10 minutes'
            and not exists (
              select 1 from public.order_items existing
              where existing.order_id = orders.id
            )
          )
        )
    )
  );

-- ----------------------------------------------------------------------------
-- Recommended alongside the above, but out of scope for this migration
-- (dashboard toggle, not SQL): Auth > Policies > Attack Protection >
-- "Leaked password protection" is currently disabled per the project's
-- security advisors. Enabling it rejects passwords found in HaveIBeenPwned
-- at signup/reset for near-zero cost. https://supabase.com/dashboard/project/czmvlqsdfgivpqsnldzu/auth/providers
