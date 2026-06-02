-- Prize Room family pilot entities.
-- These use the app's flexible entity table pattern: id, data jsonb, created_at, updated_at.

create or replace function public.create_flexible_entity_table(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('
    create table if not exists public.%I (
      id uuid primary key default gen_random_uuid(),
      data jsonb not null default ''{}''::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )', table_name);
end;
$$;

select public.create_flexible_entity_table('prize_room_templates');
select public.create_flexible_entity_table('prize_rooms');
select public.create_flexible_entity_table('player_contributions');
select public.create_flexible_entity_table('prize_room_ledger_entries');

create index if not exists idx_prize_room_templates_status
  on public.prize_room_templates ((data->>'status'));

create index if not exists idx_prize_room_templates_featured
  on public.prize_room_templates ((data->>'is_featured'));

create index if not exists idx_prize_rooms_status
  on public.prize_rooms ((data->>'status'));

create index if not exists idx_prize_rooms_match_id
  on public.prize_rooms ((data->>'match_id'));

create index if not exists idx_player_contributions_room_id
  on public.player_contributions ((data->>'room_id'));

create index if not exists idx_player_contributions_user_id
  on public.player_contributions ((data->>'user_id'));

create index if not exists idx_prize_room_ledger_entries_room_id
  on public.prize_room_ledger_entries ((data->>'room_id'));

drop function if exists public.create_flexible_entity_table(text);
