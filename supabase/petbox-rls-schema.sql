-- PetBox Supabase schema with Row Level Security.
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_petbox_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_petbox_admin() from public;
grant execute on function public.is_petbox_admin() to authenticated;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_addresses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  mbway_phone text,
  address text,
  city text,
  zip text,
  nif text,
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat')),
  size text not null check (size in ('small', 'medium', 'large')),
  birthday date,
  allergies text,
  preferences text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  slug text primary key,
  title text not null,
  category text not null,
  species text not null check (species in ('dog', 'cat', 'both')),
  price numeric(10,2) not null check (price >= 0),
  description text not null,
  image text not null,
  tag text,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  cadence text not null check (cadence in ('monthly', 'quarterly')),
  price numeric(10,2) not null check (price >= 0),
  description text not null,
  perks text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  plan_id text references public.plans(id) on delete set null,
  cadence text not null check (cadence in ('monthly', 'quarterly')),
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_box_date date,
  renewal_date date,
  price numeric(10,2) not null default 0 check (price >= 0),
  extras text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  status text not null default 'Pendente',
  total numeric(10,2) not null check (total >= 0),
  payment_method text,
  easypay_checkout_id text,
  easypay_payment_id text,
  confirmation_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders
add column if not exists confirmation_email_sent_at timestamptz;

alter table public.customer_subscriptions
add column if not exists source_order_id text references public.orders(id) on delete set null;

create unique index if not exists idx_customer_subscriptions_source_order_id
on public.customer_subscriptions(source_order_id)
where source_order_id is not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_slug text references public.products(slug) on delete set null,
  plan_id text references public.plans(id) on delete set null,
  title text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

