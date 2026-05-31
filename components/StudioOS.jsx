"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Tier config (mirrors lib/tiers.ts — kept inline for JSX compat) ─────────
const PLAN_RANK    = { free: 0, creator: 1, pro: 2, studio: 3 };
const PLAN_CREDITS = { free: 0, creator: 100, pro: 300, studio: 1000 };
const PLAN_NAMES   = { free: "Free", creator: "Creator", pro: "Pro Creator", studio: "Studio" };
const PLAN_PRICES  = { free: "Free", creator: "$27/month", pro: "$47/month", studio: "$97/month" };

const MODULE_MIN_PLAN = {
  dashboard:  "free",
  profile:    "creator",
  content:    "creator",
  script:     "creator",
  projects:   "creator",
  memory:     "creator",
  character:  "pro",
  vault:      "pro",
  storyboard: "studio",
};

function planAtLeast(userPlan, required) {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[required] ?? 1);
}

function nextPlanUp(current) {
  if (current === "creator") return "pro";
  if (current === "pro")     return "studio";
  return "creator";
}

// Content format → credit action mapping
const CONTENT_ACTION_MAP = {
  "Reel Hook":            "content-hook",
  "Caption":              "content-caption",
  "Email Subject":        "content-caption",
  "Carousel Outline":     "content-plan",
  "Thread/Carousel Copy": "content-plan",
  "Content Calendar":     "content-calendar",
  "Story Sequence":       "script-generation",
};

// ─── API helpers ──────────────────────────────────────────────────────────────

/**
 * Calls /api/generate (server-side Claude + credit check).
 * Returns { text, insufficientCredits, creditsRemaining }
 */
async function callClaude(system, userMsg, images = null, action = "script-generation") {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt: system,
      userPrompt:   userMsg,
      images:       images ?? undefined,
      action,
    }),
  });
  const d = await res.json();
  if (d.insufficientCredits) {
    return { text: null, insufficientCredits: true, creditsRemaining: 0 };
  }
  return {
    text:             d.text || "",
    insufficientCredits: false,
    creditsRemaining: d.creditsRemaining ?? null,
  };
}

async function callClaudeJSON(system, userMsg, action = "script-generation") {
  const result = await callClaude(
    system + "\n\nRespond ONLY with valid JSON. No markdown, no backticks, no preamble.",
    userMsg,
    null,
    action
  );
  if (result.insufficientCredits) return { _insufficientCredits: true };
  try {
    return {
      ...JSON.parse(result.text.replace(/```json|```/g, "").trim()),
      _creditsRemaining: result.creditsRemaining,
    };
  } catch {
    return null;
  }
}

// ─── Supabase save helpers ────────────────────────────────────────────────────

async function saveGeneration(userId, name, type, content) {
  if (!userId) return;
  try {
    const sb = createClient();
    await sb.from("projects").insert({ user_id: userId, name, type, content: { text: content } });
  } catch {}
}

// ─── Profile context ──────────────────────────────────────────────────────────

const ProfileContext = createContext(null);
const DEFAULT_PROFILE = {
  identity: { name: "", pronouns: "", tagline: "", origin: "", transformation: "" },
  brand:    { brandName: "", niche: "", mission: "", tone: "", archetype: "" },
  audience: { who: "", age: "", pain: "", desire: "", platform: "" },
  visual:   { colors: "", aesthetic: "", mood: "", references: "" },
  voice:    { style: "", vocabulary: "", avoid: "", signature: "" },
  goals:    { shortTerm: "", longTerm: "", revenue: "", impact: "" },
};
function useProfile() { return useContext(ProfileContext); }

