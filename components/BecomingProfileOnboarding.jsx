"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Step 1: Who Are You Becoming ─────────────────────────────────────────────

const CREATOR_TYPES = [
  { id: "content-creator", label: "Content Creator", desc: "Create content across social media platforms.", icon: "◈" },
  { id: "influencer", label: "Influencer", desc: "Build a personal brand and audience.", icon: "◉" },
  { id: "business-owner", label: "Business Owner", desc: "Grow and market a business.", icon: "⬡" },
  { id: "coach", label: "Coach / Consultant", desc: "Create authority and attract clients.", icon: "◐" },
  { id: "author", label: "Author / Storyteller", desc: "Build books, stories, and media.", icon: "◫" },
  { id: "ai-creator", label: "AI Creator", desc: "Build AI brands, characters, and digital products.", icon: "◬" },
];

function StepCreatorType({ value, onChange, onNext }) {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Who Are You Becoming?</h2>
        <p className="step-subtitle">Choose the path that resonates with your vision.</p>
      </div>
      <div className="creator-type-grid">
        {CREATOR_TYPES.map(t => (
          <div
            key={t.id}
            className={`creator-type-card ${value === t.id ? "selected" : ""}`}
            onClick={() => onChange(t.id)}
          >
            <div className="ct-icon">{t.icon}</div>
            <div className="ct-label">{t.label}</div>
            <div className="ct-desc">{t.desc}</div>
          </div>
        ))}
      </div>
      <button className="cta cta-pink" onClick={onNext} disabled={!value}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Build Your Brand ─────────────────────────────────────────────────

function StepBrand({ value, onChange, onNext, onBack }) {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Build Your Brand</h2>
        <p className="step-subtitle">Define the foundation of your brand.</p>
      </div>
      <div className="onboarding-form">
        <div className="ob-field">
          <label>Brand Name</label>
          <input
            type="text"
            value={value.brandName || ""}
            onChange={e => onChange({ ...value, brandName: e.target.value })}
            placeholder="e.g. Storme Luxe, Becoming Her..."
          />
        </div>
        <div className="ob-field">
          <label>Tagline</label>
          <input
            type="text"
            value={value.tagline || ""}
            onChange={e => onChange({ ...value, tagline: e.target.value })}
            placeholder="e.g. She didn't arrive… she became."
          />
        </div>
        <div className="ob-field">
          <label>Mission</label>
          <textarea
            rows={3}
            value={value.mission || ""}
            onChange={e => onChange({ ...value, mission: e.target.value })}
            placeholder="What does your brand exist to do?"
          />
        </div>
        <div className="ob-field">
          <label>Niche</label>
          <input
            type="text"
            value={value.niche || ""}
            onChange={e => onChange({ ...value, niche: e.target.value })}
            placeholder="e.g. AI creator education, luxury content..."
          />
        </div>
        <div className="ob-field">
          <label>Target Audience</label>
          <input
            type="text"
            value={value.audience || ""}
            onChange={e => onChange({ ...value, audience: e.target.value })}
            placeholder="Who are you creating for?"
          />
        </div>
      </div>
      <div className="step-nav">
        <button className="cta-ghost" onClick={onBack}>← Back</button>
        <button className="cta cta-pink" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 3: Visual Identity ──────────────────────────────────────────────────

const VISUAL_STYLES = [
  { id: "luxury", label: "Luxury", desc: "Elevated, high-end, exclusive", color: "#e8c97e" },
  { id: "soft-luxury", label: "Soft Luxury", desc: "Feminine, refined, elegant", color: "#c77dff" },
  { id: "minimal", label: "Minimal", desc: "Clean, simple, intentional", color: "#4cc9f0" },
  { id: "bold", label: "Bold", desc: "Strong, confident, striking", color: "#f72585" },
  { id: "feminine", label: "Feminine", desc: "Soft, romantic, delicate", color: "#f0e6ff" },
  { id: "cinematic", label: "Cinematic", desc: "Dramatic, story-driven, editorial", color: "#7b2fff" },
];

function StepVisualIdentity({ value, onChange, onNext, onBack }) {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Visual Identity</h2>
        <p className="step-subtitle">Teach the platform how your brand should look.</p>
      </div>
      <div className="onboarding-form">
        <div className="ob-field">
          <label>Color Palette</label>
          <input
            type="text"
            value={value.colors || ""}
            onChange={e => onChange({ ...value, colors: e.target.value })}
            placeholder="e.g. Black, crimson, gold, blush pink..."
          />
        </div>
        <div className="ob-field">
          <label>Brand Style</label>
          <div className="style-grid">
            {VISUAL_STYLES.map(s => (
              <div
                key={s.id}
                className={`style-card ${value.style === s.id ? "selected" : ""}`}
                onClick={() => onChange({ ...value, style: s.id })}
                style={{ "--style-color": s.color }}
              >
                <div className="style-label">{s.label}</div>
                <div className="style-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ob-field">
          <label>Visual Aesthetic</label>
          <input
            type="text"
            value={value.aesthetic || ""}
            onChange={e => onChange({ ...value, aesthetic: e.target.value })}
            placeholder="e.g. Cinematic noir, soft luxury, editorial..."
          />
        </div>
      </div>
      <div className="step-nav">
        <button className="cta-ghost" onClick={onBack}>← Back</button>
        <button className="cta cta-pink" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 4: Content Identity ─────────────────────────────────────────────────

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook", "Pinterest", "LinkedIn"];
const CONTENT_GOALS = ["Growth", "Sales", "Authority", "Community"];

function StepContentIdentity({ value, onChange, onNext, onBack }) {
  const togglePlatform = (p) => {
    const current = value.platforms || [];
    const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    onChange({ ...value, platforms: updated });
  };

  const toggleGoal = (g) => {
    const current = value.goals || [];
    const updated = current.includes(g) ? current.filter(x => x !== g) : [...current, g];
    onChange({ ...value, goals: updated });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Content Identity</h2>
        <p className="step-subtitle">Tell us what you create and where you create it.</p>
      </div>
      <div className="onboarding-form">
        <div className="ob-field">
          <label>Platforms (select all that apply)</label>
          <div className="toggle-grid">
            {PLATFORMS.map(p => (
              <div
                key={p}
                className={`toggle-card ${(value.platforms || []).includes(p) ? "selected" : ""}`}
                onClick={() => togglePlatform(p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="ob-field">
          <label>Content Goals (select all that apply)</label>
          <div className="toggle-grid">
            {CONTENT_GOALS.map(g => (
              <div
                key={g}
                className={`toggle-card ${(value.goals || []).includes(g) ? "selected" : ""}`}
                onClick={() => toggleGoal(g)}
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="step-nav">
        <button className="cta-ghost" onClick={onBack}>← Back</button>
        <button className="cta cta-pink" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 5: Voice & Personality ──────────────────────────────────────────────

const VOICE_OPTIONS = [
  { id: "educational", label: "Educational", desc: "Teaching and informing" },
  { id: "luxury", label: "Luxury", desc: "Elevated and refined" },
  { id: "inspirational", label: "Inspirational", desc: "Motivating and uplifting" },
  { id: "confident", label: "Confident", desc: "Bold and direct" },
  { id: "storytelling", label: "Storytelling", desc: "Narrative-driven" },
  { id: "motivational", label: "Motivational", desc: "Energetic and empowering" },
];

function StepVoicePersonality({ value, onChange, onNext, onBack }) {
  const toggleVoice = (v) => {
    const current = value.voices || [];
    const updated = current.includes(v) ? current.filter(x => x !== v) : [...current, v];
    onChange({ ...value, voices: updated });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Voice & Personality</h2>
        <p className="step-subtitle">How should your content feel?</p>
      </div>
      <div className="voice-grid">
        {VOICE_OPTIONS.map(v => (
          <div
            key={v.id}
            className={`voice-card ${(value.voices || []).includes(v.id) ? "selected" : ""}`}
            onClick={() => toggleVoice(v.id)}
          >
            <div className="voice-label">{v.label}</div>
            <div className="voice-desc">{v.desc}</div>
          </div>
        ))}
      </div>
      <div className="step-nav">
        <button className="cta-ghost" onClick={onBack}>← Back</button>
        <button className="cta cta-pink" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 6: Your Becoming Journey ────────────────────────────────────────────

const JOURNEY_OPTIONS = [
  { id: "personal-brand", label: "Personal Brand", desc: "Build your unique identity online" },
  { id: "coaching-business", label: "Coaching Business", desc: "Scale your coaching practice" },
  { id: "creator-business", label: "Creator Business", desc: "Turn content into revenue" },
  { id: "digital-product", label: "Digital Product Brand", desc: "Sell digital products and courses" },
  { id: "ai-influencer", label: "AI Influencer Brand", desc: "Build AI personas and characters" },
];

function StepBecomingJourney({ value, onChange, onNext, onBack }) {
  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2 className="step-title">Your Becoming Journey</h2>
        <p className="step-subtitle">What are you building?</p>
      </div>
      <div className="journey-grid">
        {JOURNEY_OPTIONS.map(j => (
          <div
            key={j.id}
            className={`journey-card ${value === j.id ? "selected" : ""}`}
            onClick={() => onChange(j.id)}
          >
            <div className="journey-label">{j.label}</div>
            <div className="journey-desc">{j.desc}</div>
          </div>
        ))}
      </div>
      <div className="step-nav">
        <button className="cta-ghost" onClick={onBack}>← Back</button>
        <button className="cta cta-pink" onClick={onNext} disabled={!value}>Complete Profile →</button>
      </div>
    </div>
  );
}

// ─── Completion Screen ────────────────────────────────────────────────────────

function StepCompletion({ onFinish }) {
  return (
    <div className="onboarding-step completion-step">
      <div className="completion-icon">◈</div>
      <h2 className="completion-title">Your Becoming Profile is Complete.</h2>
      <p className="completion-subtitle">This profile will now personalize:</p>
      <div className="completion-modules">
        <span>Content Studio</span>
        <span>Script Studio</span>
        <span>Storyboard Studio</span>
        <span>Brand Vault</span>
        <span>Character Builder</span>
        <span>AI Memory Engine</span>
      </div>
      <button className="cta cta-pink" onClick={onFinish}>Enter the Studio →</button>
    </div>
  );
}

// ─── Main Onboarding Component ────────────────────────────────────────────────

export default function BecomingProfileOnboarding({ userId, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [creatorType, setCreatorType] = useState("");
  const [brand, setBrand] = useState({});
  const [visual, setVisual] = useState({});
  const [content, setContent] = useState({});
  const [voice, setVoice] = useState({});
  const [journey, setJourney] = useState("");

  async function saveProfile() {
    setSaving(true);
    const sb = createClient();

    const profile = {
      identity: {
        name: brand.brandName || "",
        creator_type: creatorType,
        tagline: brand.tagline || "",
        journey: journey,
      },
      brand: {
        brandName: brand.brandName || "",
        niche: brand.niche || "",
        mission: brand.mission || "",
        audience: brand.audience || "",
      },
      visual: {
        colors: visual.colors || "",
        style: visual.style || "",
        aesthetic: visual.aesthetic || "",
      },
      content: {
        platforms: content.platforms || [],
        goals: content.goals || [],
      },
      voice: {
        voices: voice.voices || [],
      },
      goals: {
        journey: journey,
      },
    };

    await sb.from("profiles").upsert(
      { user_id: userId, ...profile },
      { onConflict: "user_id" }
    );

    setSaving(false);
    setStep(7); // Show completion
  }

  const handleNext = () => {
    if (step === 6) {
      saveProfile();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  return (
    <>
      <style>{`
        .onboarding-container { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; }
        .onboarding-step { display: flex; flex-direction: column; gap: 2rem; }

        .step-header { text-align: center; margin-bottom: 1rem; }
        .step-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 400; color: var(--cream); line-height: 1.1; margin-bottom: 0.75rem; }
        .step-subtitle { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-style: italic; color: var(--muted); line-height: 1.7; }

        .creator-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .creator-type-card { background: rgba(18, 3, 30, 0.85); border: 2px solid rgba(255, 45, 166, 0.15); backdrop-filter: blur(10px); border-radius: 8px; padding: 1.75rem 1.5rem; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); text-align: center; }
        .creator-type-card:hover { border-color: rgba(255, 45, 166, 0.5); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(255, 45, 166, 0.2); }
        .creator-type-card.selected { border-color: #FF2DA6; background: rgba(255, 45, 166, 0.12); box-shadow: 0 8px 40px rgba(255, 45, 166, 0.3); }
        .ct-icon { font-size: 2rem; margin-bottom: 0.75rem; color: var(--pink); }
        .ct-label { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--cream); margin-bottom: 0.5rem; }
        .ct-desc { font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; font-style: italic; color: var(--muted); line-height: 1.5; }

        .onboarding-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .ob-field label { display: block; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.5rem; }
        .ob-field input, .ob-field textarea { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 2px; padding: 0.85rem 1rem; color: var(--cream); font-family: 'Cormorant Garamond', serif; font-size: 1rem; outline: none; resize: vertical; }
        .ob-field input:focus, .ob-field textarea:focus { border-color: var(--pink); }
        .ob-field input::placeholder, .ob-field textarea::placeholder { color: var(--muted); font-style: italic; }

        .style-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
        .style-card { background: var(--card); border: 2px solid var(--border); border-radius: 3px; padding: 1rem; cursor: pointer; transition: all 0.2s; text-align: center; }
        .style-card:hover { border-color: var(--style-color); }
        .style-card.selected { border-color: var(--style-color); background: rgba(247, 37, 133, 0.08); }
        .style-label { font-size: 0.8rem; font-weight: 500; color: var(--cream); margin-bottom: 0.3rem; }
        .style-desc { font-size: 0.7rem; color: var(--muted); line-height: 1.4; }

        .toggle-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.75rem; }
        .toggle-card { background: var(--card); border: 2px solid var(--border); border-radius: 3px; padding: 0.65rem 1.25rem; cursor: pointer; font-size: 0.8rem; font-weight: 500; color: var(--muted); transition: all 0.2s; }
        .toggle-card:hover { border-color: var(--lavender); color: var(--lavender); }
        .toggle-card.selected { border-color: var(--pink); color: var(--cream); background: rgba(247, 37, 133, 0.12); }

        .voice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .voice-card { background: var(--card); border: 2px solid var(--border); border-radius: 4px; padding: 1.5rem; cursor: pointer; transition: all 0.25s; }
        .voice-card:hover { border-color: var(--lavender); transform: translateY(-2px); }
        .voice-card.selected { border-color: var(--pink); background: rgba(247, 37, 133, 0.1); }
        .voice-label { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--cream); margin-bottom: 0.4rem; }
        .voice-desc { font-family: 'Cormorant Garamond', serif; font-size: 0.9rem; font-style: italic; color: var(--muted); }

        .journey-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .journey-card { background: var(--card); border: 2px solid var(--border); border-radius: 4px; padding: 1.75rem 1.5rem; cursor: pointer; transition: all 0.25s; }
        .journey-card:hover { border-color: var(--purple); transform: translateY(-3px); }
        .journey-card.selected { border-color: var(--pink); background: rgba(247, 37, 133, 0.1); box-shadow: 0 0 0 1px var(--pink); }
        .journey-label { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--cream); margin-bottom: 0.5rem; }
        .journey-desc { font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; font-style: italic; color: var(--muted); line-height: 1.5; }

        .completion-step { align-items: center; text-align: center; padding: 3rem 1.5rem; }
        .completion-icon { font-size: 4rem; color: var(--pink); margin-bottom: 1.5rem; }
        .completion-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 400; color: var(--cream); line-height: 1.1; margin-bottom: 1rem; }
        .completion-subtitle { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-style: italic; color: var(--muted); margin-bottom: 1.5rem; }
        .completion-modules { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; max-width: 500px; margin: 0 auto 2.5rem; }
        .completion-modules span { background: rgba(247, 37, 133, 0.12); border: 1px solid rgba(247, 37, 133, 0.3); border-radius: 20px; padding: 0.5rem 1.25rem; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--lavender); }

        .step-nav { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
        .cta-ghost { padding: 0.85rem 1.75rem; background: none; border: 1px solid rgba(255, 45, 166, 0.3); border-radius: 4px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: #FF2DA6; transition: all 0.3s ease; }
        .cta-ghost:hover { border-color: #FF2DA6; background: rgba(255, 45, 166, 0.08); color: var(--cream); }

        @media (max-width: 640px) {
          .creator-type-grid, .journey-grid { grid-template-columns: 1fr; }
          .voice-grid, .style-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="onboarding-container">
        {step === 1 && <StepCreatorType value={creatorType} onChange={setCreatorType} onNext={handleNext} />}
        {step === 2 && <StepBrand value={brand} onChange={setBrand} onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <StepVisualIdentity value={visual} onChange={setVisual} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <StepContentIdentity value={content} onChange={setContent} onNext={handleNext} onBack={handleBack} />}
        {step === 5 && <StepVoicePersonality value={voice} onChange={setVoice} onNext={handleNext} onBack={handleBack} />}
        {step === 6 && <StepBecomingJourney value={journey} onChange={setJourney} onNext={handleNext} onBack={handleBack} />}
        {step === 7 && <StepCompletion onFinish={onComplete} />}
      </div>
    </>
  );
}
