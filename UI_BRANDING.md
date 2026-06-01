# UI BRANDING — Becoming HER Studio

## Brand Philosophy
Apple clean + Dior luxury + Canva accessible.

**NOT** gaming. **NOT** developer tool. **NOT** SaaS dashboard.

Every screen reinforces: *"She didn't arrive... she became."*

---

## 1. COLOR SYSTEM

### Update All CSS Variables

```css
--black: #05010A      /* Deepest black with purple undertone */
--deep: #12031E       /* Dark purple-black */
--card: #160d2a       /* Keep existing */
--card2: #1e1238      /* Keep existing */
--border: #2a1850     /* Keep existing */
--pink: #FF2DA6       /* Brighter, more vibrant pink */
--purple: #7b2fff     /* Keep existing */
--violet: #b5179e     /* Keep existing */
--lavender: #c77dff   /* Keep existing */
--teal: #4cc9f0       /* Keep existing */
--gold: #D4AF37       /* Luxury champagne gold */
--cream: #f0e6ff      /* Keep existing */
--text: #c2aee0       /* Keep existing */
--muted: #7a6096      /* Keep existing */
```

**Apply globally across:**
- StudioOS.jsx
- StormeLanding.jsx
- Login/Signup pages
- BecomingProfileOnboarding.jsx

---

## 2. SIDEBAR IMPROVEMENTS

### Current Issues
- Active state is weak
- No left accent on active items
- Hover feels flat

### New Design

**Active Item:**
```css
.nav-item.active {
  color: #f0e6ff;
  border-left: 3px solid var(--pink);
  background: rgba(255, 45, 166, 0.08);
  box-shadow: 0 0 20px rgba(255, 45, 166, 0.15);
}
```

**Hover State:**
```css
.nav-item:hover {
  color: #FF2DA6;
  background: rgba(255, 45, 166, 0.05);
  transform: translateX(3px);
  transition: all 0.3s ease;
}
```

---

## 3. MODULE CARDS — Glassmorphism

### Dashboard Cards

```css
.dash-card {
  background: rgba(18, 3, 30, 0.85);
  border: 1px solid rgba(255, 45, 166, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.4s ease;
}

.dash-card:hover {
  border-color: rgba(255, 45, 166, 0.5);
  background: rgba(18, 3, 30, 0.95);
  box-shadow: 0 12px 40px rgba(255, 45, 166, 0.2);
  transform: translateY(-6px);
}
```

### Locked Cards
```css
.dash-card-locked {
  background: rgba(18, 3, 30, 0.4);
  border: 1px solid rgba(122, 96, 150, 0.2);
  opacity: 0.6;
}
```

---

## 4. BUTTONS

### Primary (Pink)
```css
.cta-pink {
  background: linear-gradient(135deg, #FF2DA6, #f72585);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 45, 166, 0.3);
  transition: all 0.3s ease;
}

.cta-pink:hover {
  box-shadow: 0 8px 30px rgba(255, 45, 166, 0.5);
  transform: translateY(-2px);
}
```

### Premium/Studio (Gold Gradient)
```css
.cta-gold {
  background: linear-gradient(135deg, #D4AF37, #FF2DA6);
  border: none;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  color: #05010A;
  font-weight: 500;
}

.cta-gold:hover {
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.6);
  transform: translateY(-2px);
}
```

### Ghost Buttons
```css
.cta-ghost {
  background: none;
  border: 1px solid rgba(255, 45, 166, 0.3);
  color: #FF2DA6;
  transition: all 0.3s ease;
}

.cta-ghost:hover {
  border-color: #FF2DA6;
  background: rgba(255, 45, 166, 0.08);
  color: #f0e6ff;
}
```

---

## 5. PRICING CARDS

### Starter Plan (Creator $27)
```css
.price-card.starter {
  border: 1px solid rgba(255, 45, 166, 0.3);
  background: rgba(18, 3, 30, 0.85);
}

.price-card.starter:hover {
  border-color: rgba(255, 45, 166, 0.6);
  box-shadow: 0 12px 40px rgba(255, 45, 166, 0.25);
}
```

### Creator Plan (Pro $47) — Most Popular
```css
.price-card.creator {
  border: 2px solid #FF2DA6;
  background: linear-gradient(160deg, rgba(255, 45, 166, 0.12), rgba(123, 47, 255, 0.08));
  box-shadow: 0 8px 40px rgba(255, 45, 166, 0.3);
  transform: scale(1.05);
}
```

