# UPGRADE SCREEN REDESIGN — Locked Module Experience

## Philosophy

Replace current LockedModuleView component with a **full conversion experience** that sells transformation, not features.

---

## IMPLEMENTATION:

### 1. NEW LockedModuleView COMPONENT

Each locked module page must show:

#### SECTION 1 — MODULE HERO
- Module icon (large, colored)
- Module name
- One powerful headline about transformation
- One sentence description of what it does

#### SECTION 2 — WHY THIS MATTERS
- "What's inside [Module Name]:"
- 4-6 feature bullets specific to that module
- "Every AI generation automatically uses this data"

**Module Descriptions:**

**BRAND VAULT:**
- Store your brand colors, fonts, and logo
- Define your brand voice and personality  
- Set your target audience and offers
- All AI outputs automatically reference your vault
- Creates consistency across every piece of content

**CHARACTER BUILDER:**
- Create AI personas and alter egos
- Upload reference photos
- Define appearance, personality, and backstory
- Use characters across content, scripts, and storyboards
- Build multiple characters for different campaigns

**STORYBOARD STUDIO:**
- Generate cinematic shot sequences
- Optimized for Higgsfield, Kling, Nano Banana, Seedance
- Single scenes, multi-scene, full campaigns
- Uses your characters and brand automatically
- Director-level prompts for every shot

**SCRIPT STUDIO:**
- Write scripts in your exact voice
- YouTube, Reels, TikToks, Sales Videos, Courses
- Automatically pulls from your Becoming Profile
- Hook, Body, CTA structure every time
- Multiple formats and durations

**AI MEMORY ENGINE:**
- Remembers your preferences permanently
- No re-entering information ever again
- Gets smarter with every generation
- Personalizes outputs across all modules
- Stores brand, audience, voice, and goals

**PROJECT VAULT:**
- Save every AI generation
- Organize by project type
- Searchable archive
- Never lose a script, caption, or storyboard
- Export and share your work

**PROMPT VAULT:**
- Searchable library of AI prompts
- Categories: Higgsfield, Kling, Social, Branding
- Save, favorite, and clone prompts
- Share with community (coming soon)
- Built-in prompts for every platform

**STORME CINÉMA:**
- Premium cinematic storytelling module
- Visual campaign builder
- Hook Pressure™ scoring system
- Emotional story engine
- DMS Studio for persona building

**CONTENT STUDIO:**
- Generate captions, hooks, and content calendars
- Platform-specific formatting (Instagram, TikTok, etc.)
- Hook Pressure™ scoring on every output
- Uses your brand voice automatically
- Save directly to Project Vault

---

#### SECTION 3 — PLAN COMPARISON CARDS

Show all 3 plans side by side:

**BECOMING HER STARTER — $27/month**
- Pink accent
- Features:
  - ✓ Becoming Profile
  - ✓ Content Studio  
  - ✓ Prompt Vault
  - ✓ Project Vault
  - ✓ 100 Monthly Credits
- Button: "Choose Starter"

**BECOMING HER CREATOR — $47/month**
- Pink + Purple accent
- Badge: "Most Popular"
- Features:
  - ✓ Everything in Starter
  - ✓ Brand Vault
  - ✓ Storyboard Studio
  - ✓ Script Studio
  - ✓ Character Builder
  - ✓ 300 Monthly Credits
- Button: "Choose Creator"

**BECOMING HER STUDIO — $97/month**
- Gold accent
- Badge: "Best Value"
- Features:
  - ✓ Everything in Creator
  - ✓ AI Memory Engine
  - ✓ Storme Cinéma
  - ✓ Premium Templates
  - ✓ Priority Support
  - ✓ 1000 Monthly Credits
- Button: "Choose Studio"

---

#### SECTION 4 — MODULE PREVIEW (blurred)

Show a fake/blurred preview of the module UI with a "🔒 Unlock to access" overlay.

This shows users what they are missing.

---

#### SECTION 5 — BOTTOM CTA

- **Headline:** "She didn't arrive... she became."
- **Subtext:** "Join thousands of creators building their digital empire with Becoming HER Studio."
- **Button:** "Start Becoming Today →"

---

## DESIGN:

- Dark luxury background #05010A
- Cards with glassmorphism
- **Starter:** pink border
- **Creator:** pink/purple border + "Most Popular" badge
- **Studio:** gold border + gold glow + "Best Value" badge
- **Highlighted plan** = the minimum plan needed for that module
- Smooth animations on card hover
- Mobile responsive

---

## BEHAVIOR:

- Each plan button calls `handleUpgrade(plan)`
- Highlighted plan is the minimum required plan
- All 3 plans always shown for comparison

---

## GOAL:

Transform locked screens from blockers into conversion experiences.

Every pixel sells transformation: *"She didn't arrive... she became."*
