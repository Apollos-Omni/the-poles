-- The Poles Auth/RBAC RLS enforcement.
--
-- Apply only after:
--   1. 0001_the_poles_core.sql has been applied.
--   2. 0002_profile_auth_columns.sql has been applied.
--   3. Supabase Auth email/password and app env vars are configured.
--   4. The OWNER_EMAIL user has signed in through the app.
--   5. public.profiles contains that user's auth_user_id, email, and role = 'owner'.
--
-- Applying this before owner bootstrap can lock normal authenticated users out
-- of owner/admin-managed rows until repaired through SQL/service role.
-- This migration intentionally does not seed an owner, create login, or change
-- backend/frontend runtime behavior.

create or replace function public.current_profile_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.auth_user_id = auth.uid()),
    'guest'
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_profile_role() = 'owner';
$$;

create or replace function public.has_role(roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_profile_role() = any(roles);
$$;

-- RLS cannot reliably compare old and new row values by itself. This trigger
-- blocks direct self-service role changes while still allowing owners to manage
-- profile roles through owner-only admin paths.
create or replace function public.prevent_profile_role_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
    and coalesce(auth.role(), '') <> 'service_role'
    and not public.is_owner() then
    raise exception 'Only owners can update profile roles';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_self_update on public.profiles;
create trigger prevent_profile_role_self_update
before update on public.profiles
for each row execute function public.prevent_profile_role_self_update();

alter table public.profiles enable row level security;
alter table public.affiliate_offers enable row level security;
alter table public.affiliate_merchants enable row level security;
alter table public.affiliate_applications enable row level security;
alter table public.match_entries enable row level security;
alter table public.user_match_entities enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read
on public.profiles
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
on public.profiles
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists profiles_owner_manage on public.profiles;
create policy profiles_owner_manage
on public.profiles
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Flexible affiliate offer rows store publication state in data jsonb. Treat
-- only explicit active/public markers as public to avoid leaking draft offers.
drop policy if exists affiliate_offers_public_read_active on public.affiliate_offers;
create policy affiliate_offers_public_read_active
on public.affiliate_offers
for select
to anon, authenticated
using (
  lower(coalesce(data->>'active', 'false')) in ('true', '1', 'yes')
  or lower(coalesce(data->>'status', '')) = 'active'
  or lower(coalesce(data->>'is_active', 'false')) in ('true', '1', 'yes')
);

drop policy if exists affiliate_offers_affiliate_admin_manage on public.affiliate_offers;
create policy affiliate_offers_affiliate_admin_manage
on public.affiliate_offers
for all
to authenticated
using (public.has_role(array['owner', 'admin', 'affiliate_manager']))
with check (public.has_role(array['owner', 'admin', 'affiliate_manager']));

drop policy if exists affiliate_merchants_affiliate_admin_manage on public.affiliate_merchants;
create policy affiliate_merchants_affiliate_admin_manage
on public.affiliate_merchants
for all
to authenticated
using (public.has_role(array['owner', 'admin', 'affiliate_manager']))
with check (public.has_role(array['owner', 'admin', 'affiliate_manager']));

drop policy if exists affiliate_applications_affiliate_admin_manage on public.affiliate_applications;
create policy affiliate_applications_affiliate_admin_manage
on public.affiliate_applications
for all
to authenticated
using (public.has_role(array['owner', 'admin', 'affiliate_manager']))
with check (public.has_role(array['owner', 'admin', 'affiliate_manager']));

-- Match-entry ownership is conservative while entries remain flexible JSON.
-- Prefer stable Auth/profile identifiers. Email is intentionally not accepted
-- as an ownership grant because profile email can be changed independently of
-- Supabase Auth email in the current app. Legacy email-only rows must be
-- repaired by an owner/admin or service-role SQL before production enforcement.
drop policy if exists match_entries_self_manage on public.match_entries;
create policy match_entries_self_manage
on public.match_entries
for all
to authenticated
using (
  data->>'auth_user_id' = auth.uid()::text
  or data->>'user_id' = auth.uid()::text
  or data->>'profile_id' = (
    select p.id from public.profiles p where p.auth_user_id = auth.uid()
  )
  or public.has_role(array['owner', 'admin'])
)
with check (
  data->>'auth_user_id' = auth.uid()::text
  or data->>'user_id' = auth.uid()::text
  or data->>'profile_id' = (
    select p.id from public.profiles p where p.auth_user_id = auth.uid()
  )
  or public.has_role(array['owner', 'admin'])
);

-- Generic UserMatch entities are routed to user_match_entities by the backend.
-- Keep ownership checks flexible because entity rows store user identifiers in
-- data jsonb while the frontend model is still evolving.
drop policy if exists user_match_entities_self_manage on public.user_match_entities;
create policy user_match_entities_self_manage
on public.user_match_entities
for all
to authenticated
using (
  data->>'auth_user_id' = auth.uid()::text
  or data->>'user_id' = auth.uid()::text
  or data->>'created_by' = auth.uid()::text
  or data->>'profile_id' = (
    select p.id from public.profiles p where p.auth_user_id = auth.uid()
  )
  or public.has_role(array['owner', 'admin'])
)
with check (
  data->>'auth_user_id' = auth.uid()::text
  or data->>'user_id' = auth.uid()::text
  or data->>'created_by' = auth.uid()::text
  or data->>'profile_id' = (
    select p.id from public.profiles p where p.auth_user_id = auth.uid()
  )
  or public.has_role(array['owner', 'admin'])
);
