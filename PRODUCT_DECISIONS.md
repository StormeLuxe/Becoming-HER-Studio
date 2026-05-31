# Becoming HER Studio — Product Decisions

## Core Philosophy
This platform must feel like Netflix, Canva, or ChatGPT.
Users sign up → subscribe → start creating. No technical setup. Ever.

---

## 1. Platform-Managed API Keys
- ALL AI calls use platform-owned Anthropic API key stored in server environment
- Users NEVER see API key setup at any point
- API key lives in .env only — never exposed to client
- All generations route through /api/generate server route only

## 2. Credit System

### Credit Costs Per Action
| Action                | Credits |
|-----------------------|---------|
| Caption Generation    | 1       |
| Hook Generation       | 1       |
| Content Calendar      | 3       |
| Content Plan          | 3       |
| Script Generation     | 5       |
| Reel Script           | 5       |
| Storyboard Generation | 10      |
| Character Creation    | 15      |
| Brand Vault           | 15      |
| Full Story Arc        | 5       |

### Credit Configuration
- Credits must be configurable via admin settings (not hardcoded)
- Store credit costs in a Supabase table: credit_costs (action, credits)
- Admin can update costs without redeployment

## 3. Subscription Tiers

### Creator — $27/month
- 100 credits/month
- Access: Content Studio, Script Studio, Viral Story Brain
- Community access

### Pro Creator — $47/month
- 300 credits/month
- Access: Everything in Creator + Character Builder + Muse Reel + Brand Vault
- Premium templates

### Studio — $97/month
- 1000 credits/month
- Access: Full suite — all 8 modules
- Priority features
- Early access to new modules

## 4. Database Tables Required

### usage_tracking
- id, user_id, action, credits_used, created_at

### user_credits
- user_id, credits_remaining, credits_used_total, period_start, period_end, plan

### credit_costs (admin configurable)
- action (text, primary key), credits (integer), updated_at

### subscriptions
- user_id, stripe_customer_id, stripe_subscription_id,
  plan (creator/pro/studio), status, period_start, period_end

## 5. Credit Flow — Every AI Generation
1. User clicks generate
2. Frontend calls /api/generate
3. Server checks user's credits_remaining in Supabase
4. If credits >= cost: proceed, deduct credits, log to usage_tracking
5. If credits < cost: return error "Not enough credits — upgrade your plan"
6. Generation runs using PLATFORM Anthropic API key
7. Result returned to user
8. Generation saved to projects table

## 6. Module Access by Tier

| Module              | Creator $27 | Pro $47 | Studio $97 |
|---------------------|-------------|---------|------------|
| Content Studio      | ✅          | ✅      | ✅         |
| Script Studio       | ✅          | ✅      | ✅         |
| Viral Story Brain   | ✅          | ✅      | ✅         |
| Character Builder   | ❌          | ✅      | ✅         |
| Muse Reel           | ❌          | ✅      | ✅         |
| Brand Vault         | ❌          | ✅      | ✅         |
| Storyboard Studio   | ❌          | ❌      | ✅         |
| DMS Studio          | ❌          | ❌      | ✅         |

## 7. User Experience Rules
- Onboarding: name → pick plan → pay → enter studio. Done.
- Credit balance always visible in the top bar
- Low credit warning at 20% remaining
- Upgrade prompt when credits run out (not an error page)
- Module locked state shows what plan unlocks it with upgrade CTA

## 8. Future — Personal API Keys (DISABLED AT LAUNCH)
- Architecture must support optional personal API keys per user
- Future settings page: Claude API Key, OpenAI API Key, Gemini API Key
- When a user adds their own key → their generations use their key (no credits deducted)
- Build the settings page UI but keep it hidden/disabled until v2

## 9. Admin Requirements
- View total API usage and cost
- View credits used per user
- Edit credit costs per action
- View subscription status per user
- Manual credit top-up per user

---

## Non-Negotiable Rules for Development
1. Platform API key NEVER goes to the client
2. Credit check happens SERVER-SIDE before every generation
3. Every generation is logged to usage_tracking
4. Tier access is checked server-side — never trust the client
5. Credits reset on subscription renewal date
6. Failed generations do NOT deduct credits
