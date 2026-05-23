-- The Poles profile auth columns.
--
-- Apply this after 0001 and before Supabase Auth smoke testing. This migration
-- only adds typed profile identity/role columns required by the backend auth
-- profile routes. It does not enable RLS, create RLS policies, require an
-- existing owner profile, or block profile access.
--
-- Safe order:
--   1. Apply 0001_the_poles_core.sql.
--   2. Apply this migration.
--   3. Configure Supabase Auth and env vars.
--   4. Sign up/sign in as OWNER_EMAIL.
--   5. Verify public.profiles.role = 'owner' for that auth user.
--   6. Only then review/apply 0003_auth_rbac_rls.sql.

alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists email text unique,
  add column if not exists role text default 'user';

update public.profiles
set role = 'user'
where role is null
  or role not in ('owner', 'admin', 'moderator', 'affiliate_manager', 'user');

alter table public.profiles
  alter column role set default 'user',
  alter column role set not null;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'moderator', 'affiliate_manager', 'user'));

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
