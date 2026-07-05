# TrendRadar AI

Subscription-based AI Commerce Intelligence MVP for dropshipping and ecommerce.

## Run locally

```bash
npm install
npm run dev
```

## Production setup

See `DEPLOYMENT.md` for Vercel, Supabase, Stripe, OpenAI, webhook, and security setup.

## Security hardening

- Browser security headers in `next.config.mjs`
- API request body size limits and JSON validation
- Lightweight per-client API rate limiting
- No-store responses for dynamic API routes
- Environment status helper for Supabase, Stripe, and OpenAI readiness
- App-level loading, error, and not-found states

## MVP scope

- Next.js, TypeScript, Tailwind CSS app router
- Mock product and trend intelligence
- Consultant-style AI chat as the main dashboard experience
- Intent-aware mock recommendation engine for budget, country, channel, saturation, margin, forecast, and excluded categories
- Every AI recommendation explains opportunity, trend score, beginner launch score, saturation, competition, margin, price, cost, best country, best platform, forecast, risks, and alternatives
- Product Forecast Engine with 2, 4, and 8 week outlooks, forecast confidence, expected growth, trend lifespan, saturation timing, growth direction, and simulated signal bars
- Trending Products filters and sorting
- Separate New Store Mode dashboard with Beginner Launch Score and beginner-only product filtering
- Hidden Gems early-signal view
- Product Simulator for pasted links or product names with success probability, demand, competition, saturation, price, cost, profit, audience, countries, ad platforms, hooks, risks, and Avoid/Test/Strong Test guidance
- Pricing and account pages
- Placeholder API routes for OpenAI, Stripe, and Supabase

## Scoring

Opportunity Score = demand 30% + low competition 20% + profit margin 20% + trend momentum 15% + supplier reliability 10% + shipping ease 5%.

## Future integrations

The MVP keeps data mocked, with structure ready for TikTok, Google Trends, Amazon, Etsy, AliExpress, Pinterest, Reddit, and supplier quality APIs.

## Forecast signals

Forecasts are simulated from Google search growth, TikTok creator growth, video engagement, Pinterest saves, marketplace sales growth, supplier availability, competition growth, search momentum, trend acceleration, and seasonality.

## New Store Mode

Beginner Launch Score is based on low saturation, easy shipping, high margin, simple creatives, low refund risk, reliable suppliers, small product size, and long trend lifespan. Products that are already saturated or operationally unrealistic for a first Shopify store are excluded from recommendations.

## Hidden Gems

Hidden Gems only shows products that are still early. Each product includes Early Growth Score, Competition Level, Trend Probability, Estimated Time Before Saturation, Confidence, why it was selected, and a warning when competition signals suggest it is becoming saturated.
