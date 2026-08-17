# DECIDE

**Stop comparing. Get a decision.**

DECIDE is a personal decision engine. You give it your options, what you care about, and your constraints. It returns **one recommendation** — and the reasons it won.

Live domain: [https://decide.hmcoding.com](https://decide.hmcoding.com)

## Product

- Not a chatbot
- Not a review site
- A guided comparison that ends in a choice

**Free** — ₹0 — 5 lifetime decision analyses  
**Pro** — ₹500/month — 25 decisions per month  
**Premium** — ₹2,000/month — unlimited

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion |
| Hosting | Vercel (`client` as the root directory) |
| Auth / DB | Supabase |
| Payments | Razorpay (verified server-side) |
| Decision engine | Deterministic local engine (no paid AI required) |

Infrastructure budget for MVP: **₹0** beyond tools you already have.

## Project layout

```
client/                 Vite app
  src/components/       UI, landing, decision, billing
  src/pages/            Thin route pages
  src/services/         Decision engine, auth, billing, AI interfaces
  src/lib/              Supabase client, validation, helpers
supabase/
  migrations/           Postgres schema, RLS, entitlement RPCs
  functions/            Razorpay checkout + webhook
```

## Local development

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

The decision flow works **without** Supabase. Auth, history sync, usage limits, and billing activate when environment variables are set.

### Client environment

```
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RAZORPAY_KEY_ID=
```

Never put the Supabase service role key, Razorpay secret, or webhook secret in `VITE_` variables.

### Supabase

1. Create a project on the free tier.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or `supabase db push`).
3. Enable Email and (optionally) Google auth.
4. Deploy functions:

```bash
supabase functions deploy create-checkout
supabase functions deploy razorpay-webhook
```

Set function secrets:

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RAZORPAY_PLAN_PRO
RAZORPAY_PLAN_PREMIUM
```

Create matching Razorpay subscription plans (₹500 and ₹2,000 monthly) and paste their plan IDs into those secrets. Point the Razorpay webhook at:

`https://<project>.supabase.co/functions/v1/razorpay-webhook`

Events to enable: `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`, `payment.failed`.

## Deploy (Vercel)

1. Root directory: `client`
2. Build command: `vite build`
3. Output: `dist`
4. Add the `VITE_` environment variables
5. Attach `decide.hmcoding.com`

## North star

Too many choices. One clear answer.

**DECIDE.**
