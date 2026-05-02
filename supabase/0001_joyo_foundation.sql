-- supabase/migrations/0001_joyo_foundation.sql
-- ═══════════════════════════════════════════════════
--  Joyo — Database Foundation
--  Run: npx supabase db push
-- ═══════════════════════════════════════════════════

-- ── PROFILES TABLE ──────────────────────────────────
-- One row per authenticated user (parent account).
-- Child progress is stored here (COPPA-safe — tied to parent auth).

create table if not exists public.profiles (
  id                uuid references auth.users on delete cascade primary key,
  child_name        text,
  avatar            text        not null default 'koala',
  stars_total       integer     not null default 0,
  last_module       text,
  completed_modules text[]      not null default '{}',
  updated_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Auto-populate updated_at on any UPDATE
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ROW LEVEL SECURITY ──────────────────────────────
alter table public.profiles enable row level security;

-- Users can read only their own profile
create policy "profiles: select own"
  on public.profiles for select
  using ( auth.uid() = id );

-- Users can insert only their own profile
create policy "profiles: insert own"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Users can update only their own profile
create policy "profiles: update own"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );
