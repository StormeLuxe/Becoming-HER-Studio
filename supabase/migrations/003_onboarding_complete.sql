-- Add onboarding_complete column to profiles table
-- This tracks whether the user has completed the 6-step Becoming Profile onboarding

alter table profiles
  add column if not exists onboarding_complete boolean not null default false;

-- Create an index for quick lookups
create index if not exists idx_profiles_onboarding on profiles(user_id, onboarding_complete);
