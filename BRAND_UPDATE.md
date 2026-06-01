# BRAND UPDATE — Becoming HER Studio

## Overview
Rebranding from "STORME Cinéma" to "Becoming HER Studio" as the platform name. Storme Cinéma becomes a premium module within the platform.

---

## BRAND CHANGES:

### 1. LANDING PAGE (StormeLanding.jsx):
- Replace all "STORME Cinéma" → "Becoming HER Studio"
- Replace "by Storme Luxe" → keep as subtitle
- Replace "Start Your Glow-Up" → "Start Becoming"
- Replace "See Pricing" → "See Plans"
- Update hero tagline to reflect full OS positioning:
  "The AI Creator Operating System designed for women 
   building brands, creating content, and becoming 
   the next version of themselves."
- Update all module descriptions to reflect full platform
- Update meta title and description

### 2. STUDIO APP (StudioOS.jsx):
- Update sidebar logo from "STORME Cinéma" 
  to "Becoming HER Studio"
- Update tagline to "AI Creator Operating System"
- Update all page titles and breadcrumbs
- Update footer copyright

### 3. ADD STORME CINÉMA AS A MODULE:
- Add to NAV array:
  { id: "stormecinema", icon: "🎬", 
    label: "Storme Cinéma", 
    color: "#D4AF37",
    tag: "Premium" }
- Requires Studio plan ($97/month)
- Module description: 
  "The premium cinematic storytelling and visual 
   campaign studio. Build shot sequences, 
   visual concepts, and cinematic AI prompts."
- Import and connect the existing 
  muse-cinema.jsx components

### 4. UPDATE ALL PAGES:
- Login page title → "Becoming HER Studio"
- Signup page title → "Becoming HER Studio"
- Browser tab title → "Becoming HER Studio"
- All email references → "Becoming HER Studio"

### 5. BRAND HIERARCHY in footer and about:
- Platform: Becoming HER Studio
- By: Storme Luxe
- Company: Dollars & Dreams
- Tagline: She didn't arrive... she became.

---

## Implementation Checklist

- [ ] Create BRAND_UPDATE.md
- [ ] Update StormeLanding.jsx hero section
- [ ] Update StormeLanding.jsx CTAs
- [ ] Update StormeLanding.jsx meta tags
- [ ] Update StudioOS.jsx sidebar logo
- [ ] Update StudioOS.jsx tagline
- [ ] Add Storme Cinéma to NAV array
- [ ] Update StudioOS.jsx footer
- [ ] Update login page title
- [ ] Update signup page title
- [ ] Test compilation
- [ ] Commit to GitHub
- [ ] Deploy to Vercel

---

Push to GitHub and deploy to Vercel when complete.
