# PetBox Admin Dashboard

This version adds a Bootstrap-inspired admin area to the latest PetBox project.

## New routes

- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/customers`
- `/admin/subscriptions`
- `/admin/journal`
- `/admin/settings`

## Bootstrap implementation

The admin section uses Bootstrap 5 layout classes and a dedicated admin stylesheet inspired by the OneUI admin template.

The admin layout loads Bootstrap from CDN inside `app/admin/layout.tsx` and keeps custom admin styling isolated in `app/admin/admin.css`.

## What can be connected next

The UI currently uses mock admin data in `data/admin.ts`.

To make it fully dynamic, connect:
- orders to Easypay webhooks + Supabase
- products to Supabase tables
- customers to Supabase Auth users
- blog posts to a CMS or Supabase table
- admin-only access through a role field in Supabase
