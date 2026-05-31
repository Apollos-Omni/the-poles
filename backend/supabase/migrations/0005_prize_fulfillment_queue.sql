-- Prize fulfillment queue for verified North Pole winners.
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

select public.create_flexible_entity_table('prize_fulfillments');

create index if not exists idx_prize_fulfillments_match_id
  on public.prize_fulfillments ((data->>'match_id'));

create index if not exists idx_prize_fulfillments_status
  on public.prize_fulfillments ((data->>'status'));

drop function if exists public.create_flexible_entity_table(text);
