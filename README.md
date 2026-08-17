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

The decision flow works **without** Supabase. Auth, cloud history, and the 5-lifetime free limit activate when `client/.env.local` has the project URL and anon/publishable key.

### Client environment

Copy `client/.env.example` to `client/.env.local` (never commit it):

```
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Never put the service role key, database password, Razorpay secret, or webhook secret in `VITE_` variables.

### Supabase dashboard (manual)

GitHub integration is already set to deploy from `main`. After this repo is on `main`, confirm these in the DECIDE project:

1. **Authentication → Providers → Email** enabled.
2. **Authentication → URL configuration**
   - Site URL: `http://localhost:5173` while developing locally
   - Redirect URLs: `http://localhost:5173/auth/callback`, `http://localhost:5173/reset-password`, and later `https://decide.hmcoding.com/**`
3. **Google** is optional. Enable it only after adding a free Google Cloud OAuth client. Until then, the Google button stays visible and tells the user to use email.
4. For local testing, **Confirm email** can be turned off so signup creates a session immediately (still free).

Razorpay checkout is scaffolded in `supabase/functions/` and will be connected in a later step. Do not deploy those functions until then.

### Migrations

```
supabase/migrations/0001_init.sql          schema, RLS, entitlements
supabase/migrations/0002_consume_lock.sql  serialized, idempotent usage
```

## Deploy (Vercel)

1. Root directory: `client`
2. Build command: `vite build`
3. Output: `dist`
4. Add the `VITE_` environment variables
5. Attach `decide.hmcoding.com`

## North star

Too many choices. One clear answer.

**DECIDE.**
