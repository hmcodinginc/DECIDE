-- DECIDE schema: identities, decisions, usage, billing.
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  status text not null default 'none' check (status in ('none', 'active', 'cancelled', 'expired', 'past_due')),
  razorpay_subscription_id text unique,
  razorpay_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  question text not null,
  status text not null check (status in ('draft', 'complete')),
  constraints jsonb not null default '{}'::jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decision_options (
  id uuid primary key,
  decision_id uuid not null references public.decisions on delete cascade,
  name text not null,
  description text not null default '',
  url text not null default '',
  images jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  notes text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.decision_criteria (
  id uuid primary key,
  decision_id uuid not null references public.decisions on delete cascade,
  key text not null,
  label text not null,
  weight numeric not null default 5,
  kind text not null check (kind in ('benefit', 'cost'))
);

create table if not exists public.decision_ratings (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions on delete cascade,
  option_id uuid not null references public.decision_options on delete cascade,
  criterion_id uuid not null references public.decision_criteria on delete cascade,
  relative text not null,
  score numeric not null,
  unique (option_id, criterion_id)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null default 'decision_analysis',
  decision_id uuid references public.decisions on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  razorpay_payment_id text unique,
  razorpay_order_id text,
  razorpay_subscription_id text,
  amount integer,
  currency text not null default 'INR',
  status text not null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists decisions_user_updated_idx on public.decisions (user_id, updated_at desc);
create index if not exists decision_options_decision_idx on public.decision_options (decision_id);
create index if not exists decision_criteria_decision_idx on public.decision_criteria (decision_id);
create index if not exists decision_ratings_decision_idx on public.decision_ratings (decision_id);
create index if not exists usage_events_user_created_idx on public.usage_events (user_id, created_at desc);
create index if not exists payments_user_idx on public.payments (user_id);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_options enable row level security;
alter table public.decision_criteria enable row level security;
alter table public.decision_ratings enable row level security;
alter table public.usage_events enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.product_events enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "subscriptions_select_own" on public.subscriptions
  for select using ((select auth.uid()) = user_id);

create policy "decisions_all_own" on public.decisions
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "options_all_own" on public.decision_options
  for all using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  );

create policy "criteria_all_own" on public.decision_criteria
  for all using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  );

create policy "ratings_all_own" on public.decision_ratings
  for all using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_id and d.user_id = (select auth.uid())
    )
  );

create policy "usage_select_own" on public.usage_events
  for select using ((select auth.uid()) = user_id);

create policy "payments_select_own" on public.payments
  for select using ((select auth.uid()) = user_id);

create policy "events_insert" on public.product_events
  for insert with check (
    user_id is null or user_id = (select auth.uid())
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'none')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.owns_decision(p_decision_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.decisions
    where id = p_decision_id and user_id = auth.uid()
  );
$$;

create or replace function public.get_entitlement()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sub public.subscriptions%rowtype;
  used integer := 0;
  remaining integer;
  lim integer;
  can_analyze boolean;
  effective_plan text;
  effective_status text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into sub from public.subscriptions where user_id = uid;
  if not found then
    insert into public.subscriptions (user_id, plan, status)
    values (uid, 'free', 'none')
    returning * into sub;
  end if;

  effective_plan := sub.plan;
  effective_status := sub.status;

  if sub.plan in ('pro', 'premium')
     and sub.status = 'active'
     and sub.current_period_end is not null
     and sub.current_period_end < now() then
    effective_plan := 'free';
    effective_status := 'expired';
  end if;

  if effective_plan = 'premium' and effective_status = 'active' then
    return jsonb_build_object(
      'plan', 'premium',
      'status', effective_status,
      'remaining', null,
      'limit', null,
      'period_end', sub.current_period_end,
      'can_analyze', true
    );
  end if;

  if effective_plan = 'pro' and effective_status = 'active' then
    lim := 25;
    select count(*) into used
    from public.usage_events
    where user_id = uid
      and kind = 'decision_analysis'
      and created_at >= coalesce(sub.current_period_start, date_trunc('month', now()));
    remaining := greatest(lim - used, 0);
    can_analyze := remaining > 0;
    return jsonb_build_object(
      'plan', 'pro',
      'status', effective_status,
      'remaining', remaining,
      'limit', lim,
      'period_end', sub.current_period_end,
      'can_analyze', can_analyze
    );
  end if;

  lim := 5;
  select count(*) into used
  from public.usage_events
  where user_id = uid and kind = 'decision_analysis';
  remaining := greatest(lim - used, 0);
  can_analyze := remaining > 0;

  return jsonb_build_object(
    'plan', 'free',
    'status', effective_status,
    'remaining', remaining,
    'limit', lim,
    'period_end', null,
    'can_analyze', can_analyze
  );
end;
$$;

create or replace function public.try_consume_decision(p_decision_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  entitlement jsonb;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  entitlement := public.get_entitlement();
  if not (entitlement ->> 'can_analyze')::boolean then
    return jsonb_build_object(
      'allowed', false,
      'remaining', entitlement -> 'remaining',
      'plan', entitlement ->> 'plan',
      'message', 'You''ve used your free decisions. Keep deciding with Pro or Premium.'
    );
  end if;

  insert into public.usage_events (user_id, kind, decision_id)
  values (uid, 'decision_analysis', p_decision_id);

  entitlement := public.get_entitlement();
  return jsonb_build_object(
    'allowed', true,
    'remaining', entitlement -> 'remaining',
    'plan', entitlement ->> 'plan'
  );
end;
$$;

grant execute on function public.get_entitlement() to authenticated;
grant execute on function public.try_consume_decision(uuid) to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.decision_options to authenticated;
grant select, insert, update, delete on public.decision_criteria to authenticated;
grant select, insert, update, delete on public.decision_ratings to authenticated;
grant select on public.usage_events to authenticated;
grant select on public.payments to authenticated;
grant insert on public.product_events to anon, authenticated;
