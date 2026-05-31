/**
 * Server-only credit helpers.
 * Uses the service role key — never import this in client components.
 */
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback costs if the DB table hasn't been seeded yet
const FALLBACK_COSTS: Record<string, number> = {
  "content-caption":        1,
  "content-hook":           1,
  "content-calendar":       3,
  "content-plan":           3,
  "script-generation":      5,
  "reel-script":            5,
  "storyboard-generation": 10,
  "character-creation":    15,
  "brand-vault":           15,
  "full-story-arc":         5,
  "memory-insight":         3,
};

export async function getCreditCost(action: string): Promise<number> {
  const { data } = await sb
    .from("credit_costs")
    .select("credits")
    .eq("action", action)
    .single();
  return data?.credits ?? FALLBACK_COSTS[action] ?? 5;
}

export async function checkCredits(
  userId: string,
  cost: number
): Promise<{ ok: boolean; remaining: number }> {
  const { data } = await sb
    .from("user_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .single();
  const remaining = data?.credits_remaining ?? 0;
  return { ok: remaining >= cost, remaining };
}

/** Atomic deduction via stored procedure. Returns ok=false if insufficient. */
export async function deductCredits(
  userId: string,
  cost: number
): Promise<{ ok: boolean; remaining: number }> {
  const { data, error } = await sb.rpc("deduct_credits", {
    p_user_id: userId,
    p_cost:    cost,
  });
  if (error) {
    console.error("[deductCredits]", error);
    return { ok: false, remaining: 0 };
  }
  return { ok: (data as { ok: boolean; remaining: number }).ok, remaining: (data as { ok: boolean; remaining: number }).remaining };
}

export async function logUsage(
  userId: string,
  action: string,
  creditsUsed: number
): Promise<void> {
  const { error } = await sb
    .from("usage_tracking")
    .insert({ user_id: userId, action, credits_used: creditsUsed });
  if (error) console.error("[logUsage]", error);
}

export async function getUserCredits(userId: string): Promise<{
  remaining: number;
  usedTotal: number;
  plan: string;
  periodEnd: string | null;
}> {
  const { data } = await sb
    .from("user_credits")
    .select("credits_remaining, credits_used_total, plan, period_end")
    .eq("user_id", userId)
    .single();
  return {
    remaining:  data?.credits_remaining  ?? 0,
    usedTotal:  data?.credits_used_total ?? 0,
    plan:       data?.plan               ?? "free",
    periodEnd:  data?.period_end         ?? null,
  };
}

/** Called by webhook when a subscription is created or renewed. */
export async function provisionCredits(
  userId: string,
  plan: string,
  periodStart: Date,
  periodEnd:   Date | null
): Promise<void> {
  const PLAN_CREDITS: Record<string, number> = {
    creator: 100,
    pro:     300,
    studio:  1000,
  };
  const credits = PLAN_CREDITS[plan] ?? 0;

  await sb.from("user_credits").upsert(
    {
      user_id:           userId,
      credits_remaining: credits,
      credits_used_total: 0,
      plan,
      period_start: periodStart.toISOString(),
      period_end:   periodEnd ? periodEnd.toISOString() : null,
    },
    { onConflict: "user_id" }
  );
}
