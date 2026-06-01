"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const CREATOR_TYPES = [
  { id: "content-creator", icon: "📱", label: "Content Creator", desc: "Build content across platforms" },
  { id: "influencer", icon: "✨", label: "Influencer", desc: "Build a personal brand and audience" },
  { id: "business-owner", icon: "💼", label: "Business Owner", desc: "Grow a business through content" },
  { id: "coach", icon: "🎯", label: "Coach / Consultant", desc: "Attract clients, build authority" },
  { id: "ai-creator", icon: "🤖", label: "AI Creator", desc: "Create digital personalities and AI brands" },
  { id: "author", icon: "📖", label: "Author / Storyteller", desc: "Create books, scripts, stories" },
  { id: "product-seller", icon: "💎", label: "Digital Product Seller", desc: "Sell courses, templates, tools" },
];

const VISUAL_STYLES = [
  { id: "soft-luxury", icon: "✨", label: "Soft Luxury", desc: "Elegant, feminine, warm" },
  { id: "high-luxury", icon: "💎", label: "High Luxury", desc: "Editorial, bold, exclusive" },
  { id: "bold", icon: "🔥", label: "Bold & Confident", desc: "Strong, powerful, direct" },
  { id: "cinematic", icon: "🎬", label: "Cinematic", desc: "Dramatic, storytelling, visual" },
  { id: "feminine", icon: "🌸", label: "Feminine", desc: "Soft, romantic, approachable" },
  { id: "minimal", icon: "🖤", label: "Minimal", desc: "Clean, modern, understated" },
];

const PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "Facebook",
  "Pinterest", "LinkedIn", "Fanvue", "Podcast"
];

const CONTENT_GOALS = [
  "Growth", "Sales", "Authority", "Community",
  "Entertainment", "Education", "Inspiration"
];

const VOICE_STYLES = [
  "Educational", "Luxury", "Inspirational", "Confident",
  "Storytelling", "Motivational", "Empowering", "Intimate",
  "Bold", "Soft"
];

const JOURNEY_TYPES = [
  { id: "personal-brand", label: "Personal Brand", icon: "✨" },
  { id: "coaching-business", label: "Coaching Business", icon: "🎯" },
  { id: "creator-business", label: "Creator Business", icon: "📱" },
  { id: "digital-empire", label: "Digital Product Empire", icon: "💎" },
  { id: "ai-influencer", label: "AI Influencer Brand", icon: "🤖" },
  { id: "faceless-brand", label: "Faceless Content Brand", icon: "🎬" },
];

const REVENUE_GOALS = [
  "$1k/month", "$5k/month", "$10k/month",
  "$50k/month", "$100k+/month"
];

const PROGRESS_STEPS = [
  "Identity", "Brand", "Visual", "Content", "Voice", "Goals", "Summary"
];

// ─── Progress Bar Component ───────────────────────────────────────────────────