function profileContext(profile) {
  const p = profile;
  return `BECOMING PROFILE — ALL outputs must be personalized to this:
Name: ${p.identity.name||"not set"} | Tagline: ${p.identity.tagline||"not set"} | Transformation: ${p.identity.transformation||"not set"}
Brand: ${p.brand.brandName||"not set"} | Niche: ${p.brand.niche||"not set"} | Tone: ${p.brand.tone||"not set"} | Archetype: ${p.brand.archetype||"not set"}
Audience: ${p.audience.who||"not set"} | Pain: ${p.audience.pain||"not set"} | Desire: ${p.audience.desire||"not set"} | Platform: ${p.audience.platform||"not set"}
Visual: ${p.visual.aesthetic||"not set"} | Mood: ${p.visual.mood||"not set"} | Colors: ${p.visual.colors||"not set"}
Voice: ${p.voice.style||"not set"} | Signature: ${p.voice.signature||"not set"}
Goals: ${p.goals.shortTerm||"not set"} → ${p.goals.longTerm||"not set"}`.trim();
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Loader({ text = "Generating…" }) {
  return <div className="loader-wrap"><div className="loader-ring" /><span className="loader-text">{text}</span></div>;
}
function ResultCard({ children, accentColor = "var(--pink)" }) {
  return <div className="result-card" style={{ borderLeftColor: accentColor }}>{children}</div>;
}
function FieldGroup({ label, children }) {
  return <div className="fg"><label className="fg-label">{label}</label>{children}</div>;
}
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input className="fi" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea className="fi fi-ta" rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
function Chips({ options, value, onChange }) {
  return <div className="chips">{options.map(o => <button key={o} className={`chip ${value===o?"chip-on":""}`} onClick={() => onChange(o)}>{o}</button>)}</div>;
}
function CTAButton({ onClick, disabled, loading, loadingText, children, color = "pink" }) {
  return (
    <button className={`cta cta-${color}`} onClick={onClick} disabled={disabled||loading}>
      {loading ? <><span className="cta-spin" /> {loadingText}</> : children}
    </button>
  );
}
function ModuleHeader({ icon, title, subtitle, color }) {
  return (
    <div className="mod-header">
      <span className="mod-icon" style={{ color }}>{icon}</span>
      <div><h2 className="mod-title">{title}</h2><p className="mod-sub">{subtitle}</p></div>
    </div>
  );
}
function ProfileBadge({ profile }) {
  const filled = Object.values(profile).reduce((a,s) => a+Object.values(s).filter(Boolean).length, 0);
  const total  = Object.values(profile).reduce((a,s) => a+Object.keys(s).length, 0);
  const pct = Math.round((filled/total)*100);
  return (
    <div className="profile-badge">
      <div className="profile-badge-ring" style={{ "--pct": pct+"%" }}><span>{pct}%</span></div>
      <div>
        <div className="profile-badge-name">{profile.identity.name||"Set Your Profile"}</div>
        <div className="profile-badge-sub">Becoming Profile</div>
      </div>
    </div>
  );
}

/** Shown when a module is locked behind a higher-tier plan */
function LockedModuleView({ moduleId, userPlan, onUpgrade }) {
  const nav      = NAV.find(n => n.id === moduleId);
  const required = MODULE_MIN_PLAN[moduleId] ?? "creator";
  const name     = PLAN_NAMES[required];
  const price    = PLAN_PRICES[required];
  return (
    <div className="locked-module">
      <div className="locked-icon" style={{ color: nav?.color || "var(--lavender)" }}>{nav?.icon || "◈"}</div>
      <h2 className="locked-title">{nav?.label || moduleId}</h2>
      <p className="locked-desc">
        This module is available on the <strong>{name}</strong> plan ({price}).
      </p>
      <p className="locked-plan">Your current plan: <span>{PLAN_NAMES[userPlan] || "Free"}</span></p>
      <button className="cta cta-pink" onClick={() => onUpgrade(required)}>
        Upgrade to {name} →
      </button>
    </div>
  );
}

/** Shown inline when a generation fails due to insufficient credits */
function OutOfCreditsPrompt({ userPlan, onUpgrade }) {
  const next     = nextPlanUp(userPlan);
  const nextName = PLAN_NAMES[next];
  const nextPri  = PLAN_PRICES[next];
  return (
    <div className="credit-error-card">
      <div className="credit-error-icon">◈</div>
      <p className="credit-error-title">Out of credits</p>
      <p className="credit-error-desc">
        You've used all your {PLAN_NAMES[userPlan] || "plan"} credits for this period.
        Upgrade to <strong>{nextName}</strong> ({nextPri}) to keep creating.
      </p>
      <button className="cta cta-pink" onClick={() => onUpgrade(next)}>
        Upgrade to {nextName} →
      </button>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "profile",    icon: "◈", label: "Becoming Profile",  color: "#f72585" },
  { id: "character",  icon: "◉", label: "Character Builder", color: "#c77dff" },
  { id: "vault",      icon: "⬡", label: "Brand Vault",       color: "#e8c97e" },
  { id: "content",    icon: "◐", label: "Content Studio",    color: "#4cc9f0" },
  { id: "storyboard", icon: "◫", label: "Storyboard Studio", color: "#7b2fff" },
  { id: "script",     icon: "◑", label: "Script Studio",     color: "#f72585" },
  { id: "projects",   icon: "▣", label: "Project Vault",     color: "#c77dff" },
  { id: "memory",     icon: "◬", label: "AI Memory Engine",  color: "#4cc9f0" },
  // V2: { id: "settings", icon: "◎", label: "Settings", color: "#7a6096" },
];

// ─── Module 1 — Becoming Profile ─────────────────────────────────────────────
// No credits charged — profile setup is always free

function BecomingProfile({ userId }) {
  const { profile, setProfile } = useProfile();
  const [tab, setTab] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const SECTIONS = [
    { id: "identity", label: "Identity",     icon: "◈" },
    { id: "brand",    label: "Brand",        icon: "⬡" },
    { id: "audience", label: "Audience",     icon: "◉" },
    { id: "visual",   label: "Visual Style", icon: "◐" },
    { id: "voice",    label: "Voice",        icon: "◫" },
    { id: "goals",    label: "Goals",        icon: "◑" },
  ];

  function update(section, key, val) { setProfile(p => ({ ...p, [section]: { ...p[section], [key]: val } })); }

  async function save() {
    setSaving(true);
    if (userId) {
      const sb = createClient();
      await sb.from("profiles").upsert({ user_id: userId, ...profile }, { onConflict: "user_id" });
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const FIELDS = {
    identity: [
      { key: "name",           label: "Your Name / Creator Name",      ph: "e.g. Lytoria, Storme..."              },
      { key: "pronouns",       label: "Pronouns",                      ph: "e.g. she/her"                         },
      { key: "tagline",        label: "Your Signature Tagline",        ph: "e.g. She didn't arrive… she became."  },
      { key: "origin",         label: "Your Origin Story (short)",     ph: "Where did you start? What changed?"   },
      { key: "transformation", label: "The Transformation You Embody", ph: "What did you overcome or become?"     },
    ],
    brand: [
      { key: "brandName",  label: "Brand Name",        ph: "e.g. Storme Luxe, Dollars & Dreams..."           },
      { key: "niche",      label: "Niche / Industry",  ph: "e.g. AI creator education, luxury content..."    },
      { key: "mission",    label: "Brand Mission",     ph: "What does your brand exist to do?"               },
      { key: "tone",       label: "Brand Tone",        ph: "e.g. Cinematic, luxury, empowering..."           },
      { key: "archetype",  label: "Brand Archetype",   ph: "e.g. The Creator, The Ruler, The Lover..."       },
    ],
    audience: [
      { key: "who",      label: "Who Is She?",              ph: "Describe your ideal audience member..."  },
      { key: "age",      label: "Age Range",                ph: "e.g. 25–45"                              },
      { key: "pain",     label: "Her Biggest Pain Point",   ph: "What keeps her up at night?"             },
      { key: "desire",   label: "Her Deepest Desire",       ph: "What does she truly want?"               },
      { key: "platform", label: "Primary Platform",         ph: "e.g. Instagram, TikTok, Fanvue..."       },
    ],
    visual: [
      { key: "colors",     label: "Brand Colors",      ph: "e.g. Black, crimson, gold, blush pink..."    },
      { key: "aesthetic",  label: "Visual Aesthetic",  ph: "e.g. Cinematic noir, soft luxury..."         },
      { key: "mood",       label: "Mood / Energy",     ph: "e.g. Quiet power, sensual, elevated..."      },
      { key: "references", label: "Visual References", ph: "e.g. Vogue editorial, old Hollywood..."      },
    ],
    voice: [
      { key: "style",      label: "Writing Style",           ph: "e.g. Poetic, direct, intimate, luxury prose..." },
      { key: "vocabulary", label: "Words She Uses",          ph: "e.g. Becoming, elevated, cinematic..."          },
      { key: "avoid",      label: "Words / Tones to Avoid",  ph: "e.g. Hustle, grind, girlboss, basic..."         },
      { key: "signature",  label: "Signature Phrases",       ph: "e.g. She didn't arrive… she became."            },
    ],
    goals: [
      { key: "shortTerm", label: "90-Day Goal",     ph: "What are you building right now?"     },
      { key: "longTerm",  label: "1-Year Vision",   ph: "Where is she in 12 months?"           },
      { key: "revenue",   label: "Revenue Goal",    ph: "e.g. $10k/month, $100k year..."       },
      { key: "impact",    label: "Impact Goal",     ph: "How many women do you want to reach?" },
    ],
  };

  const TEXTAREA_KEYS = ["origin","transformation","mission","who","pain","desire"];
  const current = FIELDS[tab];

  return (
    <div className="module-content">
      <ModuleHeader icon="◈" color="#f72585" title="Becoming Profile" subtitle="The foundation everything else is built on. Fill this first — every module pulls from here." />
      <div className="profile-tabs">
        {SECTIONS.map(s => (
          <button key={s.id} className={`ptab ${tab===s.id?"ptab-on":""}`} onClick={() => setTab(s.id)}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>
      <div className="profile-form">
        {current.map(f => (
          <FieldGroup key={f.key} label={f.label}>
            {TEXTAREA_KEYS.includes(f.key)
              ? <Textarea value={profile[tab][f.key]||""} onChange={v => update(tab,f.key,v)} placeholder={f.ph} />
              : <Input    value={profile[tab][f.key]||""} onChange={v => update(tab,f.key,v)} placeholder={f.ph} />}
          </FieldGroup>
        ))}
      </div>
      <CTAButton onClick={save} loading={saving} loadingText="Saving…" color="pink">
        {saved ? "✓  Saved to Profile" : "◈  Save Profile"}
      </CTAButton>
    </div>
  );
}

// ─── Module 2 — Character Builder (Pro+) ─────────────────────────────────────

function CharacterBuilder({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [char, setChar]     = useState({ name:"", appearance:"", personality:"", voice:"", backstory:"" });
  const [photos, setPhotos] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading]      = useState(false);
  const [creditError, setCreditError] = useState(false);
  const fileRef = useRef(null);

  function update(k, v) { setChar(p => ({ ...p, [k]: v })); }

  async function toB64(file) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({ base64: r.result.split(",")[1], type: file.type, preview: r.result });
      r.readAsDataURL(file);
    });
  }
  async function handleFiles(files) {
    const encoded = await Promise.all(Array.from(files).filter(f => f.type.startsWith("image/")).slice(0,4).map(toB64));
    setPhotos(p => [...p, ...encoded].slice(0,4));
  }

  async function generate() {
    setLoading(true); setResult(""); setCreditError(false);
    const ctx = profileContext(profile);
    const userMsg = `${ctx}\n\nCharacter: Name: ${char.name} | Appearance: ${char.appearance} | Personality: ${char.personality} | Voice: ${char.voice} | Backstory: ${char.backstory}\n\nBuild a complete character profile: Visual Description, Personality Deep Dive, Signature Voice & Dialogue Style, Backstory Arc, Cinematic AI Image Prompt, and brand connection.`;
    const { text, insufficientCredits } = await callClaude(
      "You are the Becoming HER Character Architect. Build rich, cinematic characters in luxury editorial prose — specific, emotional, real.",
      userMsg,
      photos.map(p => ({ base64: p.base64, type: p.type })),
      "character-creation"
    );
    setLoading(false);
    if (insufficientCredits) { setCreditError(true); return; }
    setResult(text);
    refreshCredits();
    if (text) saveGeneration(userId, char.name||"Character", "character", text);
  }

  return (
    <div className="module-content">
      <ModuleHeader icon="◉" color="#c77dff" title="Character Builder" subtitle="Build the alter egos, personas, and characters that live inside your brand universe." />
      <div className="two-col">
        <div>
          <FieldGroup label="Character Name"><Input value={char.name} onChange={v => update("name",v)} placeholder="e.g. Storme, Velvet, Nova…" /></FieldGroup>
          <FieldGroup label="Appearance"><Textarea value={char.appearance} onChange={v => update("appearance",v)} placeholder="Skin, hair, eyes, body, style…" /></FieldGroup>
          <FieldGroup label="Personality"><Textarea value={char.personality} onChange={v => update("personality",v)} placeholder="Energy, traits, how she moves…" /></FieldGroup>
        </div>
        <div>
          <FieldGroup label="Voice & Tone"><Input value={char.voice} onChange={v => update("voice",v)} placeholder="How does she speak?" /></FieldGroup>
          <FieldGroup label="Backstory"><Textarea value={char.backstory} onChange={v => update("backstory",v)} placeholder="Where did she come from?" /></FieldGroup>
          <FieldGroup label="Reference Photos (optional)">
            <div className="photo-row">
              {photos.map((p,i) => <div key={i} className="photo-thumb"><img src={p.preview} alt="" /><button className="photo-x" onClick={() => setPhotos(prev => prev.filter((_,j) => j!==i))}>×</button></div>)}
              {photos.length < 4 && <div className="photo-add" onClick={() => fileRef.current?.click()}>+</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
          </FieldGroup>
        </div>
      </div>
      <CTAButton onClick={generate} loading={loading} loadingText="Building her… (15 credits)" color="purple">◉  Build Character <span className="credit-cost">15 credits</span></CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {result && <ResultCard accentColor="#c77dff"><div className="prose">{result}</div></ResultCard>}
    </div>
  );
}

// ─── Module 3 — Brand Vault (Pro+) ───────────────────────────────────────────

function BrandVault({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [vault, setVault]   = useState({ colors:"", fonts:"", messaging:"" });
  const [result, setResult] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [creditError, setCreditError] = useState(false);

  async function generate() {
    setLoading(true); setResult(null); setCreditError(false);
    const data = await callClaudeJSON(
      "You are a luxury brand strategist for Becoming HER Studio. Generate a complete brand system. Return JSON: { palette: [{name, hex, use}], fonts: [{name, style, use}], taglines: [string], messagingPillars: [string], voiceGuide: string }",
      `${profileContext(profile)}\nColors: ${vault.colors} | Fonts: ${vault.fonts} | Messaging: ${vault.messaging}`,
      "brand-vault"
    );
    setLoading(false);
    if (data?._insufficientCredits) { setCreditError(true); return; }
    setResult(data);
    refreshCredits();
    if (data) saveGeneration(userId, "Brand Vault", "vault", JSON.stringify(data));
  }

  return (
    <div className="module-content">
      <ModuleHeader icon="⬡" color="#e8c97e" title="Brand Vault" subtitle="Your complete brand system — colors, fonts, messaging, and voice — all connected to your Becoming Profile." />
      <div className="two-col">
        <FieldGroup label="Color Direction"><Input value={vault.colors} onChange={v => setVault(p=>({...p,colors:v}))} placeholder="Any colors already in mind?" /></FieldGroup>
        <FieldGroup label="Font Vibe"><Input value={vault.fonts} onChange={v => setVault(p=>({...p,fonts:v}))} placeholder="e.g. Serif, editorial, modern luxury…" /></FieldGroup>
        <FieldGroup label="Messaging Notes"><Textarea value={vault.messaging} onChange={v => setVault(p=>({...p,messaging:v}))} placeholder="Any key messages already in your head?" /></FieldGroup>
      </div>
      <CTAButton onClick={generate} loading={loading} loadingText="Building your vault… (15 credits)" color="gold">⬡  Generate Brand System <span className="credit-cost">15 credits</span></CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {result && (
        <div className="vault-result">
          {result.palette && <div className="vault-section"><div className="vault-label">Color Palette</div><div className="color-swatches">{result.palette.map((c,i) => <div key={i} className="swatch"><div className="swatch-color" style={{ background:c.hex }} /><div className="swatch-name">{c.name}</div><div className="swatch-hex">{c.hex}</div><div className="swatch-use">{c.use}</div></div>)}</div></div>}
          {result.fonts && <div className="vault-section"><div className="vault-label">Typography System</div><div className="font-grid">{result.fonts.map((f,i) => <div key={i} className="font-card"><div className="font-name">{f.name}</div><div className="font-style">{f.style}</div><div className="font-use">{f.use}</div></div>)}</div></div>}
          {result.taglines && <div className="vault-section"><div className="vault-label">Signature Taglines</div>{result.taglines.map((t,i) => <div key={i} className="tagline-item">"{t}"</div>)}</div>}
          {result.messagingPillars && <div className="vault-section"><div className="vault-label">Messaging Pillars</div><div className="pillars-grid">{result.messagingPillars.map((p,i) => <div key={i} className="pillar-card">{p}</div>)}</div></div>}
          {result.voiceGuide && <div className="vault-section"><div className="vault-label">Voice Guide</div><div className="prose">{result.voiceGuide}</div></div>}
        </div>
      )}
    </div>
  );
}

// ─── Module 4 — Content Studio (Creator+) ────────────────────────────────────

const CONTENT_FORMATS   = ["Reel Hook","Caption","Carousel Outline","Content Calendar","Email Subject","Story Sequence","Thread/Carousel Copy"];
const CONTENT_PLATFORMS = ["Instagram","TikTok","Facebook","LinkedIn","Fanvue","YouTube"];

function ContentStudio({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [format, setFormat]   = useState("Reel Hook");
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic]     = useState("");
  const [result, setResult]   = useState("");
  const [scores, setScores]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [creditError, setCreditError] = useState(false);

  async function generate() {
    setLoading(true); setResult(""); setScores(null); setCreditError(false);
    const ctx    = profileContext(profile);
    const action = CONTENT_ACTION_MAP[format] || "content-caption";

    if (format === "Content Calendar") {
      const data = await callClaudeJSON(
        "Generate a 7-day content calendar. Return JSON: { days: [{day, platform, format, topic, hook, caption, hashtags}] }",
        `${ctx}\nPlatform: ${platform}\nFocus: ${topic||"aligned with my brand"}`,
        action
      );
      setLoading(false);
      if (data?._insufficientCredits) { setCreditError(true); return; }
      if (data?.days) {
        setResult(JSON.stringify(data.days));
        saveGeneration(userId,"Content Calendar","content",JSON.stringify(data.days));
        refreshCredits();
      }
      return;
    }

    const data = await callClaudeJSON(
      `Generate ${format} content then score it. Return JSON: { content: string, hookScore: number, emotionalScore: number, clarityScore: number, viralScore: number, note: string }`,
      `${ctx}\nPlatform: ${platform}\nFormat: ${format}\nTopic: ${topic}`,
      action
    );
    setLoading(false);
    if (data?._insufficientCredits) { setCreditError(true); return; }
    if (data) {
      setResult(data.content||"");
      setScores(data);
      saveGeneration(userId, topic.slice(0,60)||format, "content", data.content||"");
      refreshCredits();
    }
  }

  let calendarDays = [];
  if (format==="Content Calendar"&&result) { try { calendarDays=JSON.parse(result); } catch {} }

  const creditCost = format === "Content Calendar" ? 3
    : ["Story Sequence"].includes(format) ? 5
    : ["Carousel Outline","Thread/Carousel Copy"].includes(format) ? 3
    : 1;

  return (
    <div className="module-content">
      <ModuleHeader icon="◐" color="#4cc9f0" title="Content Studio" subtitle="Every caption, hook, and calendar is built from your Becoming Profile. No more generic content." />
      <FieldGroup label="Content Format"><Chips options={CONTENT_FORMATS} value={format} onChange={setFormat} /></FieldGroup>
      <FieldGroup label="Platform"><Chips options={CONTENT_PLATFORMS} value={platform} onChange={setPlatform} /></FieldGroup>
      <FieldGroup label="Topic / Angle"><Textarea value={topic} onChange={setTopic} placeholder="What's the story, message, or moment?" rows={2} /></FieldGroup>
      <CTAButton onClick={generate} loading={loading} loadingText={`Generating… (${creditCost} credit${creditCost!==1?"s":""})`} color="teal">
        ◐  Generate Content <span className="credit-cost">{creditCost} credit{creditCost!==1?"s":""}</span>
      </CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {calendarDays.length > 0 && <div className="calendar-grid">{calendarDays.map((d,i) => <div key={i} className="calendar-card"><div className="cal-day">Day {d.day}</div><div className="cal-platform">{d.platform} · {d.format}</div><div className="cal-topic">{d.topic}</div><div className="cal-hook">"{d.hook}"</div>{d.hashtags&&<div className="cal-tags">{d.hashtags}</div>}</div>)}</div>}
      {result&&!calendarDays.length && (
        <ResultCard accentColor="#4cc9f0">
          <div className="content-output">{result}</div>
          {scores&&<div className="score-row">{[["Hook",scores.hookScore],["Emotion",scores.emotionalScore],["Clarity",scores.clarityScore],["Viral",scores.viralScore]].map(([label,val]) => <div key={label} className="score-chip"><div className="score-val">{val||"—"}</div><div className="score-label">{label}</div></div>)}</div>}
          {scores?.note&&<div className="score-note">◉ {scores.note}</div>}
        </ResultCard>
      )}
    </div>
  );
}

// ─── Module 5 — Storyboard Studio (Studio only) ──────────────────────────────

const AI_TOOLS = [
  { id:"higgsfield", label:"Higgsfield", desc:"Cinematic motion & character animation", color:"#f72585" },
  { id:"nanobanana", label:"Nano Banana", desc:"AI video generation & scene building",  color:"#c77dff" },
  { id:"kling",      label:"Kling",      desc:"High-quality text-to-video generation",  color:"#7b2fff" },
  { id:"seedance",   label:"Seedance",   desc:"Dynamic scene & dance video AI",         color:"#4cc9f0" },
];

function StoryboardStudio({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [tool, setTool]   = useState("higgsfield");
  const [scene, setScene] = useState("");
  const [mood, setMood]   = useState("Cinematic Luxury");
  const [shots, setShots] = useState("3");
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [creditError, setCreditError] = useState(false);
  const MOODS = ["Cinematic Luxury","Soft Dramatic","Editorial Power","Intimate Close-Up","Action Sequence","Slow Reveal","Dark Romance"];
  const activeTool = AI_TOOLS.find(t => t.id===tool);

  async function generate() {
    setLoading(true); setResult(null); setCreditError(false);
    const data = await callClaudeJSON(
      `You are a cinematic director for Becoming HER Studio. Generate a storyboard for ${activeTool.label}. Return JSON: { title, concept, shots: [{shotNumber, description, camera, lighting, duration, prompt}], directorNote, colorGrade, musicMood }`,
      `${profileContext(profile)}\nScene: ${scene}\nMood: ${mood}\nShots: ${shots}\nTool: ${activeTool.label}`,
      "storyboard-generation"
    );
    setLoading(false);
    if (data?._insufficientCredits) { setCreditError(true); return; }
    setResult(data);
    refreshCredits();
    if (data) saveGeneration(userId, data.title||scene.slice(0,60)||"Storyboard","storyboard",JSON.stringify(data));
  }

  return (
    <div className="module-content">
      <ModuleHeader icon="◫" color="#7b2fff" title="Storyboard Studio" subtitle="Build cinematic shot sequences optimized for Higgsfield, Kling, Nano Banana, and Seedance." />
      <FieldGroup label="AI Video Tool">
        <div className="tool-grid">
          {AI_TOOLS.map(t => <div key={t.id} className={`tool-card ${tool===t.id?"tool-on":""}`} onClick={() => setTool(t.id)} style={{ "--tc":t.color }}><div className="tool-name" style={{ color:t.color }}>{t.label}</div><div className="tool-desc">{t.desc}</div></div>)}
        </div>
      </FieldGroup>
      <FieldGroup label="Scene Concept"><Textarea value={scene} onChange={setScene} placeholder="What's the scene? The feeling? The story beat?" /></FieldGroup>
      <div className="two-col">
        <FieldGroup label="Visual Mood"><Chips options={MOODS} value={mood} onChange={setMood} /></FieldGroup>
        <FieldGroup label="Number of Shots"><Chips options={["3","5","7","10"]} value={shots} onChange={setShots} /></FieldGroup>
      </div>
      <CTAButton onClick={generate} loading={loading} loadingText="Directing the scene… (10 credits)" color="purple">◫  Generate Storyboard <span className="credit-cost">10 credits</span></CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {result && (
        <div className="storyboard-result">
          <div className="sb-header">
            <div className="sb-title">{result.title}</div>
            <div className="sb-concept">{result.concept}</div>
            <div className="sb-meta">{result.colorGrade&&<span>🎨 {result.colorGrade}</span>}{result.musicMood&&<span>♪ {result.musicMood}</span>}<span style={{ color:activeTool.color }}>⬡ {activeTool.label}</span></div>
          </div>
          {result.shots&&<div className="shots-list">{result.shots.map((s,i) => <div key={i} className="shot-card"><div className="shot-num">SHOT {s.shotNumber||i+1}</div><div className="shot-desc">{s.description}</div><div className="shot-meta">{s.camera&&<span>📷 {s.camera}</span>}{s.lighting&&<span>💡 {s.lighting}</span>}{s.duration&&<span>⏱ {s.duration}</span>}</div>{s.prompt&&<div className="shot-prompt">AI Prompt: "{s.prompt}"</div>}</div>)}</div>}
          {result.directorNote&&<div className="director-note">◫ Director's Note: {result.directorNote}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Module 6 — Script Studio (Creator+) ─────────────────────────────────────

function ScriptStudio({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [format, setFormat]   = useState("Instagram Reel");
  const [topic, setTopic]     = useState("");
  const [duration, setDuration] = useState("60 seconds");
  const [result, setResult]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [creditError, setCreditError] = useState(false);
  const FORMATS   = ["YouTube Video","YouTube Short","Instagram Reel","TikTok","Course Lesson","Podcast Intro","Sales Video"];
  const DURATIONS = ["15 seconds","30 seconds","60 seconds","3 minutes","5 minutes","10 minutes","Full Lesson"];

  async function generate() {
    setLoading(true); setResult(""); setCreditError(false);
    const { text, insufficientCredits } = await callClaude(
      "You are the Becoming HER Script Studio AI — a cinematic scriptwriter. Every script matches the creator's voice. Format with clear HOOK, BODY, and CALL TO ACTION sections.",
      `${profileContext(profile)}\nFormat: ${format}\nTopic: ${topic}\nDuration: ${duration}\n\nWrite a complete, ready-to-record script.`,
      null,
      "script-generation"
    );
    setLoading(false);
    if (insufficientCredits) { setCreditError(true); return; }
    setResult(text);
    refreshCredits();
    if (text) saveGeneration(userId, topic.slice(0,60)||format, "script", text);
  }

  return (
    <div className="module-content">
      <ModuleHeader icon="◑" color="#f72585" title="Script Studio" subtitle="YouTube, Reels, Shorts, and Courses — every script written in your voice, for your audience." />
      <FieldGroup label="Script Format"><Chips options={FORMATS} value={format} onChange={setFormat} /></FieldGroup>
      <FieldGroup label="Topic / Message"><Textarea value={topic} onChange={setTopic} placeholder="What's this script about? What do you want the viewer to feel, know, or do?" /></FieldGroup>
      <FieldGroup label="Duration"><Chips options={DURATIONS} value={duration} onChange={setDuration} /></FieldGroup>
      <CTAButton onClick={generate} loading={loading} loadingText="Writing your script… (5 credits)" color="pink">◑  Generate Script <span className="credit-cost">5 credits</span></CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {result && <ResultCard accentColor="#f72585"><div className="script-output">{result}</div></ResultCard>}
    </div>
  );
}

// ─── Module 7 — Project Vault (Creator+) ─────────────────────────────────────

function ProjectVault({ userId }) {
  const [projects, setProjects] = useState([]);
  const [newName, setNewName]   = useState("");
  const [newType, setNewType]   = useState("Content");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const sb = createClient();
    sb.from("projects").select("id,name,type,created_at").eq("user_id",userId).order("created_at",{ ascending:false })
      .then(({ data }) => { if (data) setProjects(data); setLoading(false); });
  }, [userId]);

  async function addProject() {
    if (!newName||!userId) return;
    const sb = createClient();
    const { data } = await sb.from("projects").insert({ user_id:userId, name:newName, type:newType, content:{} }).select("id,name,type,created_at").single();
    if (data) setProjects(p => [data,...p]);
    setNewName("");
  }

  const TYPE_COLORS = { Content:"#4cc9f0", Brand:"#e8c97e", Script:"#f72585", Character:"#c77dff", Storyboard:"#7b2fff" };

  return (
    <div className="module-content">
      <ModuleHeader icon="▣" color="#c77dff" title="Project Vault" subtitle="Every generation saved, organized, and searchable. Your creative archive lives here." />
      <div className="new-project-row">
        <Input value={newName} onChange={setNewName} placeholder="New project name…" />
        <Chips options={["Content","Brand","Script","Character","Storyboard"]} value={newType} onChange={setNewType} />
        <CTAButton onClick={addProject} color="purple">▣  Create Project</CTAButton>
      </div>
      {loading ? <Loader text="Loading your vault…" /> : (
        <div className="projects-grid">
          {projects.map(p => {
            const color = TYPE_COLORS[p.type]||"#c77dff";
            const date  = new Date(p.created_at).toLocaleDateString("en-US",{ month:"short", year:"numeric" });
            return (
              <div key={p.id} className="project-card" style={{ "--pc":color }}>
                <div className="project-accent" style={{ background:color }} />
                <div className="project-type">{p.type}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-meta"><span>{date}</span></div>
              </div>
            );
          })}
          {projects.length===0&&<p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"var(--muted)", gridColumn:"1/-1" }}>Your generations will appear here as you create.</p>}
        </div>
      )}
    </div>
  );
}

// ─── Module 8 — AI Memory Engine (Creator+) ──────────────────────────────────

function AIMemoryEngine({ userId, refreshCredits, onUpgrade, userPlan }) {
  const { profile } = useProfile();
  const [memories, setMemories] = useState([]);
  const [insight, setInsight]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [creditError, setCreditError] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const sb = createClient();
    sb.from("studio_memories").select("id,type,text,created_at").eq("user_id",userId).order("created_at",{ ascending:false })
      .then(({ data }) => { if (data) setMemories(data); });
  }, [userId]);

  async function generateInsight() {
    setLoading(true); setInsight(""); setCreditError(false);
    const { text, insufficientCredits } = await callClaude(
      "You are the Becoming HER AI Memory Engine. Analyze the creator's profile and provide 3 deep personalization insights and 3 strategic recommendations. Be specific, not generic.",
      profileContext(profile),
      null,
      "memory-insight"
    );
    setLoading(false);
    if (insufficientCredits) { setCreditError(true); return; }
    setInsight(text);
    refreshCredits();
  }

  async function addMemory() {
    if (!newMemory||!userId) return;
    const sb = createClient();
    const { data } = await sb.from("studio_memories").insert({ user_id:userId, type:"Custom", text:newMemory }).select("id,type,text,created_at").single();
    if (data) setMemories(p => [data,...p]);
    setNewMemory("");
  }
  async function deleteMemory(id) {
    const sb = createClient();
    await sb.from("studio_memories").delete().eq("id",id);
    setMemories(p => p.filter(m => m.id!==id));
  }

  const TYPE_COLORS = { Preference:"#f72585", Goal:"#4cc9f0", Brand:"#e8c97e", Custom:"#c77dff" };

  return (
    <div className="module-content">
      <ModuleHeader icon="◬" color="#4cc9f0" title="AI Memory Engine" subtitle="The more you use Becoming HER Studio, the smarter it gets. Your preferences power every generation." />
      <div className="memory-grid">
        <div>
          <div className="memory-section-label">Stored Memories</div>
          <div className="memory-list">
            {memories.map(m => <div key={m.id} className="memory-item"><span className="memory-type" style={{ color:TYPE_COLORS[m.type]||"#c77dff" }}>{m.type}</span><span className="memory-text">{m.text}</span><span className="memory-date">{new Date(m.created_at).toLocaleDateString()}</span><button className="memory-del" onClick={() => deleteMemory(m.id)}>×</button></div>)}
            {memories.length===0&&<p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"var(--muted)", fontSize:".9rem" }}>No memories yet — add one below.</p>}
          </div>
          <div className="memory-add-row">
            <Input value={newMemory} onChange={setNewMemory} placeholder="Add a custom memory or preference…" />
            <CTAButton onClick={addMemory} color="teal">+ Add</CTAButton>
          </div>
        </div>
        <div>
          <div className="memory-section-label">Profile Completeness</div>
          {Object.entries(profile).map(([section,data]) => {
            const filled=Object.values(data).filter(Boolean).length;
            const total=Object.keys(data).length;
            const pct=Math.round((filled/total)*100);
            return <div key={section} className="completeness-row"><span className="comp-label">{section.charAt(0).toUpperCase()+section.slice(1)}</span><div className="comp-bar-wrap"><div className="comp-bar" style={{ width:pct+"%", background:pct===100?"#4cc9f0":pct>50?"#c77dff":"#f72585" }} /></div><span className="comp-pct">{pct}%</span></div>;
          })}
        </div>
      </div>
      <CTAButton onClick={generateInsight} loading={loading} loadingText="Reading your profile… (3 credits)" color="teal">◬  Generate AI Insights <span className="credit-cost">3 credits</span></CTAButton>
      {creditError && <OutOfCreditsPrompt userPlan={userPlan} onUpgrade={onUpgrade} />}
      {insight&&<ResultCard accentColor="#4cc9f0"><div className="prose">{insight}</div></ResultCard>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ setActive, profile, credits }) {
  const filled=Object.values(profile).reduce((a,s)=>a+Object.values(s).filter(Boolean).length,0);
  const total=Object.values(profile).reduce((a,s)=>a+Object.keys(s).length,0);
  const pct=Math.round((filled/total)*100);
  const isNew=pct<20;
  return (
    <div className="dashboard">
      <div className="dash-hero">
        <div className="dash-eyebrow">Becoming HER Studio</div>
        <h1 className="dash-title">{profile.identity.name?`Welcome back, ${profile.identity.name.split(" ")[0]}.`:"Welcome to Your Studio."}</h1>
        <p className="dash-sub">
          {isNew ? "Start with your Becoming Profile — it powers everything else in the studio."
                 : `Your profile is ${pct}% complete. Every module is pulling from it.`}
        </p>
        {isNew && <CTAButton onClick={() => setActive("profile")} color="pink">◈  Complete Your Becoming Profile →</CTAButton>}
      </div>

      {/* Credit summary on dashboard */}
      {credits.plan !== "free" && (
        <div className="dash-credits-summary">
          <div className="dcs-plan">{PLAN_NAMES[credits.plan] || credits.plan} Plan</div>
          <div className="dcs-bar-wrap">
            <div className="dcs-bar" style={{ width: `${Math.min(100, (credits.remaining / (PLAN_CREDITS[credits.plan] || 100)) * 100)}%` }} />
          </div>
          <div className="dcs-label">
            <span>{credits.remaining} credits remaining</span>
            <span>{PLAN_CREDITS[credits.plan] || 0} per month</span>
          </div>
        </div>
      )}

      <div className="dash-grid">
        {NAV.map(n => {
          const required = MODULE_MIN_PLAN[n.id] ?? "creator";
          const locked   = !planAtLeast(credits.plan, required);
          return (
            <div key={n.id} className={`dash-card ${locked?"dash-card-locked":""}`} onClick={() => setActive(n.id)} style={{ "--dc":n.color }}>
              <span className="dash-icon" style={{ color: locked ? "var(--muted)" : n.color }}>{n.icon}</span>
              <div className="dash-card-name">{n.label}</div>
              {locked
                ? <div className="dash-card-lock">🔒 {PLAN_NAMES[required]}</div>
                : <div className="dash-card-arrow">→</div>}
            </div>
          );
        })}
      </div>

      {profile.brand.brandName && (
        <div className="dash-profile-strip">
          <span style={{ color:"var(--muted)",fontSize:".6rem",letterSpacing:".2em",textTransform:"uppercase" }}>Active Brand</span>
          <span style={{ color:"var(--cream)",fontFamily:"'Playfair Display',serif",fontSize:"1.1rem" }}>{profile.brand.brandName}</span>
          {profile.brand.tone && <span style={{ color:"var(--lavender)",fontSize:".7rem" }}>{profile.brand.tone}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function StudioOS({ user }) {
  const [profile, setProfile]     = useState(DEFAULT_PROFILE);
  const [active, setActive]       = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [credits, setCredits]     = useState({ remaining: 0, plan: "free", usedTotal: 0 });
  const [creditsLoaded, setCreditsLoaded] = useState(false);

  const userId = user?.id ?? null;

  // ── Load profile from Supabase ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const sb = createClient();
    sb.from("profiles").select("identity,brand,audience,visual,voice,goals").eq("user_id",userId).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setProfile(p => ({
          identity: data.identity||p.identity, brand:    data.brand   ||p.brand,
          audience: data.audience||p.audience, visual:   data.visual  ||p.visual,
          voice:    data.voice   ||p.voice,    goals:    data.goals   ||p.goals,
        }));
      });
  }, [userId]);

  // ── Fetch credit balance ────────────────────────────────────────────────────
  async function refreshCredits() {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const d = await res.json();
        setCredits({ remaining: d.remaining, plan: d.plan, usedTotal: d.usedTotal || 0 });
        setCreditsLoaded(true);
      }
    } catch {}
  }

  useEffect(() => { if (userId) refreshCredits(); }, [userId]);

  // ── Stripe upgrade redirect ─────────────────────────────────────────────────
  async function handleUpgrade(plan) {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, userId, email: user?.email }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  // ── Derived credit state ────────────────────────────────────────────────────
  const planMax  = PLAN_CREDITS[credits.plan] || 100;
  const lowCredit = creditsLoaded && credits.plan !== "free" && credits.remaining > 0 && credits.remaining <= planMax * 0.2;
  const outOfCredits = creditsLoaded && credits.plan !== "free" && credits.remaining === 0;

  function canAccess(moduleId) {
    const required = MODULE_MIN_PLAN[moduleId] ?? "creator";
    return planAtLeast(credits.plan, required);
  }

  const mp = { userId, userPlan: credits.plan, refreshCredits, onUpgrade: handleUpgrade };

  const MODULES = {
    dashboard:  <Dashboard setActive={setActive} profile={profile} credits={credits} />,
    profile:    canAccess("profile")    ? <BecomingProfile  {...mp} />                                          : <LockedModuleView moduleId="profile"    userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    character:  canAccess("character")  ? <CharacterBuilder {...mp} />                                          : <LockedModuleView moduleId="character"  userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    vault:      canAccess("vault")      ? <BrandVault       {...mp} />                                          : <LockedModuleView moduleId="vault"      userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    content:    canAccess("content")    ? <ContentStudio    {...mp} />                                          : <LockedModuleView moduleId="content"    userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    storyboard: canAccess("storyboard") ? <StoryboardStudio {...mp} />                                          : <LockedModuleView moduleId="storyboard" userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    script:     canAccess("script")     ? <ScriptStudio     {...mp} />                                          : <LockedModuleView moduleId="script"     userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    projects:   canAccess("projects")   ? <ProjectVault     userId={userId} />                                  : <LockedModuleView moduleId="projects"   userPlan={credits.plan} onUpgrade={handleUpgrade} />,
    memory:     canAccess("memory")     ? <AIMemoryEngine   {...mp} />                                          : <LockedModuleView moduleId="memory"     userPlan={credits.plan} onUpgrade={handleUpgrade} />,
  };

  const activeNav = NAV.find(n => n.id === active);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#08040f;--deep:#0f0820;--card:#160d2a;--card2:#1e1238;--border:#2a1850;--pink:#f72585;--purple:#7b2fff;--violet:#b5179e;--lavender:#c77dff;--teal:#4cc9f0;--gold:#e8c97e;--cream:#f0e6ff;--text:#c2aee0;--muted:#7a6096;--sidebar-w:240px}
        body{background:var(--black);color:var(--text);font-family:'DM Mono',monospace;overflow-x:hidden}
        .studio{display:flex;min-height:100vh;position:relative}
        .studio::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 50% 60% at 0% 0%,rgba(247,37,133,.14) 0%,transparent 55%),radial-gradient(ellipse 40% 50% at 100% 30%,rgba(123,47,255,.16) 0%,transparent 55%),radial-gradient(ellipse 35% 40% at 50% 100%,rgba(76,201,240,.08) 0%,transparent 55%)}
        .sidebar{width:var(--sidebar-w);flex-shrink:0;background:rgba(15,8,32,.9);backdrop-filter:blur(20px);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:50;transition:transform .3s ease}
        .sidebar.closed{transform:translateX(-100%)}
        .sidebar-brand{padding:1.5rem 1.25rem 1rem;border-bottom:1px solid var(--border)}
        .sidebar-logo{font-family:'Playfair Display',serif;font-size:.95rem;color:var(--cream);letter-spacing:.03em;line-height:1.2}
        .sidebar-logo em{font-style:italic;color:var(--lavender)}
        .sidebar-tagline{font-size:.5rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin-top:.3rem}
        .sidebar-profile{padding:.75rem 1.25rem;border-bottom:1px solid var(--border)}
        .profile-badge{display:flex;align-items:center;gap:.75rem}
        .profile-badge-ring{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:conic-gradient(var(--pink) var(--pct),var(--border) 0);display:flex;align-items:center;justify-content:center;font-size:.55rem;color:var(--cream);font-weight:500;position:relative}
        .profile-badge-ring::before{content:'';position:absolute;inset:4px;border-radius:50%;background:var(--deep)}
        .profile-badge-ring span{position:relative;z-index:1}
        .profile-badge-name{font-size:.7rem;color:var(--cream);line-height:1.2}
        .profile-badge-sub{font-size:.5rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
        .sidebar-nav{flex:1;overflow-y:auto;padding:.75rem 0}
        .sidebar-nav::-webkit-scrollbar{width:3px}
        .sidebar-nav::-webkit-scrollbar-thumb{background:var(--border)}
        .nav-item{display:flex;align-items:center;gap:.75rem;padding:.7rem 1.25rem;cursor:pointer;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);transition:all .2s;border-left:2px solid transparent}
        .nav-item:hover{color:var(--cream);background:rgba(255,255,255,.03)}
        .nav-item.active{color:var(--cream);border-left-color:var(--active-color,var(--pink));background:rgba(255,255,255,.04)}
        .nav-item.nav-locked{opacity:.45;cursor:pointer}
        .nav-item.nav-locked:hover{color:var(--muted)}
        .nav-icon{font-size:1rem;flex-shrink:0}
        .nav-lock{font-size:.65rem;margin-left:auto;opacity:.6}
        .sidebar-footer{padding:1rem 1.25rem;border-top:1px solid var(--border);font-size:.5rem;letter-spacing:.25em;text-transform:uppercase;color:var(--border)}
        .main{flex:1;margin-left:var(--sidebar-w);position:relative;z-index:1;min-height:100vh;transition:margin-left .3s}
        .main.full{margin-left:0}

        /* ── Topbar ─────────────────────────────────────────────────────────── */
        .topbar{position:sticky;top:0;z-index:40;background:rgba(8,4,15,.8);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:.9rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .topbar-left{display:flex;align-items:center;gap:.75rem}
        .topbar-toggle{background:none;border:none;cursor:pointer;color:var(--muted);font-size:1.1rem;padding:.2rem;transition:color .2s}
        .topbar-toggle:hover{color:var(--cream)}
        .topbar-title{font-family:'Playfair Display',serif;font-size:1rem;color:var(--cream);font-weight:400}
        .topbar-breadcrumb{font-size:.55rem;letter-spacing:.25em;text-transform:uppercase;color:var(--muted)}
        .topbar-right{display:flex;align-items:center;gap:.75rem}
        .topbar-profile-dot{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--purple));display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#fff;cursor:pointer;flex-shrink:0}

        /* Credit badge in topbar */
        .credit-badge{display:flex;align-items:center;gap:.4rem;padding:.3rem .75rem;border-radius:20px;font-size:.58rem;letter-spacing:.08em;cursor:default;transition:all .2s;border:1px solid var(--border)}
        .credit-badge.normal{background:rgba(123,47,255,.15);color:var(--lavender);border-color:rgba(123,47,255,.3)}
        .credit-badge.low{background:rgba(232,140,30,.12);color:#e8a84a;border-color:rgba(232,140,30,.35)}
        .credit-badge.empty{background:rgba(247,37,133,.12);color:var(--pink);border-color:rgba(247,37,133,.35)}
        .credit-badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .credit-badge.normal .credit-badge-dot{background:var(--lavender)}
        .credit-badge.low    .credit-badge-dot{background:#e8a84a;animation:pulse-dot 1.5s ease-in-out infinite}
        .credit-badge.empty  .credit-badge-dot{background:var(--pink);animation:pulse-dot .8s ease-in-out infinite}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}

        /* Low credit warning banner */
        .low-credit-banner{background:rgba(232,140,30,.1);border:1px solid rgba(232,140,30,.3);border-radius:2px;padding:.6rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:.6rem;letter-spacing:.08em;color:#e8a84a}
        .low-credit-banner button{background:none;border:1px solid rgba(232,140,30,.4);border-radius:1px;color:#e8a84a;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;font-family:'DM Mono',monospace;cursor:pointer;padding:.3rem .7rem;transition:all .2s}
        .low-credit-banner button:hover{background:rgba(232,140,30,.15);color:#fff}
        .out-of-credits-banner{background:rgba(247,37,133,.08);border:1px solid rgba(247,37,133,.25);border-radius:2px;padding:.6rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:.6rem;letter-spacing:.08em;color:var(--pink)}
        .out-of-credits-banner button{background:linear-gradient(135deg,var(--pink),var(--purple));border:none;border-radius:1px;color:#fff;font-size:.58rem;letter-spacing:.15em;text-transform:uppercase;font-family:'DM Mono',monospace;cursor:pointer;padding:.3rem .75rem}

        /* ── Page ─────────────────────────────────────────────────────────── */
        .page-inner{padding:2rem 1.5rem 4rem;max-width:1000px;margin:0 auto}
        .module-content{display:flex;flex-direction:column;gap:1.5rem}
        .mod-header{display:flex;align-items:flex-start;gap:1rem;margin-bottom:.5rem}
        .mod-icon{font-size:2rem;line-height:1;flex-shrink:0;margin-top:.1rem}
        .mod-title{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:400;color:var(--cream);line-height:1.1}
        .mod-sub{font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;color:var(--muted);margin-top:.3rem}

        /* ── Locked module ─────────────────────────────────────────────────── */
        .locked-module{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;gap:1rem;animation:fadeUp .4s ease}
        .locked-icon{font-size:2.5rem;margin-bottom:.5rem}
        .locked-title{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:400;color:var(--cream)}
        .locked-desc{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;color:var(--text);line-height:1.7;max-width:420px}
        .locked-desc strong{color:var(--lavender);font-style:normal}
        .locked-plan{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
        .locked-plan span{color:var(--lavender)}

        /* ── Insufficient credits prompt ───────────────────────────────────── */
        .credit-error-card{background:rgba(247,37,133,.07);border:1px solid rgba(247,37,133,.2);border-radius:2px;padding:1.5rem 2rem;margin-top:.5rem;display:flex;flex-direction:column;align-items:flex-start;gap:.75rem;animation:fadeUp .3s ease}
        .credit-error-icon{font-size:1.5rem;color:var(--pink)}
        .credit-error-title{font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--cream)}
        .credit-error-desc{font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;color:var(--text);line-height:1.6}
        .credit-error-desc strong{color:var(--lavender);font-style:normal}

        /* Credit cost label on buttons */
        .credit-cost{font-size:.5rem;opacity:.65;margin-left:.3rem;letter-spacing:.05em}

        /* ── Dashboard credit summary ────────────────────────────────────── */
        .dash-credits-summary{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.25rem 1.5rem}
        .dcs-plan{font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:var(--lavender);margin-bottom:.75rem}
        .dcs-bar-wrap{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:.6rem}
        .dcs-bar{height:100%;background:linear-gradient(90deg,var(--pink),var(--purple));border-radius:2px;transition:width .6s ease}
        .dcs-label{display:flex;justify-content:space-between;font-size:.58rem;color:var(--muted)}

        /* ── Profile tabs ─────────────────────────────────────────────────── */
        .profile-tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
        .ptab{padding:.45rem .9rem;background:none;border:1px solid var(--border);border-radius:2px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);transition:all .2s;display:flex;align-items:center;gap:.4rem}
        .ptab:hover{border-color:var(--lavender);color:var(--lavender)}
        .ptab.ptab-on{border-color:var(--pink);color:var(--cream);background:rgba(247,37,133,.1)}
        .profile-form{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        @media(max-width:640px){.profile-form{grid-template-columns:1fr}}

        /* ── Form fields ──────────────────────────────────────────────────── */
        .fg{display:flex;flex-direction:column;gap:.4rem}
        .fg-label{font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold)}
        .fi{width:100%;background:var(--card);border:1px solid var(--border);border-radius:2px;padding:.75rem .9rem;color:var(--cream);font-family:'Cormorant Garamond',serif;font-size:1rem;outline:none;transition:border-color .2s;resize:vertical}
        .fi:focus{border-color:var(--pink)}
        .fi::placeholder{color:var(--muted);font-style:italic}
        .fi-ta{min-height:70px}
        .chips{display:flex;flex-wrap:wrap;gap:.4rem}
        .chip{padding:.35rem .75rem;background:none;border:1px solid var(--border);border-radius:1px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.58rem;letter-spacing:.08em;color:var(--muted);transition:all .2s}
        .chip:hover{border-color:var(--lavender);color:var(--lavender)}
        .chip.chip-on{border-color:var(--pink);color:var(--cream);background:rgba(247,37,133,.15)}

        /* ── CTAs ──────────────────────────────────────────────────────────── */
        .cta{padding:.85rem 1.75rem;border:none;border-radius:2px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;transition:all .3s;display:inline-flex;align-items:center;gap:.6rem;align-self:flex-start}
        .cta:disabled{opacity:.5;cursor:not-allowed}
        .cta-pink{background:linear-gradient(135deg,var(--pink),var(--violet));color:#fff}
        .cta-pink:hover:not(:disabled){box-shadow:0 4px 25px rgba(247,37,133,.45);transform:translateY(-1px)}
        .cta-purple{background:linear-gradient(135deg,var(--violet),var(--purple));color:#fff}
        .cta-purple:hover:not(:disabled){box-shadow:0 4px 25px rgba(123,47,255,.45);transform:translateY(-1px)}
        .cta-gold{background:linear-gradient(135deg,#b8860b,var(--gold));color:#0a0612}
        .cta-gold:hover:not(:disabled){box-shadow:0 4px 25px rgba(232,201,126,.3);transform:translateY(-1px)}
        .cta-teal{background:linear-gradient(135deg,#2a7a9b,var(--teal));color:#0a0612}
        .cta-teal:hover:not(:disabled){box-shadow:0 4px 25px rgba(76,201,240,.35);transform:translateY(-1px)}
        .cta-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Results ──────────────────────────────────────────────────────── */
        .result-card{background:var(--card);border:1px solid var(--border);border-left:2px solid var(--pink);border-radius:2px;padding:1.75rem;animation:fadeUp .4s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .prose{font-family:'Cormorant Garamond',serif;font-size:1.05rem;line-height:1.85;color:var(--cream);white-space:pre-wrap}

        /* ── Layout helpers ───────────────────────────────────────────────── */
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
        @media(max-width:640px){.two-col{grid-template-columns:1fr}}
        .photo-row{display:flex;gap:.6rem;flex-wrap:wrap}
        .photo-thumb{position:relative;width:80px;height:80px;border-radius:2px;overflow:hidden;border:1px solid var(--border)}
        .photo-thumb img{width:100%;height:100%;object-fit:cover}
        .photo-x{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.7);border:none;color:var(--cream);font-size:.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .photo-add{width:80px;height:80px;border:1px dashed var(--border);border-radius:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:1.4rem;transition:all .2s}
        .photo-add:hover{border-color:var(--pink);color:var(--pink)}
        .loader-wrap{display:flex;align-items:center;gap:.75rem;padding:1rem 0}
        .loader-ring{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--pink);border-radius:50%;animation:spin .7s linear infinite}
        .loader-text{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}

        /* ── Dashboard ────────────────────────────────────────────────────── */
        .dashboard{display:flex;flex-direction:column;gap:1.5rem}
        .dash-hero{padding:1rem 0 .5rem}
        .dash-eyebrow{font-size:.55rem;letter-spacing:.4em;text-transform:uppercase;color:var(--pink);margin-bottom:.5rem}
        .dash-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:400;color:var(--cream);line-height:1.1;margin-bottom:.75rem}
        .dash-sub{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;color:var(--muted);margin-bottom:1.25rem}
        .dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
        .dash-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.25rem;cursor:pointer;transition:all .25s;display:flex;flex-direction:column;gap:.5rem;position:relative;overflow:hidden}
        .dash-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--dc,var(--pink));opacity:0;transition:opacity .25s}
        .dash-card:hover:not(.dash-card-locked){border-color:var(--dc,var(--pink));transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.3)}
        .dash-card:hover:not(.dash-card-locked)::after{opacity:1}
        .dash-card-locked{background:rgba(22,13,42,.5);border-color:rgba(42,24,80,.5)}
        .dash-icon{font-size:1.3rem}
        .dash-card-name{font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text)}
        .dash-card-arrow{font-size:.75rem;color:var(--muted);margin-top:auto}
        .dash-card-lock{font-size:.52rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-top:auto;opacity:.6}
        .dash-profile-strip{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1.5rem}

        /* ── Vault ─────────────────────────────────────────────────────────── */
        .vault-result{display:flex;flex-direction:column;gap:1.5rem;animation:fadeUp .4s ease}
        .vault-section{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.5rem}
        .vault-label{font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem}
        .color-swatches{display:flex;flex-wrap:wrap;gap:.75rem}
        .swatch{display:flex;flex-direction:column;align-items:center;gap:.3rem;width:80px}
        .swatch-color{width:60px;height:60px;border-radius:2px;border:1px solid var(--border)}
        .swatch-name{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cream);text-align:center}
        .swatch-hex{font-size:.52rem;color:var(--muted);font-family:'DM Mono',monospace}
        .swatch-use{font-size:.5rem;color:var(--muted);text-align:center;line-height:1.3}
        .font-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem}
        .font-card{background:var(--card2);border:1px solid var(--border);padding:1rem;border-radius:2px}
        .font-name{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--cream);margin-bottom:.25rem}
        .font-style{font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lavender)}
        .font-use{font-size:.65rem;color:var(--muted);margin-top:.3rem;font-style:italic}
        .tagline-item{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:var(--cream);padding:.5rem 0;border-bottom:1px solid var(--border)}
        .tagline-item:last-child{border-bottom:none}
        .pillars-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.75rem}
        .pillar-card{background:var(--card2);border:1px solid var(--border);border-left:2px solid var(--pink);padding:.75rem 1rem;font-family:'Cormorant Garamond',serif;font-size:.95rem;color:var(--text);line-height:1.5;border-radius:2px}

        /* ── Content ──────────────────────────────────────────────────────── */
        .content-output{font-family:'Cormorant Garamond',serif;font-size:1.05rem;line-height:1.85;color:var(--cream);white-space:pre-wrap;margin-bottom:1rem}
        .score-row{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem}
        .score-chip{background:var(--card2);border:1px solid var(--border);border-radius:2px;padding:.6rem .9rem;text-align:center;min-width:70px}
        .score-val{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--pink);line-height:1}
        .score-label{font-size:.52rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:.2rem}
        .score-note{font-size:.65rem;letter-spacing:.08em;color:var(--gold);margin-top:.75rem;padding:.6rem .9rem;background:rgba(232,201,126,.07);border-left:1px solid var(--gold)}
        .calendar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;animation:fadeUp .4s ease}
        .calendar-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.25rem}
        .cal-day{font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:var(--pink);margin-bottom:.3rem}
        .cal-platform{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:.5rem}
        .cal-topic{font-family:'Playfair Display',serif;font-size:1rem;color:var(--cream);margin-bottom:.5rem}
        .cal-hook{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.95rem;color:var(--text);margin-bottom:.5rem;line-height:1.5}
        .cal-tags{font-size:.6rem;color:var(--muted);line-height:1.6}

        /* ── Storyboard ───────────────────────────────────────────────────── */
        .storyboard-result{display:flex;flex-direction:column;gap:1.25rem;animation:fadeUp .4s ease}
        .sb-header{background:var(--card);border:1px solid var(--border);border-top:2px solid var(--purple);padding:1.5rem;border-radius:2px}
        .sb-title{font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--cream);margin-bottom:.4rem}
        .sb-concept{font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--muted);margin-bottom:.75rem;line-height:1.6}
        .sb-meta{display:flex;flex-wrap:wrap;gap:1rem;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
        .tool-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem}
        @media(min-width:640px){.tool-grid{grid-template-columns:repeat(4,1fr)}}
        .tool-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1rem;cursor:pointer;transition:all .2s}
        .tool-card:hover{border-color:var(--tc,var(--purple))}
        .tool-card.tool-on{border-color:var(--tc,var(--purple));background:rgba(123,47,255,.1)}
        .tool-name{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3rem;font-weight:500}
        .tool-desc{font-size:.6rem;color:var(--muted);line-height:1.4}
        .shots-list{display:flex;flex-direction:column;gap:.75rem}
        .shot-card{background:var(--card);border:1px solid var(--border);border-left:2px solid var(--purple);padding:1.25rem;border-radius:2px}
        .shot-num{font-size:.52rem;letter-spacing:.35em;text-transform:uppercase;color:var(--purple);margin-bottom:.4rem}
        .shot-desc{font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--cream);line-height:1.6;margin-bottom:.6rem}
        .shot-meta{display:flex;flex-wrap:wrap;gap:.75rem;font-size:.6rem;color:var(--muted);margin-bottom:.5rem}
        .shot-prompt{font-size:.65rem;font-style:italic;color:var(--lavender);padding:.5rem .75rem;background:rgba(123,47,255,.08);border-left:1px solid var(--purple);line-height:1.5}
        .director-note{font-size:.68rem;letter-spacing:.08em;color:var(--gold);padding:.75rem 1rem;background:rgba(232,201,126,.07);border-left:1px solid var(--gold)}
        .script-output{font-family:'Cormorant Garamond',serif;font-size:1.05rem;line-height:2;color:var(--cream);white-space:pre-wrap}

        /* ── Projects ─────────────────────────────────────────────────────── */
        .new-project-row{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-end;background:var(--card);border:1px solid var(--border);padding:1.25rem;border-radius:2px;margin-bottom:.5rem}
        .projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
        .project-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.5rem;position:relative;overflow:hidden;transition:all .25s}
        .project-card:hover{border-color:var(--pc,var(--pink));transform:translateY(-2px)}
        .project-accent{position:absolute;top:0;left:0;right:0;height:2px}
        .project-type{font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem}
        .project-name{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--cream);margin-bottom:.75rem}
        .project-meta{display:flex;justify-content:space-between;font-size:.6rem;color:var(--muted);margin-bottom:.75rem}

        /* ── Memory ───────────────────────────────────────────────────────── */
        .memory-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
        @media(max-width:640px){.memory-grid{grid-template-columns:1fr}}
        .memory-section-label{font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:var(--teal);margin-bottom:.75rem}
        .memory-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem}
        .memory-item{background:var(--card);border:1px solid var(--border);padding:.7rem .9rem;border-radius:2px;display:grid;grid-template-columns:auto 1fr auto auto;gap:.5rem;align-items:center}
        .memory-type{font-size:.52rem;letter-spacing:.2em;text-transform:uppercase;flex-shrink:0}
        .memory-text{font-family:'Cormorant Garamond',serif;font-size:.95rem;color:var(--text)}
        .memory-date{font-size:.52rem;color:var(--muted);flex-shrink:0}
        .memory-del{background:none;border:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:.1rem .3rem;transition:color .2s}
        .memory-del:hover{color:var(--pink)}
        .memory-add-row{display:flex;gap:.5rem;align-items:stretch}
        .completeness-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem}
        .comp-label{font-size:.58rem;letter-spacing:.1em;text-transform:capitalize;color:var(--muted);width:70px;flex-shrink:0}
        .comp-bar-wrap{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
        .comp-bar{height:100%;border-radius:2px;transition:width .6s ease}
        .comp-pct{font-size:.55rem;color:var(--lavender);width:30px;text-align:right;flex-shrink:0}

        @media(max-width:768px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.main{margin-left:0!important}.page-inner{padding:1.25rem 1rem 3rem}}
      `}</style>

      <div className="studio">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-brand">
            <div className="sidebar-logo">Becoming <em>HER</em> Studio</div>
            <div className="sidebar-tagline">AI Creator Operating System</div>
          </div>
          <div className="sidebar-profile"><ProfileBadge profile={profile} /></div>
          <nav className="sidebar-nav">
            <div
              className={`nav-item ${active==="dashboard"?"active":""}`}
              style={{ "--active-color":"#f72585" }}
              onClick={() => setActive("dashboard")}
            >
              <span className="nav-icon">⌂</span> Dashboard
            </div>
            {NAV.map(n => {
              const required = MODULE_MIN_PLAN[n.id] ?? "creator";
              const locked   = !planAtLeast(credits.plan, required);
              return (
                <div
                  key={n.id}
                  className={`nav-item ${active===n.id?"active":""} ${locked?"nav-locked":""}`}
                  style={{ "--active-color": n.color }}
                  onClick={() => setActive(n.id)}
                  title={locked ? `Requires ${PLAN_NAMES[required]} plan` : ""}
                >
                  <span className="nav-icon" style={active===n.id&&!locked?{ color:n.color }:{}}>{n.icon}</span>
                  {n.label}
                  {locked && <span className="nav-lock">🔒</span>}
                </div>
              );
            })}
          </nav>
          <div className="sidebar-footer">© 2026 Storme Luxe · Becoming Her</div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main className={`main ${!sidebarOpen?"full":""}`}>
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="topbar-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>
              <div>
                <div className="topbar-breadcrumb">Becoming HER Studio</div>
                <div className="topbar-title">{active==="dashboard"?"Dashboard":activeNav?activeNav.label:""}</div>
              </div>
            </div>
            <div className="topbar-right">
              {profile.brand.brandName && (
                <span style={{ fontSize:".6rem",letterSpacing:".15em",textTransform:"uppercase",color:"var(--muted)" }}>
                  {profile.brand.brandName}
                </span>
              )}

              {/* ── Credit balance badge ───────────────────────────────── */}
              {creditsLoaded && credits.plan !== "free" && (
                <div
                  className={`credit-badge ${outOfCredits?"empty":lowCredit?"low":"normal"}`}
                  title={`${credits.remaining} credits remaining · ${PLAN_NAMES[credits.plan] || credits.plan} plan`}
                >
                  <span className="credit-badge-dot" />
                  <span>◈ {credits.remaining.toLocaleString()} credits</span>
                </div>
              )}
              {creditsLoaded && credits.plan === "free" && (
                <button
                  className="credit-badge normal"
                  onClick={() => handleUpgrade("creator")}
                  style={{ cursor:"pointer" }}
                  title="Subscribe to start creating"
                >
                  <span className="credit-badge-dot" />
                  <span>Subscribe to create →</span>
                </button>
              )}

              <div className="topbar-profile-dot" onClick={() => setActive("profile")}>
                {profile.identity.name ? profile.identity.name[0].toUpperCase() : "◈"}
              </div>
            </div>
          </div>

          <div className="page-inner">
            {/* ── Low credit / out of credits banners ──────────────────── */}
            {lowCredit && !outOfCredits && (
              <div className="low-credit-banner">
                <span>⚠ {credits.remaining} credit{credits.remaining!==1?"s":""} remaining — {Math.round((credits.remaining / planMax) * 100)}% of your {PLAN_NAMES[credits.plan]} plan.</span>
                <button onClick={() => handleUpgrade(nextPlanUp(credits.plan))}>
                  Get more credits →
                </button>
              </div>
            )}
            {outOfCredits && (
              <div className="out-of-credits-banner">
                <span>◈ You've used all your {PLAN_NAMES[credits.plan]} credits for this period.</span>
                <button onClick={() => handleUpgrade(nextPlanUp(credits.plan))}>
                  Upgrade for more →
                </button>
              </div>
            )}

            {MODULES[active] || MODULES["dashboard"]}
          </div>
        </main>
      </div>
    </ProfileContext.Provider>
  );
}
