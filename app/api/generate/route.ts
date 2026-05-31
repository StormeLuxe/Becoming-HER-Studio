import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Anthropic from "@anthropic-ai/sdk";
import { getCreditCost, checkCredits, deductCredits, logUsage } from "@/lib/credits";

// Platform-owned key — never exposed to client (PRODUCT_DECISIONS §1)
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ImageInput = { base64: string; type: string };

export async function POST(req: NextRequest) {

  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse request ─────────────────────────────────────────────────────
  const {
    systemPrompt,
    userPrompt,
    images,
    maxTokens = 1000,
    action = "script-generation",
  } = await req.json();

  // ── 3. Credit cost lookup ─────────────────────────────────────────────────
  const cost = await getCreditCost(action);

  // ── 4. Pre-flight credit check (fast rejection before hitting Claude) ─────
  const { ok: hasCredits } = await checkCredits(user.id, cost);
  if (!hasCredits) {
    return NextResponse.json(
      {
        text: "",
        insufficientCredits: true,
        error: "Not enough credits — upgrade your plan",
      },
      { status: 402 }
    );
  }

  // ── 5. Build Claude content ───────────────────────────────────────────────
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

  // ── 6. Run generation — failed generations do NOT deduct credits ──────────
  let text = "";
  try {
    const response = await claude.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });
    text = response.content[0]?.type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[/api/generate] Claude error:", err);
    return NextResponse.json({ text: "", error: "Generation failed" }, { status: 500 });
  }

  // ── 7. Deduct credits (only on success) ───────────────────────────────────
  const { remaining } = await deductCredits(user.id, cost);

  // ── 8. Log usage ──────────────────────────────────────────────────────────
  await logUsage(user.id, action, cost);

  return NextResponse.json({ text, creditsRemaining: remaining });
}
