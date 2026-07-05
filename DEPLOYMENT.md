# Production Launch Checklist

## 1. Vercel

Create a Vercel project from this repository and set these environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `REQUIRE_AUTH=true`

## 2. Supabase

Run `supabase/schema.sql` in the Supabase SQL editor.

Enable email auth in Supabase, configure the site URL to your production domain, and add redirect URLs for:

- `https://your-domain.com/dashboard`
- `https://your-domain.com/login`

## 3. Stripe

Create products and recurring prices in Stripe, then set `NEXT_PUBLIC_STRIPE_PRICE_ID`.

Create a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

Listen for:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 4. OpenAI

Set `OPENAI_API_KEY`. The app uses mock structured scoring as a reliability layer and asks OpenAI to act as the consultant layer.

## 5. Security

- Keep `REQUIRE_AUTH=true` in production.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser.
- Confirm Stripe webhook signature verification is passing.
- Keep Supabase RLS enabled.
- Add persistent rate limiting before high-traffic launch.
