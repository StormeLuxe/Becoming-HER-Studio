# COLOR REFINEMENT — Platform-Wide Color System Update

## Philosophy

Create visual cohesion across the entire platform with refined purples, enhanced glassmorphism, and luxury depth.

---

## CSS VARIABLE UPDATES

Apply to `globals.css` and all inline styles in StudioOS.jsx, StormeLanding.jsx, login, signup pages:

```css
:root {
  --black: #12031E;        /* Main background */
  --deep: #1D0A2E;         /* Sidebar, panels */
  --card: #2A123F;         /* Cards, forms */
  --card2: #341650;        /* Elevated cards */
  --border: rgba(255,255,255,0.08);
  --pink: #FF2DA6;
  --gold: #D4AF37;
  --purple: #7b2fff;
  --lavender: #c77dff;
  --teal: #4cc9f0;
  --cream: #f0e6ff;
  --text: #d4b8e8;
  --muted: #9b7bb8;
}
```

---

## GLOBAL AMBIENT GRADIENT

Add to main app background:

```css
background: 
  radial-gradient(ellipse 60% 40% at 0% 0%, 
    rgba(255,45,166,0.12) 0%, transparent 50%),
  radial-gradient(ellipse 50% 40% at 100% 0%, 
    rgba(147,51,234,0.12) 0%, transparent 50%),
  radial-gradient(ellipse 40% 30% at 50% 100%, 
    rgba(255,45,166,0.08) 0%, transparent 50%),
  #12031E;
```

---

## CONTENT CONTAINERS

Update ALL major content areas:

```css
background: rgba(42,18,63,0.75);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 24px;
padding: 2rem;
```

**Applies to:**
- Module content areas
- Dashboard cards
- Form sections
- Upgrade screens
- Profile sections
- All result cards

---

## SIDEBAR

```css
background: rgba(29,10,46,0.95);
backdrop-filter: blur(20px);
border-right: 1px solid rgba(255,255,255,0.08);
```

---

## TOPBAR

```css
background: rgba(18,3,30,0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255,255,255,0.08);
```

---

## CARDS

**Default:**
```css
background: rgba(42,18,63,0.75);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
transition: all 0.3s ease;
```

**Hover:**
```css
border-color: rgba(255,45,166,0.3);
box-shadow: 0 8px 32px rgba(255,45,166,0.1);
transform: translateY(-2px);
```

---

## UPGRADE/LOCKED SCREENS

Center large premium card:

```css
background: rgba(42,18,63,0.9);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 24px;
max-width: 900px;
margin: 0 auto;
padding: 3rem;
```

---

## PRICING CARDS

**Starter:**
```css
border: 1px solid rgba(255,45,166,0.4);
background: rgba(42,18,63,0.8);
```

**Creator (highlighted):**
```css
border: 1px solid rgba(255,45,166,0.7);
background: rgba(52,22,80,0.9);
box-shadow: 0 0 40px rgba(255,45,166,0.2);
```

**Studio:**
```css
border: 1px solid rgba(212,175,55,0.5);
background: rgba(42,18,63,0.8);
box-shadow: 0 0 40px rgba(212,175,55,0.15);
```

---

## TYPOGRAPHY

- **Headings:** `#f0e6ff` (warm lavender white)
- **Body:** `#d4b8e8` (soft purple-tinted)
- **Muted:** `#9b7bb8`
- **Labels:** `#FF2DA6` (pink)
- **Gold text:** `#D4AF37`

---

## IMPLEMENTATION

Apply changes to ALL files:
- globals.css
- StudioOS.jsx
- StormeLanding.jsx
- login/page.tsx
- signup/page.tsx
- BecomingProfileOnboarding.jsx

Test locally first.
Push to GitHub and deploy to Vercel when done.

---

**Goal:** Visual cohesion, luxury depth, refined glassmorphism.
