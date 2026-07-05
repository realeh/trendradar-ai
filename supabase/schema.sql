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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
