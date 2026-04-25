-- Supabase/Postgres schema for PetBox
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  total numeric(10,2) not null default 0,
  status text not null default 'confirmada',
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text,
  plan_name text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can read own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
