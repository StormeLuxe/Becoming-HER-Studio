/**
 * Tier access rules — source of truth for module gating.
 * Imported by both server routes (authoritative) and client UI (display only).
 */

export type Plan = "free" | "creator" | "pro" | "studio";

const PLAN_RANK: Record<Plan, number> = { free: 0, creator: 1, pro: 2, studio: 3 };

export function planAtLeast(userPlan: string, required: Plan): boolean {
  return (PLAN_RANK[userPlan as Plan] ?? 0) >= PLAN_RANK[required];
}

/** Minimum plan required to access each studio module */
export const MODULE_MIN_PLAN: Record<string, Plan> = {
  dashboard:  "free",    // always visible
  profile:    "free",    // FREE - onboarding foundation for all users
  content:    "creator",
  script:     "creator",
  projects:   "creator",
  memory:     "creator",
  character:  "pro",
  vault:      "pro",
  storyboard: "studio",
};

export const PLAN_CREDITS: Record<Plan, number> = {
  free:    0,
  creator: 100,
  pro:     300,
  studio:  1000,
};

export const PLAN_NAMES: Record<Plan, string> = {
  free:    "Free",
  creator: "Creator",
  pro:     "Pro Creator",
  studio:  "Studio",
};

export const PLAN_PRICES: Record<Plan, string> = {
  free:    "Free",
  creator: "$27/month",
  pro:     "$47/month",
  studio:  "$97/month",
};

/** Stripe slug sent to /api/subscribe */
export const PLAN_STRIPE_SLUG: Partial<Record<Plan, string>> = {
  creator: "creator",
  pro:     "pro",
  studio:  "studio",
};
