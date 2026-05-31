"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const creatorTypes = ["Creator", "Influencer", "Author", "Coach", "Business Owner", "AI Creator"];
const visualStyles = ["Luxury", "Soft", "Bold", "Feminine", "Minimal", "Cinematic"];
const voiceStyles = ["Educational", "Inspirational", "Luxury", "Confident", "Storytelling"];

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    becoming: "",
    creatorType: "Creator",
    brandName: "",
    tagline: "",
    mission: "",
    niche: "",
    audience: "",
    platforms: "",
    goals: "",
    contentStyle: "",
    visual: "Cinematic",
    voice: "Storytelling",
  });

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      setUserId(data.user?.id ?? null);
    });
  }, [router]);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    const sb = createClient();
    await sb.from("profiles").upsert({
      user_id: userId,
      onboarding_complete: true,
      identity: {
        name: form.name,
        becoming: form.becoming,
        creatorType: form.creatorType,
      },
      brand: {
        brandName: form.brandName,
        tagline: form.tagline,
        mission: form.mission,
        niche: form.niche,
      },
      audience: {
        who: form.audience,
      },
      content: {
        platforms: form.platforms,
        goals: form.goals,
        style: form.contentStyle,
      },
      visual: {
        aesthetic: form.visual,
      },
      voice: {
        style: form.voice,
      },
      goals: {
        shortTerm: form.goals,
      },
    }, { onConflict: "user_id" });
    router.replace("/studio");
  }

  return (
    <main className="onboarding">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@300;400&family=Playfair+Display:wght@400;700&display=swap');
        *{box-sizing:border-box} body{margin:0;background:#08040f;color:#f0e6ff}
        .onboarding{min-height:100vh;background:radial-gradient(ellipse at top left,rgba(247,37,133,.16),transparent 45%),radial-gradient(ellipse at bottom right,rgba(123,47,255,.18),transparent 50%),#08040f;padding:48px 20px;font-family:'DM Mono',monospace}
        .wrap{max-width:920px;margin:0 auto}
        .eyebrow{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#4cc9f0;margin-bottom:12px}
        h1{font-family:'Playfair Display',serif;font-size:clamp(42px,8vw,76px);font-weight:400;line-height:.95;margin:0 0 14px}
        .sub{font-family:'Cormorant Garamond',serif;font-size:22px;color:#c2aee0;font-style:italic;margin:0 0 32px}
        .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        label{display:flex;flex-direction:column;gap:8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#c77dff}
        input,textarea,select{width:100%;background:#160d2a;border:1px solid #2a1850;border-radius:2px;color:#f0e6ff;padding:13px 14px;font:16px 'Cormorant Garamond',serif;outline:none}
        textarea{min-height:108px;resize:vertical}.wide{grid-column:1/-1}
        .chips{display:flex;flex-wrap:wrap;gap:8px}.chip{background:transparent;border:1px solid #2a1850;color:#c2aee0;padding:9px 12px;border-radius:2px;font:11px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.chip.on{border-color:#f72585;color:#fff;background:rgba(247,37,133,.12)}
        .actions{display:flex;justify-content:flex-end;margin-top:28px}.primary{border:0;background:linear-gradient(135deg,#b5179e,#f72585,#7b2fff);color:#fff;padding:15px 24px;border-radius:2px;font:12px 'DM Mono',monospace;letter-spacing:.22em;text-transform:uppercase;cursor:pointer}
        @media(max-width:720px){.grid{grid-template-columns:1fr}}
      `}</style>
      <div className="wrap">
        <div className="eyebrow">Becoming HER Studio</div>
        <h1>Build Your Becoming Profile</h1>
        <p className="sub">This becomes the intelligence layer behind every generation, vault, character, prompt, and project.</p>
        <div className="grid">
          <label>Name<input value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
          <label>Creator Type<select value={form.creatorType} onChange={(e) => update("creatorType", e.target.value)}>{creatorTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="wide">Who are you becoming?<textarea value={form.becoming} onChange={(e) => update("becoming", e.target.value)} /></label>
          <label>Brand Name<input value={form.brandName} onChange={(e) => update("brandName", e.target.value)} /></label>
          <label>Tagline<input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></label>
          <label className="wide">Mission<textarea value={form.mission} onChange={(e) => update("mission", e.target.value)} /></label>
          <label>Niche<input value={form.niche} onChange={(e) => update("niche", e.target.value)} /></label>
          <label>Audience<input value={form.audience} onChange={(e) => update("audience", e.target.value)} /></label>
          <label>Platforms<input value={form.platforms} onChange={(e) => update("platforms", e.target.value)} /></label>
          <label>Goals<input value={form.goals} onChange={(e) => update("goals", e.target.value)} /></label>
          <label className="wide">Content Style<input value={form.contentStyle} onChange={(e) => update("contentStyle", e.target.value)} /></label>
          <div className="wide"><label>Visual Style</label><div className="chips">{visualStyles.map((item) => <button key={item} className={`chip ${form.visual === item ? "on" : ""}`} onClick={() => update("visual", item)}>{item}</button>)}</div></div>
          <div className="wide"><label>Voice</label><div className="chips">{voiceStyles.map((item) => <button key={item} className={`chip ${form.voice === item ? "on" : ""}`} onClick={() => update("voice", item)}>{item}</button>)}</div></div>
        </div>
        <div className="actions"><button className="primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Enter Studio"}</button></div>
      </div>
    </main>
  );
}
