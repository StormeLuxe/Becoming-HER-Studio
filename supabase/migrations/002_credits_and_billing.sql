-- ── Becoming HER Studio — Credits & Billing ──────────────────────────────────
-- Run AFTER 001_studio_tables.sql

-- ── Extend subscriptions with stripe_subscription_id + period_start ──────────
alter table subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists period_start            timestamptz;

-- Update plan values to match product decisions (creator / pro / studio)
comment on column subscriptions.plan is
  'creator | pro | studio | free';

-- ── user_credits ─────────────────────────────────────────────────────────────
-- One row per user. Reset by webhook on renewal.
create table if not exists user_credits (
  user_id            uuid        primary key references auth.users(id) on delete cascade,
  credits_remaining  integer     not null default 0  check (credits_remaining >= 0),
  credits_used_total integer     not null default 0,
  plan               text        not null default 'free',
  period_start       timestamptz,
  period_end         timestamptz,
  updated_at         timestamptz not null default now()
);

alter table user_credits enable row level security;

-- Users can read their own balance; service role writes (webhook + generate route)
create policy "user_credits_read_self" on user_credits for select
  using (auth.uid() = user_id);

create trigger user_credits_updated_at
  before update on user_credits
  for each row execute procedure touch_updated_at();

-- ── usage_tracking ────────────────────────────────────────────────────────────
-- Append-only log: every successful generation is recorded here.
create table if not exists usage_tracking (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  action       text        not null,
  credits_used integer     not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_usage_user on usage_tracking (user_id, created_at desc);
alter table usage_tracking enable row level security;

-- Users can read their own log; service role writes
create policy "usage_read_self" on usage_tracking for select
  using (auth.uid() = user_id);

-- ── credit_costs ─────────────────────────────────────────────────────────────
-- Admin-editable via Supabase dashboard or admin panel. No RLS — service role access only.
create table if not exists credit_costs (
  action     text        primary key,
  credits    integer     not null check (credits > 0),
  updated_at timestamptz not null default now()
);

create trigger credit_costs_updated_at
  before update on credit_costs
  for each row execute procedure touch_updated_at();

-- Seed default costs (from PRODUCT_DECISIONS.md §2)
insert into credit_costs (action, credits) values
  ('content-caption',         1),
  ('content-hook',            1),
  ('content-calendar',        3),
  ('content-plan',            3),
  ('script-generation',       5),
  ('reel-script',             5),
  ('storyboard-generation',  10),
  ('character-creation',     15),
  ('brand-vault',            15),
  ('full-story-arc',          5),
  ('memory-insight',          3)
on conflict (action) do nothing;

-- ── deduct_credits RPC ────────────────────────────────────────────────────────
-- Atomic check-and-deduct. security definer bypasses RLS.
-- Returns: { ok: bool, remaining: int }
create or replace function deduct_credits(p_user_id uuid, p_cost integer)
returns jsonb language plpgsql security definer as $$
declare
  v_remaining integer;
begin
  update user_credits
  set
    credits_remaining  = credits_remaining - p_cost,
    credits_used_total = credits_used_total + p_cost,
    updated_at         = now()
  where user_id            = p_user_id
    and credits_remaining >= p_cost
  returning credits_remaining into v_remaining;

  if not found then
    return jsonb_build_object(
      'ok',        false,
      'remaining', coalesce(
        (select credits_remaining from user_credits where user_id = p_user_id), 0
      )
    );
  end if;

  return jsonb_build_object('ok', true, 'remaining', v_remaining);
end;
$$;
