-- Add new onboarding fields for redesigned transformation journey
-- This supports the multi-step Becoming Profile experience

alter table profiles
  add column if not exists creator_types text[] default '{}',
  add column if not exists brand_name text,
  add column if not exists tagline text,
  add column if not exists niche text,
  add column if not exists audience text,
  add column if not exists mission text,
  add column if not exists visual_style text,
  add column if not exists color_palette text,
  add column if not exists platforms text[] default '{}',
  add column if not exists content_goals text[] default '{}',
  add column if not exists voice_styles text[] default '{}',
  add column if not exists signature_phrase text,
  add column if not exists journey_type text,
  add column if not exists ninety_day_goal text,
  add column if not exists revenue_goal text;

-- Create indexes for common queries
create index if not exists idx_profiles_creator_types on profiles using gin(creator_types);
create index if not exists idx_profiles_platforms on profiles using gin(platforms);
create index if not exists idx_profiles_journey_type on profiles(journey_type);

-- Add comment
comment on table profiles is 'User profiles with Becoming Identity data from transformation journey onboarding';