### Studio Plan ($97) — Premium
```css
.price-card.studio {
  border: 2px solid #D4AF37;
  background: linear-gradient(160deg, rgba(212, 175, 55, 0.08), rgba(255, 45, 166, 0.05));
  box-shadow: 0 0 60px rgba(212, 175, 55, 0.2);
}

.price-badge.studio {
  background: linear-gradient(90deg, #D4AF37, #e8c97e);
  color: #05010A;
  font-weight: 600;
}
```

---

## 6. BECOMING SCORE — Visual Progress System

### Location
- Dashboard (top section)
- Sidebar profile badge ring

### Color Progression
```css
0-25%:   Deep Purple (#7b2fff)
26-50%:  Pink (#FF2DA6)
51-75%:  Rose Gold (gradient #FF2DA6 → #D4AF37)
76-100%: Gold (#D4AF37)
```

### Dashboard Implementation
```jsx
<div className="becoming-score-card">
  <div className="score-label">Your Becoming Journey</div>
  <div className="score-bar-wrap">
    <div className="score-bar" style={{ 
      width: `${score}%`,
      background: getScoreGradient(score)
    }} />
  </div>
  <div className="score-breakdown">
    <span>Profile {profilePct}%</span>
    <span>Brand {brandPct}%</span>
    <span>Projects {projectsPct}%</span>
  </div>
</div>
```

### Calculation Logic
```js
const becomingScore = {
  profile_completion: (filled profile fields / total fields) * 100,
  brand_completion: (brand vault exists) ? 100 : 0,
  saved_projects: min((project_count / 10) * 100, 100),
  overall: average of the three
}
```

---

## 7. ANIMATIONS — Luxury Motion

### Card Glow
```css
@keyframes soft-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 45, 166, 0.2); }
  50% { box-shadow: 0 0 30px rgba(255, 45, 166, 0.4); }
}

.featured-card {
  animation: soft-glow 3s ease-in-out infinite;
}
```

### Shimmer on Headings
```css
@keyframes luxury-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.hero-title {
  background: linear-gradient(90deg, #f0e6ff, #FF2DA6, #D4AF37, #f0e6ff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: luxury-shimmer 8s linear infinite;
}
```

### Hover Elevation
```css
.elevated-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.elevated-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 50px rgba(255, 45, 166, 0.3);
}
```

### Gradient Movement
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animated-gradient {
  background: linear-gradient(270deg, #FF2DA6, #7b2fff, #D4AF37);
  background-size: 600% 600%;
  animation: gradient-shift 8s ease infinite;
}
```

### Transition Standards
```css
/* All transitions minimum 0.3s */
transition: all 0.3s ease;          /* Fast interactions */
transition: all 0.4s ease;          /* Medium interactions */
transition: all 0.6s ease;          /* Slow, luxurious */

/* Bezier for natural feel */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 8. OVERALL DESIGN FEEL

### Typography Hierarchy
```css
/* Primary Headings — Playfair Display */
.primary-heading {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #f0e6ff;
}

/* Body — Cormorant Garamond */
.body-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  line-height: 1.8;
  color: #c2aee0;
}

/* UI Elements — DM Mono */
.ui-text {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #FF2DA6;
}
```

### Spacing System
```css
/* 8px base unit */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 1.5rem;   /* 24px */
--space-lg: 2rem;     /* 32px */
--space-xl: 3rem;     /* 48px */
```

### Border Radius
```css
--radius-sm: 2px;     /* Sharp, editorial */
--radius-md: 4px;     /* Soft */
--radius-lg: 8px;     /* Rounded cards */
--radius-full: 50%;   /* Circles */
```

---

## Implementation Checklist

### Files to Update
- [ ] `components/StudioOS.jsx` — sidebar, cards, buttons, Becoming Score
- [ ] `components/StormeLanding.jsx` — pricing cards, hero, CTAs
- [ ] `components/BecomingProfileOnboarding.jsx` — cards, buttons
- [ ] `app/login/page.tsx` — colors, buttons
- [ ] `app/signup/page.tsx` — colors, buttons
- [ ] `app/globals.css` — global color variables

### Features to Add
- [ ] Becoming Score calculation and display
- [ ] Glassmorphism on all cards
- [ ] Soft glow animations
- [ ] Luxury hover states
- [ ] Gold gradient for Studio tier
- [ ] Pink glow on sidebar active state

---

**Brand Reminder:**

Every pixel reinforces luxury, elevation, and transformation.

*She didn't arrive... she became.*
