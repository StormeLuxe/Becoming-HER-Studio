-- Becoming HER Studio - Phase 2 connected intelligence architecture
-- Run after 001_studio_tables.sql and 002_credits_and_billing.sql.
-- This migration is additive only. It does not recreate existing tables.

-- Profile onboarding extensions. Existing profile sections stay jsonb.
alter table profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists content jsonb not null default '{}';

-- Brand Vault: persistent brand system referenced by all generation routes.
create table if not exists brand_vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  colors jsonb not null default '[]',
  fonts jsonb not null default '[]',
  logo_urls jsonb not null default '[]',
  personality jsonb not null default '{}',
  audience jsonb not null default '{}',
  offers jsonb not null default '[]',
  website text,
  social_handles jsonb not null default '{}',
  notes text,
  updated_at timestamptz not null default now()
);

alter table brand_vaults enable row level security;
drop policy if exists "brand_vaults_self" on brand_vaults;
create policy "brand_vaults_self" on brand_vaults for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists brand_vaults_updated_at on brand_vaults;
create trigger brand_vaults_updated_at
  before update on brand_vaults
  for each row execute procedure touch_updated_at();

-- Character Builder: multiple AI personas per user, with optional image URLs.
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age text,
  appearance text,
  skin_tone text,
  hair text,
  body_type text,
  fashion_style text,
  personality text,
  voice text,
  story text,
  image_urls jsonb not null default '[]',
  ai_profile jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_characters_user on characters (user_id, created_at desc);
alter table characters enable row level security;
drop policy if exists "characters_self" on characters;
create policy "characters_self" on characters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists characters_updated_at on characters;
create trigger characters_updated_at
  before update on characters
  for each row execute procedure touch_updated_at();

-- AI Memory Engine: typed persistent memory with source/weight.
alter table studio_memories
  add column if not exists source text not null default 'manual',
  add column if not exists importance integer not null default 1,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists studio_memories_updated_at on studio_memories;
create trigger studio_memories_updated_at
  before update on studio_memories
  for each row execute procedure touch_updated_at();

-- Project Vault enhancements. Existing projects table remains canonical.
alter table projects
  add column if not exists status text not null default 'saved',
  add column if not exists tags text[] not null default '{}',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_projects_search on projects using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(type,'')));
drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at
  before update on projects
  for each row execute procedure touch_updated_at();

-- Prompt Vault: searchable, cloneable/favoriteable user prompt library.
create table if not exists prompt_vault (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  prompt text not null,
  favorite boolean not null default false,
  shared boolean not null default false,
  cloned_from uuid,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompt_vault_user on prompt_vault (user_id, created_at desc);
create index if not exists idx_prompt_vault_category on prompt_vault (category);
create index if not exists idx_prompt_vault_search on prompt_vault using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(prompt,'') || ' ' || coalesce(category,'')));
alter table prompt_vault enable row level security;
drop policy if exists "prompt_vault_self" on prompt_vault;
create policy "prompt_vault_self" on prompt_vault for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists prompt_vault_updated_at on prompt_vault;
create trigger prompt_vault_updated_at
  before update on prompt_vault
  for each row execute procedure touch_updated_at();

-- Becoming Score: cached journey progress snapshots.
create table if not exists becoming_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_completion integer not null default 0,
  brand_completion integer not null default 0,
  content_creation integer not null default 0,
  saved_projects integer not null default 0,
  activity integer not null default 0,
  overall integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table becoming_scores enable row level security;
drop policy if exists "becoming_scores_self" on becoming_scores;
create policy "becoming_scores_self" on becoming_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists becoming_scores_updated_at on becoming_scores;
create trigger becoming_scores_updated_at
  before update on becoming_scores
  for each row execute procedure touch_updated_at();

-- Community backend architecture only. No frontend required yet.
create table if not exists community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  plan_required text not null default 'creator',
  created_at timestamptz not null default now()
);

create table if not exists community_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references community_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists community_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references community_groups(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists prompt_shares (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompt_vault(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references community_groups(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table community_groups enable row level security;
alter table community_memberships enable row level security;
alter table community_challenges enable row level security;
alter table prompt_shares enable row level security;

drop policy if exists "community_groups_read" on community_groups;
create policy "community_groups_read" on community_groups for select using (true);
drop policy if exists "community_memberships_self" on community_memberships;
create policy "community_memberships_self" on community_memberships for select using (auth.uid() = user_id);
drop policy if exists "community_challenges_read" on community_challenges;
create policy "community_challenges_read" on community_challenges for select using (true);
drop policy if exists "prompt_shares_self" on prompt_shares;
create policy "prompt_shares_self" on prompt_shares for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket metadata for uploads. Run manually if storage schema policies need dashboard confirmation.
insert into storage.buckets (id, name, public)
values ('character-images', 'character-images', true), ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

drop policy if exists "character_images_read" on storage.objects;
create policy "character_images_read" on storage.objects for select
  using (bucket_id = 'character-images');
drop policy if exists "character_images_write_self" on storage.objects;
create policy "character_images_write_self" on storage.objects for insert
  with check (bucket_id = 'character-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "brand_assets_read" on storage.objects;
create policy "brand_assets_read" on storage.objects for select
  using (bucket_id = 'brand-assets');
drop policy if exists "brand_assets_write_self" on storage.objects;
create policy "brand_assets_write_self" on storage.objects for insert
  with check (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1]);