create table if not exists public.order_delivery_details (
  order_id text primary key references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  zip text,
  nif text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_posts (
  slug text primary key,
  title text not null,
  excerpt text not null,
  body text not null,
  status text not null default 'Rascunho' check (status in ('Publicado', 'Rascunho')),
  author text not null default 'Equipa PetBox',
  image text,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'PetBox',
  support_email text,
  shipping_price numeric(10,2) not null default 8 check (shipping_price >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_settings (
  id boolean primary key default true check (id),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.configurator_settings (
  id boolean primary key default true check (id),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_settings (
  id boolean primary key default true check (id),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'account_addresses',
    'pets',
    'products',
    'plans',
    'customer_subscriptions',
    'order_delivery_details',
    'journal_posts',
    'store_settings',
    'home_settings',
    'configurator_settings',
    'legal_settings'
  ]
  loop
    execute format('drop trigger if exists trg_%s_touch_updated_at on public.%I', table_name, table_name);
    execute format('create trigger trg_%s_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_profile_for_new_user on auth.users;
create trigger trg_create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.account_addresses enable row level security;
alter table public.pets enable row level security;
alter table public.products enable row level security;
alter table public.plans enable row level security;
alter table public.customer_subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_delivery_details enable row level security;
alter table public.journal_posts enable row level security;
alter table public.store_settings enable row level security;
alter table public.home_settings enable row level security;
alter table public.configurator_settings enable row level security;
alter table public.legal_settings enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_petbox_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (user_id = (select auth.uid()) or public.is_petbox_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own address" on public.account_addresses;
create policy "Users manage own address"
on public.account_addresses for all
to authenticated
using (user_id = (select auth.uid()) or public.is_petbox_admin())
with check (user_id = (select auth.uid()) or public.is_petbox_admin());

drop policy if exists "Users manage own pets" on public.pets;
create policy "Users manage own pets"
on public.pets for all
to authenticated
using (user_id = (select auth.uid()) or public.is_petbox_admin())
with check (user_id = (select auth.uid()) or public.is_petbox_admin());

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true or public.is_petbox_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public can read active plans" on public.plans;
create policy "Public can read active plans"
on public.plans for select
to anon, authenticated
using (is_active = true or public.is_petbox_admin());

drop policy if exists "Admins manage plans" on public.plans;
create policy "Admins manage plans"
on public.plans for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Users read own subscriptions" on public.customer_subscriptions;
create policy "Users read own subscriptions"
on public.customer_subscriptions for select
to authenticated
using (user_id = (select auth.uid()) or public.is_petbox_admin());

drop policy if exists "Users manage own subscriptions" on public.customer_subscriptions;
create policy "Users manage own subscriptions"
on public.customer_subscriptions for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users update own subscriptions" on public.customer_subscriptions;
create policy "Users update own subscriptions"
on public.customer_subscriptions for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
on public.orders for select
to authenticated
using (user_id = (select auth.uid()) or public.is_petbox_admin());

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
on public.orders for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and (orders.user_id = (select auth.uid()) or public.is_petbox_admin())
  )
);

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items"
on public.order_items for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Users read own delivery details" on public.order_delivery_details;
create policy "Users read own delivery details"
on public.order_delivery_details for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_petbox_admin()
  or exists (
    select 1 from public.orders
    where orders.id = order_delivery_details.order_id
    and (orders.user_id = (select auth.uid()) or public.is_petbox_admin())
  )
);

drop policy if exists "Admins manage delivery details" on public.order_delivery_details;
create policy "Admins manage delivery details"
on public.order_delivery_details for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public reads published posts" on public.journal_posts;
create policy "Public reads published posts"
on public.journal_posts for select
to anon, authenticated
using (status = 'Publicado' or public.is_petbox_admin());

drop policy if exists "Admins manage posts" on public.journal_posts;
create policy "Admins manage posts"
on public.journal_posts for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public reads store settings" on public.store_settings;
create policy "Public reads store settings"
on public.store_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings"
on public.store_settings for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public reads homepage settings" on public.home_settings;
create policy "Public reads homepage settings"
on public.home_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage homepage settings" on public.home_settings;
create policy "Admins manage homepage settings"
on public.home_settings for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public reads configurator settings" on public.configurator_settings;
create policy "Public reads configurator settings"
on public.configurator_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage configurator settings" on public.configurator_settings;
create policy "Admins manage configurator settings"
on public.configurator_settings for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

drop policy if exists "Public reads legal settings" on public.legal_settings;
create policy "Public reads legal settings"
on public.legal_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage legal settings" on public.legal_settings;
create policy "Admins manage legal settings"
on public.legal_settings for all
to authenticated
using (public.is_petbox_admin())
with check (public.is_petbox_admin());

insert into public.store_settings (id, store_name, shipping_price)
values (true, 'PetBox', 8)
on conflict (id) do nothing;

insert into public.plans (id, name, cadence, price, description, perks)
values
  ('caixa-mensal-petbox', 'Caixa Mensal PetBox', 'monthly', 39, 'Brinquedos, snacks e surpresas novas todos os meses.', array['Cancele quando quiser', 'Para caes e gatos', 'Inclui personalizacao']),
  ('caixa-trimestral-premium', 'Caixa Trimestral Premium', 'quarterly', 99, 'Uma caixa sazonal maior, com brinquedos premium e extras duradouros.', array['Melhor valor', 'Temas sazonais', 'Ideal para oferecer'])
on conflict (id) do nothing;

insert into public.products (slug, title, category, species, price, description, image, tag, rating)
values
  ('snacks-crocantes-pato', 'Snacks Crocantes de Pato', 'Snacks', 'dog', 14, 'Snacks crocantes para treino, recompensa e passeios com caes.', '/images/dog-treats.svg', 'Favorito dos caes', 4.8),
  ('cana-penas-gatos', 'Cana de Penas para Gatos', 'Brinquedos', 'cat', 16, 'Brinquedo interactivo para gatos curiosos e sessoes de brincadeira diaria.', '/images/cat-toy.svg', 'Favorito dos gatos', 4.9),
  ('balsamo-patas', 'Balsamo de Patas', 'Cuidado', 'both', 18, 'Balsamo suave para patas secas e narizes sensiveis.', '/images/paw-balm.svg', 'Caes + gatos', 4.7),
  ('corda-aventura', 'Corda de Aventura', 'Brinquedos', 'dog', 19, 'Brinquedo resistente para puxar, roer e gastar energia.', '/images/rope-toy.svg', 'Para exterior', 4.8),
  ('snacks-salmao-gatos', 'Snacks Macios de Salmao', 'Snacks', 'cat', 13, 'Snacks macios de salmao para gatos exigentes.', '/images/cat-treats.svg', 'Mordidas macias', 4.6),
  ('bandana-pet', 'Bandana Pet', 'Acessorios', 'both', 12, 'Bandana suave para fotografias e momentos especiais.', '/images/bandana.svg', 'Extra sazonal', 4.7)
on conflict (slug) do nothing;
