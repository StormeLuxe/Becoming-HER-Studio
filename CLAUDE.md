# Becoming HER Studio — Claude Code Reference

## What This Is
A standalone Next.js 14 App Router SaaS — the AI creator operating system for Becoming HER Studio.
It is completely separate from Soft-Storme-After-Dark. Do not mix the two projects.

## Architecture
- **Framework:** Next.js 14 App Router (TypeScript)
- **Auth:** Supabase Auth — email/password only
- **Database:** Supabase (Postgres) — separate project from Soft-Storme-After-Dark
- **Payments:** Stripe — separate account/products from Soft-Storme-After-Dark
- **AI:** Anthropic Claude — platform key only, never user-supplied

## Directory Structure
```
app/
  page.tsx              — Public landing page (server, auth check → /studio)
  layout.tsx
  LandingClient.tsx     — Client wrapper for StormeLanding
  login/page.tsx        — Email/password login
  signup/page.tsx       — Email/password signup
  studio/
    page.tsx            — Server auth check → StudioClient
    StudioClient.tsx    — Client wrapper for StudioOS
  settings/page.tsx     — HIDDEN — personal API key settings (v2, not linked)
  api/
    generate/route.ts   — ALL Claude calls go here. Auth + credit check + deduct + log.
    credits/route.ts    — GET endpoint for frontend credit balance
    subscribe/route.ts  — Stripe checkout session creation
    webhook/route.ts    — Stripe webhook: provisions user_credits on subscription events
components/
  StudioOS.jsx          — 8-module studio (profile, character, vault, content, storyboard, script, projects, memory)
  StormeLanding.jsx     — Public sales/landing page
lib/
  supabase/
    client.ts           — Browser Supabase client
    server.ts           — Server Supabase client (cookies)
  credits.ts            — Server-only: getCreditCost, checkCredits, deductCredits, logUsage
  tiers.ts              — Module access rules by plan, plan metadata
supabase/migrations/
  001_studio_tables.sql — profiles, projects, studio_memories, subscriptions (initial)
  002_credits_and_billing.sql — user_credits, usage_tracking, credit_costs, deduct_credits RPC
```

## Subscription Plans
| Plan        | Slug      | Price | Credits/month | Stripe env var           |
|-------------|-----------|-------|---------------|--------------------------|
| Creator     | creator   | $27   | 100           | STRIPE_CREATOR_PRICE_ID  |
| Pro Creator | pro       | $47   | 300           | STRIPE_PRO_PRICE_ID      |
| Studio      | studio    | $97   | 1000          | STRIPE_STUDIO_PRICE_ID   |

## Module Access by Plan
| Module           | creator | pro | studio |
|------------------|---------|-----|--------|
| Becoming Profile | ✅      | ✅  | ✅     |
| Content Studio   | ✅      | ✅  | ✅     |
| Script Studio    | ✅      | ✅  | ✅     |
| Project Vault    | ✅      | ✅  | ✅     |
| Memory Engine    | ✅      | ✅  | ✅     |
| Character Builder| ❌      | ✅  | ✅     |
| Brand Vault      | ❌      | ✅  | ✅     |
| Storyboard Studio| ❌      | ❌  | ✅     |

## Credit Costs (stored in credit_costs table — admin editable)
| Action                | Credits |
|-----------------------|---------|
| content-caption       | 1       |
| content-hook          | 1       |
| content-calendar      | 3       |
| content-plan          | 3       |
| script-generation     | 5       |
| reel-script           | 5       |
| storyboard-generation | 10      |
| character-creation    | 15      |
| brand-vault           | 15      |
| full-story-arc        | 5       |
| memory-insight        | 3       |

## Non-Negotiable Rules
1. **API key never on client.** ANTHROPIC_API_KEY is server-env only.
2. **Credit check is server-side.** /api/generate authenticates the user, fetches costs from DB, checks credits before calling Claude.
3. **Failed generations do NOT deduct credits.** Deduction happens only after a successful Claude response.
4. **Every generation is logged** to usage_tracking.
5. **Tier access is checked server-side** — frontend locking is UX only; the real gate is /api/generate.
6. **Credits reset on subscription renewal** — the webhook handles this.

## Environment Variables (see .env.example)
Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
STRIPE_WEBHOOK_SECRET, STRIPE_CREATOR_PRICE_ID, STRIPE_PRO_PRICE_ID,
STRIPE_STUDIO_PRICE_ID, NEXT_PUBLIC_APP_URL

## v2 Features (not yet live — keep code, keep hidden)
- Personal API key settings page: app/settings/page.tsx exists but is not linked from nav
- When a user supplies their own key, generations use their key and credits are NOT deducted
