create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.research_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  board_id uuid references public.research_boards(id) on delete set null,
  product_id text not null,
  product_name text not null,
  status text not null default 'watch' check (status in ('watch', 'test', 'avoid', 'launched')),
  notes text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  prompt text not null,
  response jsonb not null,
  mode text not null default 'mock',
  created_at timestamptz default now()
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.research_boards enable row level security;
alter table public.saved_products enable row level security;
alter table public.ai_runs enable row level security;
alter table public.billing_events enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Boards are owned by user"
  on public.research_boards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Saved products are owned by user"
  on public.saved_products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "AI runs are readable by owner"
  on public.ai_runs for select
  using (auth.uid() = user_id);

create policy "AI runs are insertable by owner"
  on public.ai_runs for insert
  with check (auth.uid() = user_id or user_id is null);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.analytics_events (event_type, user_id, metadata)
  values ('signup', new.id, jsonb_build_object('email', new.email));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The "editable by owner" UPDATE policy above has no WITH CHECK and no
-- column restriction, which means (by itself) a logged-in user could call
-- supabase.from('profiles').update({ subscription_status: 'active', plan:
-- 'scale' }) directly from browser JS and grant themselves paid access
-- without ever paying — RLS only confirms *whose* row is being touched, not
-- *which columns* may change. This trigger closes that: browser-originated
-- writes (Postgres roles "anon" and "authenticated", i.e. anon-key and
-- user-JWT requests via PostgREST) cannot change billing fields. Only the
-- service-role client (used by /api/stripe/webhook, via SUPABASE_SERVICE_ROLE_KEY)
-- and dashboard/SQL-editor access (role "postgres") can.
create or replace function public.protect_profile_billing_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.subscription_status is distinct from old.subscription_status
       or new.plan is distinct from old.plan
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
      raise exception 'Billing fields can only be changed by the system, not directly by users.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_billing_fields on public.profiles;
create trigger protect_profiles_billing_fields
  before update on public.profiles
  for each row execute function public.protect_profile_billing_fields();

-- Real curated product catalog (sourced from CJ Dropshipping + admin/AI curation).
-- Documented here for reproducibility; if this table already exists in your
-- project (it was originally created directly via the Supabase SQL editor),
-- this is a no-op thanks to `if not exists`.
create table if not exists public.curated_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  country text not null default 'United States',
  platform text not null,
  trend_score numeric not null default 70,
  launch_score numeric not null default 70,
  growth numeric not null default 20,
  saturation text not null,
  profit_margin numeric not null default 60,
  viral_potential numeric not null default 60,
  demand numeric not null default 60,
  competition numeric not null default 50,
  trend_momentum numeric not null default 60,
  supplier_reliability numeric not null default 70,
  shipping_ease numeric not null default 70,
  suggested_price numeric not null default 0,
  estimated_cost numeric not null default 0,
  target_audience text,
  why_trending text,
  trend_forecast text,
  supplier_notes text,
  ai_recommendation text,
  risks text[] not null default '{}',
  similar_alternatives text[] not null default '{}',
  ad_angles text[] not null default '{}',
  early_signal text,
  data_source text not null default 'manual' check (data_source in ('cj_dropshipping', 'manual', 'demo')),
  cj_product_id text,
  source_url text,
  listed_num integer,
  verified_inventory integer,
  delivery_cycle_days text,
  cj_trending_flag boolean default false,
  curator_trend_assessment numeric,
  curator_notes text,
  curated_by text default 'admin',
  status text not null default 'active' check (status in ('active', 'archived')),
  curated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.curated_products enable row level security;
-- No public policies: reads/writes only go through the server-side admin
-- (service role) client in this app, same posture as billing_events below.
-- This keeps internal curator_notes and similar fields out of the anon API.

-- Lightweight product analytics: signups, checkout funnel, and (via the
-- Stripe webhook) subscription churn events, so there's a real record to
-- build conversion/churn dashboards from without a third-party analytics tool.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;
-- No public policies: only the server-side admin client writes/reads these.
