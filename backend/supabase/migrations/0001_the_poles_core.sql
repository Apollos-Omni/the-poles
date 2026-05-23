-- The Poles backend core schema.
-- Run in Supabase SQL editor or via Supabase CLI.
--
-- The frontend entity shapes are still moving, so the core entity tables use a
-- stable id/timestamp envelope plus a flexible data jsonb payload.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.ensure_updated_at_trigger(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('drop trigger if exists set_updated_at on public.%I', table_name);
  execute format(
    'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
    table_name
  );
end;
$$;

create or replace function public.create_flexible_entity_table(table_name text)
returns void
language plpgsql
as $$
begin
  execute format(
    'create table if not exists public.%I (
      id text primary key default gen_random_uuid()::text,
      data jsonb not null default ''{}''::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )',
    table_name
  );
  execute format('alter table public.%I add column if not exists data jsonb not null default ''{}''::jsonb', table_name);
  execute format('alter table public.%I add column if not exists created_at timestamptz not null default now()', table_name);
  execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', table_name);
  execute format('create index if not exists %I on public.%I using gin (data)', 'idx_' || table_name || '_data', table_name);
  perform public.ensure_updated_at_trigger(table_name);
end;
$$;

select public.create_flexible_entity_table('profiles');
select public.create_flexible_entity_table('products');
select public.create_flexible_entity_table('prizes');
select public.create_flexible_entity_table('games');
select public.create_flexible_entity_table('matches');
select public.create_flexible_entity_table('match_entries');
select public.create_flexible_entity_table('scores');
select public.create_flexible_entity_table('fulfillments');
select public.create_flexible_entity_table('fulfillment_events');
select public.create_flexible_entity_table('affiliate_merchants');
select public.create_flexible_entity_table('affiliate_offers');
select public.create_flexible_entity_table('affiliate_clicks');
select public.create_flexible_entity_table('affiliate_applications');
select public.create_flexible_entity_table('donations');
select public.create_flexible_entity_table('audit_logs');
select public.create_flexible_entity_table('north_pole_matches');
select public.create_flexible_entity_table('north_pole_fulfillments');
select public.create_flexible_entity_table('match_events');
select public.create_flexible_entity_table('user_match_entities');
select public.create_flexible_entity_table('south_pole_challenges');
select public.create_flexible_entity_table('campaign_contributions');
select public.create_flexible_entity_table('campaign_events');
select public.create_flexible_entity_table('campaign_players');
select public.create_flexible_entity_table('team_prize_pools');
select public.create_flexible_entity_table('team_prize_campaigns');

-- Compatibility tables used by the handwritten backend function routes.
create table if not exists public.user_matches (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  game_id text not null,
  product_id text not null,
  min_players integer not null default 2,
  max_players integer not null default 2,
  buy_in_cents integer not null default 0,
  status text not null default 'open',
  starts_at timestamptz,
  ends_at timestamptz,
  rules text,
  verification_method text default 'screenshot',
  product_offer jsonb,
  winners jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.user_matches(id) on delete cascade,
  user_id text not null,
  method text not null default 'paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(match_id, user_id)
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.user_matches(id) on delete cascade,
  user_id text not null,
  total_score numeric not null,
  rank integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  stage text not null,
  message text,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  endpoint text not null,
  p256dh_key text,
  auth_key text,
  is_active boolean not null default true,
  user_agent text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

create table if not exists public.hinge_commands (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  device_id text not null,
  command_type text not null,
  args jsonb,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If an earlier version of this migration created strict versions of these
-- tables, relax them so generic entity writes can store arbitrary payloads.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scores'
      and column_name = 'match_id'
  ) then
    alter table public.scores alter column match_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scores'
      and column_name = 'user_id'
  ) then
    alter table public.scores alter column user_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scores'
      and column_name = 'score'
  ) then
    alter table public.scores alter column score drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fulfillments'
      and column_name = 'match_id'
  ) then
    alter table public.fulfillments alter column match_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fulfillments'
      and column_name = 'winner_id'
  ) then
    alter table public.fulfillments alter column winner_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'affiliate_offers'
      and column_name = 'title'
  ) then
    alter table public.affiliate_offers alter column title drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'affiliate_offers'
      and column_name = 'merchant'
  ) then
    alter table public.affiliate_offers alter column merchant drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'affiliate_offers'
      and column_name = 'affiliate_url'
  ) then
    alter table public.affiliate_offers alter column affiliate_url drop not null;
  end if;
end;
$$;

select public.ensure_updated_at_trigger('user_matches');
select public.ensure_updated_at_trigger('tickets');
select public.ensure_updated_at_trigger('leaderboard');
select public.ensure_updated_at_trigger('audit_events');
select public.ensure_updated_at_trigger('push_subscriptions');
select public.ensure_updated_at_trigger('hinge_commands');

create index if not exists idx_user_matches_status on public.user_matches(status);
create index if not exists idx_tickets_match_id on public.tickets(match_id);
create index if not exists idx_leaderboard_match_id on public.leaderboard(match_id);
create index if not exists idx_audit_events_created_at on public.audit_events(created_at desc);
create index if not exists idx_push_subscriptions_user_endpoint on public.push_subscriptions(user_id, endpoint);

drop function if exists public.create_flexible_entity_table(text);
drop function if exists public.ensure_updated_at_trigger(text);
