# Production Launch Checklist

## 1. Vercel

Create a Vercel project from this repository and set these environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_SCALE`
- `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `REQUIRE_AUTH=true`
- `CJ_DROPSHIPPING_API_KEY`
- `ADMIN_SECRET`

## 2. Supabase

Run `supabase/schema.sql` in the Supabase SQL editor — including if you already ran an earlier version, since it now
also documents `curated_products` (safe no-op if it already exists) and adds the new `analytics_events` table used
by `/admin/analytics`. Every statement uses `if not exists`, so re-running it is safe.

Enable email auth in Supabase, configure the site URL to your production domain, and add redirect URLs for:

- `https://your-domain.com/dashboard`
- `https://your-domain.com/login`

## 3. Stripe

Products and recurring prices for Starter/Growth/Scale already exist in this Stripe account. Their price IDs are set in `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, and `STRIPE_PRICE_SCALE`.

Create a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

Listen for:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 4. AI provider (Claude or OpenAI)

The app always computes structured, rules-based intelligence first (real product/CJ data), then optionally layers natural-language commentary on top. Set `ANTHROPIC_API_KEY` to use Claude for that layer — it's tried first if both keys are set. Set `OPENAI_API_KEY` as a fallback/alternative. If neither is set, the app still works, just with rules-based copy instead of LLM-written commentary.

## 5. Security

- Keep `REQUIRE_AUTH=true` in production.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser.
- Confirm Stripe webhook signature verification is passing.
- Keep Supabase RLS enabled.
- Add persistent rate limiting before high-traffic launch.

## 6. Legal

`/terms`, `/privacy`, and `/refund-policy` are drafted and linked from the homepage footer and pricing page, but they
contain bracketed placeholders (business legal name, governing-law jurisdiction) and should be reviewed by a licensed
attorney before you rely on them commercially — especially once a real business entity is registered.

## 7. Analytics

`/admin/analytics` (admin-secret gated, same as `/admin/curate`) shows signups, checkout conversion, and subscription
churn, computed from the `analytics_events` and `billing_events` Supabase tables — no third-party analytics account
required.
