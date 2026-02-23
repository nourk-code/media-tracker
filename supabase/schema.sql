-- ============================================================
-- Media Tracker - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type public.media_type as enum ('movie', 'tv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.media_status as enum (
    'owned', 'wishlist', 'currently_watching', 'completed'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table if not exists public.profiles (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  username              text        unique not null,
  display_name          text,
  avatar_url            text,
  bio                   text,
  is_public             boolean     not null default true,
  dna_cache_expires_at  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(
    regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g')
  );

  if char_length(base_username) < 3 then
    base_username := 'user';
  end if;

  final_username := base_username;

  loop
    begin
      insert into public.profiles (id, username, display_name, avatar_url)
      values (
        new.id,
        final_username,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
      );
      exit;
    exception when unique_violation then
      counter := counter + 1;
      final_username := base_username || counter::text;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLE: collection_items
-- ============================================================
create table if not exists public.collection_items (
  id              bigserial   primary key,
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  tmdb_id         integer     not null,
  media_type      public.media_type not null,
  title           text        not null,
  original_title  text,
  overview        text,
  poster_path     text,
  backdrop_path   text,
  release_year    integer,
  genres          text[]      default '{}',
  directors       text[]      default '{}',
  cast_top5       text[]      default '{}',
  runtime_mins    integer,
  vote_average    numeric(4,2),
  status          public.media_status not null default 'wishlist',
  user_rating     smallint    check (user_rating between 1 and 10),
  user_notes      text,
  ai_synopsis     text,
  date_added      timestamptz not null default now(),
  date_updated    timestamptz not null default now(),
  date_completed  date,
  unique(user_id, tmdb_id, media_type)
);

create index if not exists idx_collection_user_status on public.collection_items(user_id, status);
create index if not exists idx_collection_user_type   on public.collection_items(user_id, media_type);
create index if not exists idx_collection_genres      on public.collection_items using gin(genres);
create index if not exists idx_collection_title_trgm  on public.collection_items using gin(title gin_trgm_ops);

-- ============================================================
-- TABLE: shared_collections
-- ============================================================
create table if not exists public.shared_collections (
  id            uuid        primary key default gen_random_uuid(),
  owner_id      uuid        not null references public.profiles(id) on delete cascade,
  slug          text        unique not null,
  title         text        not null,
  description   text,
  filter_status text[],
  filter_type   text,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_collection_updated_at on public.collection_items;
create trigger trg_collection_updated_at
  before update on public.collection_items
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (is_public = true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- collection_items
alter table public.collection_items enable row level security;

drop policy if exists "collection_select_own" on public.collection_items;
create policy "collection_select_own" on public.collection_items
  for select using (auth.uid() = user_id);

drop policy if exists "collection_select_public_profile" on public.collection_items;
create policy "collection_select_public_profile" on public.collection_items
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = user_id and p.is_public = true
    )
  );

drop policy if exists "collection_insert_own" on public.collection_items;
create policy "collection_insert_own" on public.collection_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "collection_update_own" on public.collection_items;
create policy "collection_update_own" on public.collection_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "collection_delete_own" on public.collection_items;
create policy "collection_delete_own" on public.collection_items
  for delete using (auth.uid() = user_id);

-- shared_collections
alter table public.shared_collections enable row level security;

drop policy if exists "shared_select_active" on public.shared_collections;
create policy "shared_select_active" on public.shared_collections
  for select using (is_active = true);

drop policy if exists "shared_insert_own" on public.shared_collections;
create policy "shared_insert_own" on public.shared_collections
  for insert with check (auth.uid() = owner_id);

drop policy if exists "shared_update_own" on public.shared_collections;
create policy "shared_update_own" on public.shared_collections
  for update using (auth.uid() = owner_id);

drop policy if exists "shared_delete_own" on public.shared_collections;
create policy "shared_delete_own" on public.shared_collections
  for delete using (auth.uid() = owner_id);
