# Supabase RLS setup for PetBox

This setup moves customer data into Supabase with Row Level Security.

## 1. Run the SQL

1. Open Supabase.
2. Go to **SQL Editor**.
3. Paste the full contents of `supabase/petbox-rls-schema.sql`.
4. Click **Run**.

The SQL creates tables for profiles, addresses, pets, subscriptions, orders, order delivery details, products, plans, posts, store/home/configurator/legal settings, and admin users. It also links paid plan orders to subscriptions through `customer_subscriptions.source_order_id` and marks orders after confirmation emails through `orders.confirmation_email_sent_at`. It enables RLS on every public table.

## 2. Add yourself as admin

After logging into the website once with your admin email, run this in Supabase SQL Editor:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'YOUR_EMAIL_HERE'
on conflict (user_id) do nothing;
```

Replace `YOUR_EMAIL_HERE` with your real login email.

## 3. Environment variables

Keep these in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` only on the server
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_STORAGE_BUCKET` optional, defaults to `petbox-images`
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
- `ORDER_NOTIFICATION_EMAIL` optional, falls back to `CONTACT_TO_EMAIL`

Never put a secret/service key in a `NEXT_PUBLIC_` variable.

## 4. What is secure now

- Customers can only read and edit their own profiles, addresses, pets, subscriptions, and orders.
- Public visitors can read active products, active plans, published posts, and public site settings.
- Only users in `admin_users` can manage store data.
- The service/secret key stays server-side.

## 5. Next recommended migration

The checkout should eventually send only product IDs and quantities to `/api/checkout`. The server should load prices from Supabase before creating the Easypay checkout.
