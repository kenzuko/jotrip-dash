-- JoTrip Operations - Auth & RBAC foundation
-- Production target: Supabase Auth + Postgres RLS.
-- Weather/Airport remain read-only upstreams and are NOT stored or mutated here.

create schema if not exists private;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'viewer' check (role in ('admin','ops','sales','guide','data','viewer','partner')),
  status text not null default 'active' check (status in ('active','disabled')),
  scope jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);

create or replace function private.is_active_user(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = check_user and p.status = 'active'
  );
$$;

create or replace function private.is_admin(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = check_user and p.status = 'active' and p.role = 'admin'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_active_user(uuid) to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
-- Profile changes are performed by the trusted Edge Function using the secret key.
-- No direct browser INSERT/UPDATE/DELETE grant is intentionally provided.

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select private.is_admin((select auth.uid())))
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Bootstrap note:
-- 1. Create the first Auth user in Supabase Dashboard.
-- 2. Run ONE trusted SQL insert for that user_id with role='admin'.
-- 3. From then on, use the JoTrip admin UI -> manage-user Edge Function.
--
-- Future JoTrip operational tables should include RLS checks against
-- private.is_active_user() and role/scope helpers. Do not rely on frontend hiding alone.
