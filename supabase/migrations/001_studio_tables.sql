-- ── Becoming HER Studio — initial schema ─────────────────────────────────────
-- Run this in the Supabase SQL editor for the becoming-her-studio project.

-- Becoming Profile: the user's full creative identity
create table if not exists profiles (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  identity   jsonb       not null default '{}',
  brand      jsonb       not null default '{}',
  audience   jsonb       not null default '{}',
  visual     jsonb       not null default '{}',
  voice      jsonb       not null default '{}',
  goals      jsonb       not null default '{}',
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles_self" on profiles for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Projects: every AI generation saved automatically
create table if not exists projects (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  type       text        not null,
  content    jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user on projects (user_id, created_at desc);
alter table projects enable row level security;
create policy "projects_self" on projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Studio Memories: user's curated personal archive
create table if not exists studio_memories (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  type       text        not null default 'note',
  text       text        not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_studio_memories_user on studio_memories (user_id, created_at desc);
alter table studio_memories enable row level security;
create policy "studio_memories_self" on studio_memories for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subscriptions: Stripe plan status — written by webhook (service role)
create table if not exists subscriptions (
  user_id            uuid        primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  plan               text        not null default 'free',
  status             text        not null default 'inactive',
  period_end         timestamptz,
  updated_at         timestamptz not null default now()
);

alter table subscriptions enable row level security;
create policy "subscriptions_read_self" on subscriptions for select
  using (auth.uid() = user_id);

-- Auto-touch updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on profiles for each row execute procedure touch_updated_at();
create trigger subscriptions_updated_at
  before update on subscriptions for each row execute procedure touch_updated_at();
