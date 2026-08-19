-- Login rate limiting, enforced entirely in Postgres.
--
-- LoginForm.tsx calls supabase.auth.signInWithPassword() directly from
-- the client (no server action / route handler in front of it), so
-- there's no "our server" request path to hang rate limiting off of.
-- Instead the client calls these SECURITY DEFINER RPCs immediately
-- before and after signInWithPassword: check_login_rate_limit() first
-- (raises if the email is currently locked out), then
-- record_login_failure()/record_login_success() depending on the
-- auth result.
--
-- login_attempts itself is never exposed to anon/authenticated: the
-- public schema's default privileges grant them ALL on new tables, so
-- that access is explicitly revoked below and replaced with EXECUTE
-- on just these three functions. That keeps any single caller from
-- reading or forging another email's attempt history via the REST
-- API, and from resetting their own lockout by deleting the row
-- directly.
create table login_attempts (
  email text primary key,
  attempt_count integer not null default 1,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

alter table login_attempts enable row level security;
-- No policies: this table is only ever touched by the SECURITY
-- DEFINER functions below, which run as the table owner and bypass
-- RLS. Enabling RLS with zero policies is belt-and-suspenders in case
-- the grant revocation below is ever loosened by mistake.

revoke all on public.login_attempts from public, anon, authenticated;

-- Raises if p_email is currently locked out; no-op otherwise. Silent
-- on unlocked/unknown emails so it never reveals whether an account
-- exists — the same generic error is shown by the client regardless
-- of the exception message.
create function public.check_login_rate_limit(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_locked_until timestamptz;
begin
  if v_email = '' then
    return;
  end if;

  select locked_until into v_locked_until
  from public.login_attempts
  where email = v_email;

  if v_locked_until is not null and v_locked_until > now() then
    raise exception 'Too many login attempts. Please try again later.';
  end if;
end;
$$;

-- Records a failed login for p_email. Attempts are counted in a
-- rolling 15-minute window from the first failure; 5 failures within
-- that window locks the email out for 15 minutes. A failure after the
-- window has elapsed starts a fresh window instead of extending the
-- old one.
create function public.record_login_failure(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_max_attempts constant integer := 5;
  v_window constant interval := interval '15 minutes';
  v_lockout constant interval := interval '15 minutes';
  v_row public.login_attempts%rowtype;
begin
  if v_email = '' then
    return;
  end if;

  select * into v_row
  from public.login_attempts
  where email = v_email
  for update;

  if not found then
    insert into public.login_attempts (email, attempt_count, first_attempt_at, locked_until)
    values (v_email, 1, now(), null);
    return;
  end if;

  if v_row.first_attempt_at < now() - v_window then
    update public.login_attempts
      set attempt_count = 1, first_attempt_at = now(), locked_until = null
      where email = v_email;
    return;
  end if;

  if v_row.attempt_count + 1 >= v_max_attempts then
    update public.login_attempts
      set attempt_count = attempt_count + 1, locked_until = now() + v_lockout
      where email = v_email;
  else
    update public.login_attempts
      set attempt_count = attempt_count + 1
      where email = v_email;
  end if;
end;
$$;

-- Clears p_email's attempt history on a successful login.
create function public.record_login_success(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  delete from public.login_attempts where email = v_email;
end;
$$;

grant execute on function public.check_login_rate_limit(text) to anon, authenticated;
grant execute on function public.record_login_failure(text) to anon, authenticated;
grant execute on function public.record_login_success(text) to anon, authenticated;
