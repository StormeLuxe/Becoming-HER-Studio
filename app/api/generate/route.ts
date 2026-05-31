import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { getCreditCost, checkCredits, deductCredits, logUsage } from "@/lib/credits";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ImageInput = { base64: string; type: string };
type Plan = "free" | "creator" | "pro" | "studio";

const PLAN_RANK: Record<Plan, number> = { free: 0, creator: 1, pro: 2, studio: 3 };
const ACTION_MIN_PLAN: Record<string, Plan> = {
  "content-caption": "creator",
  "content-hook": "creator",
  "content-calendar": "creator",
  "content-plan": "creator",
  "script-generation": "creator",
  "reel-script": "creator",
  "full-story-arc": "creator",
  "memory-insight": "creator",
  "character-creation": "pro",
  "brand-vault": "pro",
  "storyboard-generation": "studio",
};

function planAtLeast(plan: string, required: Plan) {
  return (PLAN_RANK[(plan as Plan) || "free"] ?? 0) >= PLAN_RANK[required];
}

function compact(value: unknown) {
  if (!value) return "not set";
  if (typeof value === "string") return value.trim() || "not set";
  if (Array.isArray(value)) return value.length ? JSON.stringify(value).slice(0, 1600) : "not set";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 2200);
  return String(value);
}

async function getPlan(userId: string) {
  const { data } = await service
    .from("user_credits")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.plan ?? "free";
}

async function buildConnectedContext(userId: string) {
  const [profileRes, brandRes, charactersRes, memoriesRes] = await Promise.all([
    service.from("profiles").select("identity, brand, audience, visual, voice, goals, content").eq("user_id", userId).maybeSingle(),
    service.from("brand_vaults").select("colors, fonts, logo_urls, personality, audience, offers, website, social_handles, notes").eq("user_id", userId).maybeSingle(),
    service.from("characters").select("name, age, appearance, skin_tone, hair, body_type, fashion_style, personality, voice, story, ai_profile").eq("user_id", userId).order("updated_at", { ascending: false }).limit(5),
    service.from("studio_memories").select("type, text, source, importance").eq("user_id", userId).order("importance", { ascending: false }).order("created_at", { ascending: false }).limit(12),
  ]);

  const profile = profileRes.data;
  const brand = brandRes.data;
  const characters = charactersRes.data ?? [];
  const memories = memoriesRes.data ?? [];

  return `CONNECTED INTELLIGENCE CONTEXT
Always use this context. Do not ask the user to re-enter it.

BECOMING PROFILE
Identity: ${compact(profile?.identity)}
Brand: ${compact(profile?.brand)}
Audience: ${compact(profile?.audience)}
Content: ${compact(profile?.content)}
Visual: ${compact(profile?.visual)}
Voice: ${compact(profile?.voice)}
Goals: ${compact(profile?.goals)}

BRAND VAULT
Colors: ${compact(brand?.colors)}
Fonts: ${compact(brand?.fonts)}
Personality: ${compact(brand?.personality)}
Audience: ${compact(brand?.audience)}
Offers: ${compact(brand?.offers)}
Website: ${compact(brand?.website)}
Social handles: ${compact(brand?.social_handles)}
Notes: ${compact(brand?.notes)}

SAVED CHARACTERS
${characters.length ? characters.map((c, i) => `${i + 1}. ${c.name || "Unnamed"}: age ${c.age || "not set"}; appearance ${c.appearance || "not set"}; skin ${c.skin_tone || "not set"}; hair ${c.hair || "not set"}; body ${c.body_type || "not set"}; fashion ${c.fashion_style || "not set"}; personality ${c.personality || "not set"}; voice ${c.voice || "not set"}; story ${c.story || "not set"}`).join("\n") : "No saved characters yet."}

AI MEMORY
${memories.length ? memories.map((m) => `- [${m.type || "note"}/${m.source || "manual"}/importance ${m.importance || 1}] ${m.text}`).join("\n") : "No saved memories yet."}

RULES
- Every output must feel customized to the Becoming Profile.
- Every output must honor the Brand Vault.
- Use saved Characters when relevant.
- Use AI Memory quietly as context; do not mention memory mechanics.
- If a field is not set, make a tasteful assumption and keep moving.`;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    systemPrompt,
    userPrompt,
    images,
    maxTokens = 1000,
    action = "script-generation",
    projectName,
    projectType,
    projectContent,
  } = await req.json();

  const requiredPlan = ACTION_MIN_PLAN[action] ?? "creator";
  const plan = await getPlan(user.id);
  if (!planAtLeast(plan, requiredPlan)) {
    return NextResponse.json(
      { text: "", locked: true, requiredPlan, error: `This action requires the ${requiredPlan} plan.` },
      { status: 403 }
    );
  }

  const cost = await getCreditCost(action);
  const { ok: hasCredits } = await checkCredits(user.id, cost);
  if (!hasCredits) {
    return NextResponse.json(
      { text: "", insufficientCredits: true, error: "Not enough credits — upgrade your plan" },
      { status: 402 }
    );
  }

  const connectedContext = await buildConnectedContext(user.id);
  const finalSystemPrompt = `${systemPrompt || "You are Becoming HER Studio, an AI creator operating system."}\n\n${connectedContext}`;

  let content: Anthropic.MessageParam["content"];
  if (images?.length) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    content = [
      ...images.map((img: ImageInput) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: (validTypes.includes(img.type) ? img.type : "image/jpeg") as
            | "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: img.base64,
        },
      })),
      { type: "text" as const, text: userPrompt },
    ];
  } else {
    content = userPrompt;
  }

  let text = "";
  try {
    const response = await claude.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system: finalSystemPrompt,
      messages: [{ role: "user", content }],
    });
    text = response.content[0]?.type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[/api/generate] Claude error:", err);
    return NextResponse.json({ text: "", error: "Generation failed" }, { status: 500 });
  }

  const { ok: deducted, remaining } = await deductCredits(user.id, cost);
  if (!deducted) {
    return NextResponse.json(
      { text: "", insufficientCredits: true, error: "Not enough credits — upgrade your plan" },
      { status: 402 }
    );
  }

  await logUsage(user.id, action, cost);

  await service.from("projects").insert({
    user_id: user.id,
    name: projectName || action.replace(/-/g, " "),
    type: projectType || action,
    content: projectContent || { text, action, generated_at: new Date().toISOString() },
    tags: [action],
  });

  return NextResponse.json({ text, creditsRemaining: remaining });
}
