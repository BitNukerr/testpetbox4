# PetBox Admin Dashboard

This document summarizes the current PetBox admin area.

## Routes

- `/admin`
- `/admin/home`
- `/admin/configurator`
- `/admin/orders`
- `/admin/products`
- `/admin/plans`
- `/admin/users`
- `/admin/customers`
- `/admin/subscriptions`
- `/admin/journal`
- `/admin/settings`

## Implementation

The admin section uses Bootstrap 5 layout classes and a dedicated admin stylesheet inspired by the OneUI admin template.

The admin layout imports Bootstrap inside `app/admin/layout.tsx` and keeps custom admin styling isolated in `app/admin/admin.css`.

## Current Data Sources

- Products, plans, posts, homepage settings, configurator settings, registered users, and orders are connected to Supabase through protected admin API routes.
- Orders are created by the checkout flow and can be updated from the admin orders page.
- Local fallback data remains in `data/admin.ts` and `lib/admin-store.ts` so the UI still opens during local development before Supabase is configured.

## Security Notes

- Use `ADMIN_ACCESS_CODE`, not a `NEXT_PUBLIC_` variable, for admin access.
- Keep `SUPABASE_SECRET_KEY` and `ADMIN_SESSION_SECRET` server-side only.
- Use `supabase/petbox-rls-schema.sql` as the current database schema.
