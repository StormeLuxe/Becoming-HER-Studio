# 🚀 DEPLOYMENT READY

## ✅ What's Complete

### 1. Becoming Profile Redesign
- **FREE for all users** - no subscription required
- **6-step guided onboarding flow:**
  1. Who Are You Becoming? (choose creator type)
  2. Build Your Brand (brand fundamentals)
  3. Visual Identity (style + aesthetics)
  4. Content Identity (platforms + goals)
  5. Voice & Personality (tone selection)
  6. Your Becoming Journey (what you're building)
  7. Completion screen (shows what's personalized)

### 2. Credit System
- ✅ Platform-managed Anthropic API key (never exposed to users)
- ✅ Credit costs configured in `credit_costs` table
- ✅ Server-side credit checks before every generation
- ✅ Credits deducted only on successful generations
- ✅ Usage logged to `usage_tracking` table
- ✅ Credit balance visible in topbar with low-credit warnings
- ✅ Module access gated by subscription tier

### 3. Database
- ✅ All 7 tables created in Supabase:
  - `profiles` (with `onboarding_complete` column)
  - `projects`
  - `studio_memories`
  - `user_credits`
  - `usage_tracking`
  - `credit_costs`
  - `subscriptions`
- ✅ RLS policies enabled
- ✅ Credit costs seeded with correct values from PRODUCT_DECISIONS.md

### 4. Subscription Tiers
- ✅ **Creator** - $27/month - 100 credits
- ✅ **Pro Creator** - $47/month - 300 credits
- ✅ **Studio** - $97/month - 1000 credits
- ✅ Stripe integration working (tested locally)
- ✅ Module access by tier implemented

### 5. UI/UX
- ✅ Dashboard with module descriptions
- ✅ Credit balance badge in topbar
- ✅ Low credit warning at 20%
- ✅ Upgrade prompts when out of credits
- ✅ Locked module screens with upgrade CTAs

---

## 📋 Before Deploying to Vercel

### Run the New Migration

The `onboarding_complete` column needs to be added to your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase/migrations/003_onboarding_complete.sql`
3. Run the migration

```sql
-- Add onboarding_complete column to profiles table
alter table profiles
  add column if not exists onboarding_complete boolean not null default false;

create index if not exists idx_profiles_onboarding on profiles(user_id, onboarding_complete);
```

---

## 🚀 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/new
2. Import repository: **StormeLuxe/Becoming-HER-Studio**
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `./` (default)

### Add Environment Variables

Click "Environment Variables" and add these (select "Production, Preview, and Development"):

```
NEXT_PUBLIC_SUPABASE_URL=https://ipowopyzxdpglusazeyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
ANTHROPIC_API_KEY=[your Claude API key]
STRIPE_SECRET_KEY=[your live Stripe secret key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51TXvtB7YqpyCLvx6yg2wf2hUJpjGef1YF9aLx5xODSp5UDDPYQBrNZr8HfrtGJHEfIDYwEIMDIMjasen4UeCKFz500Kp4i5PZP
STRIPE_CREATOR_PRICE_ID=price_1TdF237YqpyCLvx6FxH8xhhV
STRIPE_PRO_PRICE_ID=price_1TdF2e7YqpyCLvx6Wy7Bq2Fa
STRIPE_STUDIO_PRICE_ID=price_1TdF3f7YqpyCLvx6fRBq7xup
NEXT_PUBLIC_APP_URL=[leave blank initially, update after deployment]
STRIPE_WEBHOOK_SECRET=[leave blank, add after webhook setup]
```

5. Click **"Deploy"**

---

## 🔗 After Deployment

### 1. Update App URL
- Copy your production URL (e.g., `https://becoming-her-studio.vercel.app`)
- Go to Vercel → Settings → Environment Variables
- Update `NEXT_PUBLIC_APP_URL` with your real URL
- **Redeploy** (Deployments tab → three dots → Redeploy)

### 2. Set Up Stripe Webhook
- Go to Stripe Dashboard → Developers → Webhooks
- Click "Add endpoint"
- URL: `https://your-vercel-url.vercel.app/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the webhook signing secret (starts with `whsec_`)
- Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars
- **Redeploy** one final time

---

## ✅ Testing Checklist

After deployment:

1. [ ] Landing page loads
2. [ ] Signup creates account
3. [ ] Email confirmation works
4. [ ] Login redirects to /studio
5. [ ] Becoming Profile onboarding shows (6 steps)
6. [ ] Onboarding saves to Supabase
7. [ ] Completion screen appears
8. [ ] Dashboard shows modules with descriptions
9. [ ] Credit balance shows in topbar
10. [ ] Locked modules show upgrade prompts
11. [ ] Stripe checkout creates session
12. [ ] Webhook provisions credits on subscription

---

## 🎨 Key Features

- **Guided Onboarding:** 6-step wizard with card selections and forms
- **Free Foundation:** Becoming Profile is free for all users
- **Credit System:** Server-managed, secure, with real-time balance
- **Module Gating:** Tier-based access with elegant upgrade prompts
- **Personalization:** Profile data powers all AI generations
- **Connected Intelligence:** All modules pull from Becoming Profile

---

## 📝 Notes

- All API keys are server-side only
- Credits reset on subscription renewal (handled by webhook)
- Failed generations do NOT deduct credits
- Personal API keys (v2 feature) UI is built but hidden
- Settings page exists at `/settings` but not linked from nav

---

**Ready to deploy!**
