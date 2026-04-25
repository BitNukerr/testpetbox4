# PetBox

Pet subscription box demo built with Next.js and Stripe-ready account actions.

## Features

- Dogs + cats
- Monthly + quarterly plans
- Subscription + one-time purchases
- Pet box configurator
- Mobile-friendly navigation
- Stripe Checkout
- Stripe Billing Portal
- Local cart and mock order persistence

## Run locally on Windows

```bat
cd path\to\petbox
npm install
copy .env.example .env.local
npm run dev
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your Supabase publishable key
SUPABASE_SERVICE_ROLE_KEY=your Supabase service role key
```

For Supabase, copy the full project URL from **Supabase Dashboard -> Project Settings -> API**.
It should look like `https://abcdefghijklm.supabase.co`; do not use only the project ref or a shortened `.co` domain.
The browser client uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `NEXT_PUBLIC_SUPABASE_ANON_KEY` is still supported as a fallback for older projects.

## Stripe local testing

For webhooks:

```bat
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value into `.env.local`.

## Important notes

- Orders and customer linkage are stored in browser localStorage for local demo purposes.
- For production, add auth + database persistence and save Stripe customer IDs server-side.
