-- Simulated prize-match payment, score verification, and fulfillment scaffold.
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

select public.create_flexible_entity_table('match_scores');
select public.create_flexible_entity_table('fulfillment_orders');
select public.create_flexible_entity_table('score_submissions');
select public.create_flexible_entity_table('match_evidence');
select public.create_flexible_entity_table('winner_verifications');
select public.create_flexible_entity_table('match_disputes');
select public.create_flexible_entity_table('fulfillment_intents');
select public.create_flexible_entity_table('purchase_intents');

create index if not exists idx_match_scores_match_id
  on public.match_scores ((data->>'matchId'));

create index if not exists idx_fulfillment_orders_match_id
  on public.fulfillment_orders ((data->>'matchId'));

create index if not exists idx_score_submissions_match_id
  on public.score_submissions ((data->>'match_id'));

create index if not exists idx_match_evidence_match_id
  on public.match_evidence ((data->>'match_id'));

create index if not exists idx_winner_verifications_match_id
  on public.winner_verifications ((data->>'match_id'));

create index if not exists idx_match_disputes_match_id
  on public.match_disputes ((data->>'match_id'));

create index if not exists idx_fulfillment_intents_match_id
  on public.fulfillment_intents ((data->>'match_id'));

create index if not exists idx_purchase_intents_match_id
  on public.purchase_intents ((data->>'match_id'));

drop function if exists public.create_flexible_entity_table(text);
