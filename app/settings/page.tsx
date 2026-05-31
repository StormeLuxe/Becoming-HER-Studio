/**
 * ── V2 FEATURE: Personal API Keys ─────────────────────────────────────────────
 *
 * This page is intentionally NOT linked from the studio navigation.
 * Per PRODUCT_DECISIONS §8: build the UI but keep it hidden until v2.
 *
 * To enable in v2:
 *   1. Add { id: "settings", icon: "◎", label: "Settings", color: "#c77dff" }
 *      to the NAV array in components/StudioOS.jsx
 *   2. Uncomment the Supabase save logic below
 *   3. Run the SQL at the bottom of this file to create user_api_keys table
 *   4. Update /api/generate to check user_api_keys and use personal key when present
 *      (personal key = no credits deducted)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
// V2: import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [claudeKey,  setClaudeKey]  = useState("");
  const [openaiKey,  setOpenaiKey]  = useState("");
  // const [geminiKey, setGeminiKey] = useState("");   // V2: add Gemini
  const [loading, setLoading]       = useState(false);
  const [saved,   setSaved]         = useState(false);
  const [error,   setError]         = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ── V2: uncomment to persist personal API keys ──────────────────────────
    // const supabase = createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) { setError("Not signed in"); setLoading(false); return; }
    //
    // const { error: dbError } = await supabase.from("user_api_keys").upsert(
    //   {
    //     user_id:    user.id,
    //     claude_key: claudeKey.trim() || null,
    //     openai_key: openaiKey.trim() || null,
    //     // gemini_key: geminiKey.trim() || null,
    //   },
    //   { onConflict: "user_id" }
    // );
    // if (dbError) { setError(dbError.message); setLoading(false); return; }
    // ────────────────────────────────────────────────────────────────────────

    // Placeholder behaviour until v2
    console.log("[Settings] Personal API key save — disabled until v2");

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#08040f", fontFamily: "'DM Mono', monospace", padding: "2rem 1.5rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        :root { --card:#160d2a; --border:#2a1850; --pink:#f72585; --lavender:#c77dff; --cream:#f0e6ff; --muted:#7a6096; --gold:#e8c97e; }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Back link */}
        <Link href="/studio" style={{ fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: ".4rem", marginBottom: "2rem" }}>
          ← Back to Studio
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: ".55rem", letterSpacing: ".4em", textTransform: "uppercase", color: "var(--pink)", marginBottom: ".5rem" }}>
            Settings
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 400, color: "var(--cream)", lineHeight: 1.1, marginBottom: ".5rem" }}>
            Personal API Keys
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7 }}>
            Connect your own API keys to use your own quota. When a personal key is active, generations are free — no credits deducted.
          </p>
        </div>

        {/* Coming soon banner */}
        <div style={{ background: "rgba(123,47,255,.1)", border: "1px solid var(--border)", borderLeft: "2px solid var(--lavender)", borderRadius: 2, padding: "1rem 1.25rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--lavender)", marginBottom: ".4rem" }}>
            Coming in v2
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: ".95rem", color: "var(--muted)", lineHeight: 1.6 }}>
            Personal API key support is in development. For now, all generations run on the platform key included with your plan.
          </p>
        </div>

        {/* Form — UI present but save is no-op until v2 */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", opacity: 0.5, pointerEvents: "none" }}>

          {/* Claude API Key */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
            <label style={{ fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)" }}>
              Anthropic / Claude API Key
            </label>
            <input
              type="password"
              value={claudeKey}
              onChange={e => setClaudeKey(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 2, padding: ".75rem .9rem", color: "var(--cream)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none" }}
            />
            <p style={{ fontSize: ".55rem", color: "var(--muted)", letterSpacing: ".05em" }}>
              Get your key at console.anthropic.com. Claude Sonnet is used for all generations.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
            <label style={{ fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)" }}>
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 2, padding: ".75rem .9rem", color: "var(--cream)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none" }}
            />
          </div>

          {/* V2 — Gemini key will go here */}
          {/* <div>
            <label>Google Gemini API Key</label>
            <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="AIza..." />
          </div> */}

          {error && <p style={{ fontSize: ".65rem", color: "var(--pink)", fontFamily: "'DM Mono', monospace" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: ".85rem 1.75rem", border: "none", borderRadius: 2, background: "linear-gradient(135deg, #f72585, #7b2fff)", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: ".62rem", letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start" }}
          >
            {loading ? "Saving…" : saved ? "✓  Saved" : "◈  Save Keys"}
          </button>
        </form>

        <p style={{ marginTop: "3rem", fontSize: ".55rem", letterSpacing: ".15em", color: "var(--border)" }}>
          Keys are encrypted at rest and never logged or shared.
        </p>
      </div>
    </main>
  );
}

/*
── V2 SQL: run this when enabling personal API keys ────────────────────────────

create table if not exists user_api_keys (
  user_id    uuid    primary key references auth.users(id) on delete cascade,
  claude_key text,
  openai_key text,
  gemini_key text,
  updated_at timestamptz not null default now()
);

alter table user_api_keys enable row level security;
create policy "api_keys_self" on user_api_keys for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger user_api_keys_updated_at
  before update on user_api_keys for each row execute procedure touch_updated_at();

── V2 /api/generate change ─────────────────────────────────────────────────────

In POST handler, after auth check:

  const { data: keyRow } = await supabaseService
    .from("user_api_keys")
    .select("claude_key")
    .eq("user_id", user.id)
    .single();

  const apiKey = keyRow?.claude_key || process.env.ANTHROPIC_API_KEY;
  const usingPersonalKey = !!keyRow?.claude_key;
  const clientToUse = new Anthropic({ apiKey });

  // Skip credit deduction if using personal key
  if (!usingPersonalKey) {
    // ... existing credit check + deduct logic
  }

───────────────────────────────────────────────────────────────────────────────
*/