function ProgressBar({ currentStep }) {
  const progress = (currentStep / 7) * 100;

  return (
    <div className="progress-container">
      <div className="progress-label">Step {currentStep} of 7</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-steps">
        {PROGRESS_STEPS.map((step, idx) => (
          <div key={step} className={`progress-step ${idx + 1 <= currentStep ? "completed" : ""}`}>
            {idx + 1 < currentStep ? "✓" : idx + 1 === currentStep ? "●" : "○"}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Who Are You Becoming ─────────────────────────────────────────────

function Step1({ value, onChange, onNext }) {
  const toggleType = (id) => {
    const updated = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(updated);
  };

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">Who Are You Becoming?</h2>
        <p className="step-subtitle">Choose what resonates. You can always evolve.</p>
      </div>
      <div className="card-grid">
        {CREATOR_TYPES.map(type => (
          <div
            key={type.id}
            className={`select-card ${value.includes(type.id) ? "selected" : ""}`}
            onClick={() => toggleType(type.id)}
          >
            {value.includes(type.id) && <div className="card-checkmark">✓</div>}
            <div className="card-icon">{type.icon}</div>
            <div className="card-label">{type.label}</div>
            <div className="card-desc">{type.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Your Brand ───────────────────────────────────────────────────────

function Step2({ value, onChange, onNext, onBack }) {
  const updateField = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">What Are You Building?</h2>
        <p className="step-subtitle">This helps personalize every AI generation.</p>
      </div>
      <div className="form-fields">
        <div className="form-field">
          <label>Brand Name</label>
          <input
            type="text"
            value={value.brandName || ""}
            onChange={e => updateField("brandName", e.target.value)}
            placeholder="e.g. Storme Luxe"
          />
        </div>
        <div className="form-field">
          <label>Tagline</label>
          <input
            type="text"
            value={value.tagline || ""}
            onChange={e => updateField("tagline", e.target.value)}
            placeholder="e.g. She didn't arrive... she became."
          />
        </div>
        <div className="form-field">
          <label>Your Niche</label>
          <input
            type="text"
            value={value.niche || ""}
            onChange={e => updateField("niche", e.target.value)}
            placeholder="e.g. AI creator education for women"
          />
        </div>
        <div className="form-field">
          <label>Target Audience</label>
          <input
            type="text"
            value={value.audience || ""}
            onChange={e => updateField("audience", e.target.value)}
            placeholder="e.g. Women 25-45 building digital brands"
          />
        </div>
        <div className="form-field">
          <label>Brand Mission</label>
          <textarea
            value={value.mission || ""}
            onChange={e => updateField("mission", e.target.value)}
            placeholder="e.g. Helping women become the next version of themselves"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Visual Identity ──────────────────────────────────────────────────

function Step3({ value, onChange, onNext, onBack }) {
  const updateField = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">How Should Your Brand Look?</h2>
        <p className="step-subtitle">Choose a visual aesthetic.</p>
      </div>
      <div className="card-grid">
        {VISUAL_STYLES.map(style => (
          <div
            key={style.id}
            className={`select-card ${value.style === style.id ? "selected" : ""}`}
            onClick={() => updateField("style", style.id)}
          >
            {value.style === style.id && <div className="card-checkmark">✓</div>}
            <div className="card-icon">{style.icon}</div>
            <div className="card-label">{style.label}</div>
            <div className="card-desc">{style.desc}</div>
          </div>
        ))}
      </div>
      <div className="form-field" style={{ marginTop: "2rem" }}>
        <label>Color Palette</label>
        <input
          type="text"
          value={value.colors || ""}
          onChange={e => updateField("colors", e.target.value)}
          placeholder="e.g. Black, crimson, gold, blush pink"
        />
      </div>
    </div>
  );
}

// ─── Step 4: Content Identity ─────────────────────────────────────────────────

function Step4({ value, onChange, onNext, onBack }) {
  const togglePlatform = (p) => {
    const updated = value.platforms?.includes(p)
      ? value.platforms.filter(v => v !== p)
      : [...(value.platforms || []), p];
    onChange({ ...value, platforms: updated });
  };

  const toggleGoal = (g) => {
    const updated = value.goals?.includes(g)
      ? value.goals.filter(v => v !== g)
      : [...(value.goals || []), g];
    onChange({ ...value, goals: updated });
  };

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">Where Do You Create?</h2>
        <p className="step-subtitle">Select all platforms that apply.</p>
      </div>
      <div className="chip-grid">
        {PLATFORMS.map(platform => (
          <div
            key={platform}
            className={`chip ${value.platforms?.includes(platform) ? "selected" : ""}`}
            onClick={() => togglePlatform(platform)}
          >
            {platform}
          </div>
        ))}
      </div>
      <div className="step-header" style={{ marginTop: "3rem" }}>
        <h3 className="step-subtitle-large">What Are Your Content Goals?</h3>
      </div>
      <div className="chip-grid">
        {CONTENT_GOALS.map(goal => (
          <div
            key={goal}
            className={`chip ${value.goals?.includes(goal) ? "selected" : ""}`}
            onClick={() => toggleGoal(goal)}
          >
            {goal}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 5: Your Voice ───────────────────────────────────────────────────────

function Step5({ value, onChange, onNext, onBack }) {
  const toggleVoice = (v) => {
    const updated = value.voice?.includes(v)
      ? value.voice.filter(x => x !== v)
      : [...(value.voice || []), v];
    onChange({ ...value, voice: updated });
  };

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">How Should Your Content Feel?</h2>
        <p className="step-subtitle">Select all that resonate.</p>
      </div>
      <div className="chip-grid">
        {VOICE_STYLES.map(voice => (
          <div
            key={voice}
            className={`chip ${value.voice?.includes(voice) ? "selected" : ""}`}
            onClick={() => toggleVoice(voice)}
          >
            {voice}
          </div>
        ))}
      </div>
      <div className="form-field" style={{ marginTop: "3rem" }}>
        <label>Signature Phrase (Optional)</label>
        <input
          type="text"
          value={value.signaturePhrase || ""}
          onChange={e => onChange({ ...value, signaturePhrase: e.target.value })}
          placeholder="e.g. She didn't arrive... she became."
        />
      </div>
    </div>
  );
}

// ─── Step 6: Your Goals ───────────────────────────────────────────────────────

function Step6({ value, onChange, onNext, onBack }) {
  const updateField = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">What Are You Building Toward?</h2>
        <p className="step-subtitle">Choose your primary journey.</p>
      </div>
      <div className="card-grid">
        {JOURNEY_TYPES.map(journey => (
          <div
            key={journey.id}
            className={`select-card ${value.journeyType === journey.id ? "selected" : ""}`}
            onClick={() => updateField("journeyType", journey.id)}
          >
            {value.journeyType === journey.id && <div className="card-checkmark">✓</div>}
            <div className="card-icon">{journey.icon}</div>
            <div className="card-label">{journey.label}</div>
          </div>
        ))}
      </div>
      <div className="form-field" style={{ marginTop: "2rem" }}>
        <label>90-Day Goal</label>
        <textarea
          value={value.ninetyDayGoal || ""}
          onChange={e => updateField("ninetyDayGoal", e.target.value)}
          placeholder="Examples:
• Launch my first digital product
• Grow to 10k followers
• Build my AI creator brand
• Start making money from content"
          rows={4}
        />
      </div>
      <div className="step-header" style={{ marginTop: "2rem" }}>
        <h3 className="step-subtitle-large">Revenue Goal</h3>
      </div>
      <div className="chip-grid">
        {REVENUE_GOALS.map(goal => (
          <div
            key={goal}
            className={`chip ${value.revenueGoal === goal ? "selected" : ""}`}
            onClick={() => updateField("revenueGoal", goal)}
          >
            {goal}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 7: Summary ──────────────────────────────────────────────────────────

function Step7({ profile, onEnter, onBack }) {
  const creatorTypes = profile.creatorTypes?.map(id =>
    CREATOR_TYPES.find(t => t.id === id)?.label
  ).filter(Boolean).join(", ") || "Not specified";

  const visualStyle = VISUAL_STYLES.find(s => s.id === profile.style)?.label || "Not specified";
  const journeyType = JOURNEY_TYPES.find(j => j.id === profile.journeyType)?.label || "Not specified";
  const voice = profile.voice?.join(", ") || "Not specified";

  return (
    <div className="step-content fade-in">
      <div className="step-header">
        <h2 className="step-title">Your Becoming Identity</h2>
        <p className="step-subtitle">This profile now powers every AI generation in your studio.</p>
      </div>

      <div className="summary-card">
        <div className="summary-row">
          <div className="summary-label">You Are Becoming</div>
          <div className="summary-value">{creatorTypes}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Brand</div>
          <div className="summary-value">{profile.brandName || "Not specified"} — {profile.niche || "Not specified"}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Visual Style</div>
          <div className="summary-value">{visualStyle}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Voice</div>
          <div className="summary-value">{voice}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Goal</div>
          <div className="summary-value">{journeyType} — {profile.revenueGoal || "Not specified"}</div>
        </div>
        {profile.mission && (
          <div className="summary-row">
            <div className="summary-label">Mission</div>
            <div className="summary-value">{profile.mission}</div>
          </div>
        )}
      </div>

      <div className="personalized-modules">
        <div className="personalized-header">Your Personalized Modules</div>
        <div className="module-list">
          <div className="module-item">✓ Content Studio</div>
          <div className="module-item">✓ Script Studio</div>
          <div className="module-item">✓ Storyboard Studio</div>
          <div className="module-item">✓ Character Builder</div>
          <div className="module-item">✓ Brand Vault</div>
          <div className="module-item">✓ AI Memory Engine</div>
        </div>
      </div>

      <div className="summary-tagline">She didn't arrive... she became.</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BecomingProfileOnboarding({ userId, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [creatorTypes, setCreatorTypes] = useState([]);
  const [brand, setBrand] = useState({});
  const [visual, setVisual] = useState({});
  const [content, setContent] = useState({});
  const [voice, setVoice] = useState({});
  const [goals, setGoals] = useState({});

  const canContinue = () => {
    if (step === 1) return creatorTypes.length > 0;
    if (step === 2) return brand.brandName && brand.niche;
    if (step === 3) return visual.style;
    if (step === 4) return content.platforms?.length > 0;
    if (step === 5) return voice.voice?.length > 0;
    if (step === 6) return goals.journeyType;
    return true;
  };

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
      await saveProgress();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const saveProgress = async () => {
    if (!userId) return;
    setSaving(true);
    const sb = createClient();

    const profileData = {
      user_id: userId,
      creator_types: creatorTypes,
      brand_name: brand.brandName,
      tagline: brand.tagline,
      niche: brand.niche,
      audience: brand.audience,
      mission: brand.mission,
      visual_style: visual.style,
      color_palette: visual.colors,
      platforms: content.platforms,
      content_goals: content.goals,
      voice_styles: voice.voice,
      signature_phrase: voice.signaturePhrase,
      journey_type: goals.journeyType,
      ninety_day_goal: goals.ninetyDayGoal,
      revenue_goal: goals.revenueGoal,
      onboarding_complete: step === 7,
    };

    await sb.from("profiles").upsert(profileData, { onConflict: "user_id" });
    setSaving(false);
  };

  const handleComplete = async () => {
    await saveProgress();
    onComplete();
  };

  const fullProfile = {
    creatorTypes,
    ...brand,
    ...visual,
    ...content,
    ...voice,
    ...goals,
  };

  return (
    <>
      <style>{`
        .progress-container { margin-bottom: 3rem; }
        .progress-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.75rem; text-align: center; }
        .progress-track { height: 6px; background: rgba(255, 45, 166, 0.1); border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #FF2DA6, #7b2fff, #D4AF37); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .progress-steps { display: flex; justify-content: space-between; gap: 0.5rem; }
        .progress-step { flex: 1; text-align: center; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 0.25rem; transition: color 0.3s; }
        .progress-step.completed { color: #FF2DA6; }
        .progress-step span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

        .step-content { max-width: 900px; margin: 0 auto; }
        .step-header { text-align: center; margin-bottom: 2.5rem; }
        .step-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 400; color: var(--cream); line-height: 1.1; margin-bottom: 1rem; }
        .step-subtitle { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-style: italic; color: var(--muted); line-height: 1.7; }
        .step-subtitle-large { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--lavender); margin-bottom: 1rem; }

        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 3rem; }
        .select-card { background: rgba(18, 3, 30, 0.85); border: 2px solid rgba(255, 45, 166, 0.15); backdrop-filter: blur(10px); border-radius: 12px; padding: 2rem 1.5rem; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); text-align: center; position: relative; min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .select-card:hover { border-color: rgba(255, 45, 166, 0.5); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(255, 45, 166, 0.2); }
        .select-card.selected { border-color: #FF2DA6; background: rgba(255, 45, 166, 0.12); box-shadow: 0 8px 40px rgba(255, 45, 166, 0.3); }
        .card-checkmark { position: absolute; top: 0.75rem; right: 0.75rem; width: 24px; height: 24px; background: #FF2DA6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem; font-weight: bold; }
        .card-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .card-label { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--cream); margin-bottom: 0.5rem; font-weight: 500; }
        .card-desc { font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; font-style: italic; color: var(--muted); line-height: 1.5; }

        .form-fields { display: flex; flex-direction: column; gap: 1.75rem; margin-bottom: 3rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-field label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #D4AF37; }
        .form-field input, .form-field textarea { width: 100%; padding: 1rem 1.25rem; background: rgba(18, 3, 30, 0.6); border: 1px solid rgba(255, 45, 166, 0.2); border-radius: 6px; color: var(--cream); font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; outline: none; transition: all 0.3s; resize: vertical; }
        .form-field input:focus, .form-field textarea:focus { border-color: #FF2DA6; background: rgba(18, 3, 30, 0.9); box-shadow: 0 0 0 3px rgba(255, 45, 166, 0.1); }
        .form-field input::placeholder, .form-field textarea::placeholder { color: var(--muted); font-style: italic; }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2rem; }
        .chip { padding: 0.75rem 1.5rem; background: rgba(18, 3, 30, 0.6); border: 1px solid rgba(255, 45, 166, 0.2); border-radius: 50px; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); cursor: pointer; transition: all 0.3s; }
        .chip:hover { border-color: rgba(255, 45, 166, 0.5); background: rgba(255, 45, 166, 0.08); }
        .chip.selected { border-color: #FF2DA6; background: rgba(255, 45, 166, 0.15); color: var(--cream); box-shadow: 0 4px 15px rgba(255, 45, 166, 0.2); }

        .summary-card { background: rgba(18, 3, 30, 0.85); border: 1px solid rgba(255, 45, 166, 0.15); backdrop-filter: blur(10px); border-radius: 12px; padding: 2.5rem; margin-bottom: 2.5rem; }
        .summary-row { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.25rem 0; border-bottom: 1px solid rgba(255, 45, 166, 0.1); }
        .summary-row:last-child { border-bottom: none; }
        .summary-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #D4AF37; }
        .summary-value { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--cream); line-height: 1.6; }

        .personalized-modules { background: linear-gradient(135deg, rgba(255, 45, 166, 0.08), rgba(123, 47, 255, 0.05)); border: 1px solid rgba(255, 45, 166, 0.2); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; }
        .personalized-header { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--lavender); margin-bottom: 1.25rem; text-align: center; }
        .module-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
        .module-item { font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text); padding: 0.5rem; }

        .summary-tagline { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-style: italic; color: var(--muted); text-align: center; margin: 2rem 0; }

        .nav-buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; gap: 1rem; }
        .cta { padding: 1rem 2.5rem; border: none; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; }
        .cta-pink { background: linear-gradient(135deg, #FF2DA6, #f72585); color: #fff; box-shadow: 0 4px 15px rgba(255, 45, 166, 0.3); }
        .cta-pink:hover:not(:disabled) { box-shadow: 0 8px 30px rgba(255, 45, 166, 0.5); transform: translateY(-2px); }
        .cta-pink:disabled { opacity: 0.5; cursor: not-allowed; }
        .cta-ghost { background: none; border: 1px solid rgba(255, 45, 166, 0.3); color: #FF2DA6; }
        .cta-ghost:hover { border-color: #FF2DA6; background: rgba(255, 45, 166, 0.08); color: var(--cream); }

        .fade-in { animation: fadeIn 0.6s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .step-title { font-size: 2rem; }
          .card-grid { grid-template-columns: 1fr; }
          .progress-steps { flex-wrap: wrap; }
          .nav-buttons { flex-direction: column-reverse; }
          .nav-buttons button { width: 100%; }
        }
      `}</style>

      <div className="onboarding-container">
        <ProgressBar currentStep={step} />

        {step === 1 && <Step1 value={creatorTypes} onChange={setCreatorTypes} onNext={handleNext} />}
        {step === 2 && <Step2 value={brand} onChange={setBrand} onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <Step3 value={visual} onChange={setVisual} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <Step4 value={content} onChange={setContent} onNext={handleNext} onBack={handleBack} />}
        {step === 5 && <Step5 value={voice} onChange={setVoice} onNext={handleNext} onBack={handleBack} />}
        {step === 6 && <Step6 value={goals} onChange={setGoals} onNext={handleNext} onBack={handleBack} />}
        {step === 7 && <Step7 profile={fullProfile} onEnter={handleComplete} onBack={handleBack} />}

        <div className="nav-buttons">
          {step > 1 && step < 7 && (
            <button className="cta cta-ghost" onClick={handleBack}>
              ← Back
            </button>
          )}
          {step < 7 ? (
            <button className="cta cta-pink" onClick={handleNext} disabled={!canContinue()}>
              {saving ? "Saving..." : "Continue →"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
              <button className="cta cta-ghost" onClick={handleBack}>
                ← Edit Profile
              </button>
              <button className="cta cta-pink" onClick={handleComplete} style={{ flex: 1 }}>
                {saving ? "Saving..." : "Enter My Studio →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
