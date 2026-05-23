# Production Auth and RBAC Plan

Phase 9 is a planning checkpoint. Do not apply these changes until they can be implemented and tested as a controlled auth migration.

## Current Auth State

Frontend:

- `src/api/base44Client.js` provides a local Base44-compatible shim.
- `User.me()` reads a local demo user from `localStorage` and falls back to `demo@thepoles.local`.
- The demo user currently defaults to `role: "admin"`.
- `User.updateMyUserData()`, `User.update()`, and `User.get()` are local demo methods and do not enforce production role rules.
- `src/lib/AuthContext.jsx` now skips the old Base44 public-settings endpoint and calls the local auth shim directly.
- `src/components/auth/AuthProvider.jsx` is a second auth provider used by `Layout.jsx`; it also calls `User.me()` and accepts the local demo user.

Backend:

- `backend/src/lib/auth.js` checks `Authorization: Bearer ...` with Supabase when available.
- If token auth fails or is absent, it falls back to a local demo user.
- `backend/src/routes/functions.js` exposes generic `entity*` routes and app functions without role-based route guards.
- `affiliateRedirect` logs clicks, but admin writes are not role-gated yet.

Database:

- `backend/supabase/migrations/0001_the_poles_core.sql` creates flexible `profiles` and app entity tables with `data jsonb`.
- `profiles` does not yet have first-class `role`, `auth_user_id`, or role-protection constraints.
- RLS policies are not yet enabled in the migration.

## Roles

Use a small ordered role set:

- `owner`: platform owner. Can manage roles, admins, app configuration, fulfillment controls, and all admin surfaces.
- `admin`: trusted operator. Can manage content, fulfillment/admin workflows, affiliate admin operations, and moderation queues. Cannot grant owner.
- `moderator`: content/community operator. Can moderate user-facing content and reports. Cannot manage roles, affiliate settings, or fulfillment payouts.
- `affiliate_manager`: can manage affiliate merchants, offers, applications, and click/reporting data. Cannot manage users or fulfillment.
- `user`: authenticated public user. Can manage their own profile and own user-owned records.
- `guest`: unauthenticated visitor. Can read public catalog/prize/game content only.

## Access Matrix

| Capability | guest | user | moderator | affiliate_manager | admin | owner |
| --- | --- | --- | --- | --- | --- | --- |
| Read public catalog, prizes, games | yes | yes | yes | yes | yes | yes |
| Edit own profile, excluding role | no | yes | yes | yes | yes | yes |
| Create/read own match entries | no | yes | yes | yes | yes | yes |
| Moderate public/user content | no | no | yes | no | yes | yes |
| Manage affiliate offers/merchants/applications | no | no | no | yes | yes | yes |
| View affiliate/admin analytics | no | no | no | yes | yes | yes |
| Manage fulfillment/admin actions | no | no | no | no | yes | yes |
| Manage app content/configuration | no | no | no | no | yes | yes |
| Change user roles | no | no | no | no | no | yes |
| Grant/revoke owner | no | no | no | no | no | yes |

Recommended hierarchy for code checks:

```js
const ADMIN_ROLES = ['owner', 'admin'];
const AFFILIATE_ADMIN_ROLES = ['owner', 'admin', 'affiliate_manager'];
const MODERATION_ROLES = ['owner', 'admin', 'moderator'];
```

## Backend-Safe Role Model

Production source of truth must be backend/database, never browser localStorage.

`profiles` should support:

- `id text primary key`
- `auth_user_id uuid unique references auth.users(id)`
- `email text unique`
- `role text not null default 'user'`
- `data jsonb not null default '{}'::jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Allowed role values:

```sql
check (role in ('owner', 'admin', 'moderator', 'affiliate_manager', 'user'))
```

New users default to `role = 'user'`.

Seed owner by env:

- Backend env: `OWNER_EMAIL=owner@example.com`
- On authenticated request, if `user.email === OWNER_EMAIL`, backend may upsert the profile as `role = 'owner'`.
- This should be idempotent and only run server-side.

Never allow normal users to update their own role:

- Strip `role` from profile self-update payloads.
- Only `requireOwner` can call role-update endpoints.
- RLS should also block client-side role mutation.

Local demo exception:

- In local dev only, with no Supabase env vars, `demo@thepoles.local` may behave as `owner`.
- Production must require real Supabase Auth and must not accept demo headers as authority.

## Backend Middleware To Add

Target file:

- `backend/src/lib/auth.js`

Prepare:

```js
export async function getRequestUser(req, store) {
  // Existing token lookup remains, but production fallback behavior changes.
}

export function requireAuth() {
  return async (req, res, next) => {
    const user = await getRequestUser(req, req.app.locals.store);
    if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
    req.user = user;
    next();
  };
}

export function requireRole(...roles) {
  return [requireAuth(), (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    next();
  }];
}

export const requireOwner = () => requireRole('owner');
```

Production behavior:

- If `NODE_ENV === 'production'`, no demo fallback unless an explicit internal test flag exists and is disabled by default.
- In non-production, demo fallback can return `role: 'owner'`.

Store support needed:

- Add profile lookup/upsert helpers, or use existing generic store methods with `profiles`.
- Fetch role from `profiles.role`, not from untrusted JWT metadata alone.
- JWT metadata can be a fallback only after database profile lookup fails.

## Backend Routes To Protect

Target file:

- `backend/src/routes/functions.js`

Route categories:

### Affiliate Admin Writes

Require `owner`, `admin`, or `affiliate_manager` for writes to:

- `AffiliateMerchant`
- `AffiliateOffer`
- `AffiliateApplication` status updates
- `affiliate_merchants`
- `affiliate_offers`
- `affiliate_applications`

Reads:

- Public catalog can read active public offers.
- Admin list/read of inactive/private offers requires affiliate admin role.

### User Role Changes

Require `owner` only.

Add dedicated endpoint instead of allowing generic entity role writes:

- `POST /api/functions/updateUserRole`
- Body: `{ userId, role }`
- Validate role enum.
- Audit every role change.

Generic entity routes must reject `role` updates to `Profile`/`profiles` unless owner.

### Fulfillment / Admin Actions

Require `owner` or `admin` for:

- North Pole fulfillment admin actions
- `NorthPoleFulfillment` status updates
- fulfillment event admin writes
- order/shipping/admin notes
- manual winner override, if ever added

Public/user writes can create user-owned match entries and scores, but not fulfillment status.

### Normal Entity Writes

Generic `entityCreate`, `entityUpdate`, `entityDelete`, and `entityBulkCreate` should enforce ownership rules:

- Public/user-owned entities must set `owner_id`, `user_id`, or `created_by` to `req.user.id` server-side.
- Users can update/delete only rows they own.
- Admin roles can manage broader content tables.
- Public reads are allowed only for explicitly public tables/filters.
- Deny by default when table ownership policy is unknown.

Suggested policy registry:

```js
const ENTITY_POLICIES = {
  profiles: { selfRead: true, selfUpdate: true, ownerField: 'auth_user_id', roleProtected: true },
  affiliate_offers: { publicReadFilter: { active: true }, writeRoles: AFFILIATE_ADMIN_ROLES },
  affiliate_merchants: { writeRoles: AFFILIATE_ADMIN_ROLES },
  north_pole_fulfillments: { writeRoles: ADMIN_ROLES },
  user_match_entities: { ownerField: 'created_by' },
  match_entries: { ownerField: 'user_id' },
};
```

## Frontend Route Guards

Target files:

- `src/components/auth/AuthProvider.jsx`
- `src/lib/AuthContext.jsx`
- `src/components/layout/AppSidebar.jsx`
- `src/App.jsx`
- optional new `src/components/auth/RequireRole.jsx`
- optional new `src/pages/AccessDenied.jsx`

Behavior:

- Hide `Affiliate Admin` from users whose role is not `owner`, `admin`, or `affiliate_manager`.
- Hide admin tools from users whose role is not `owner` or `admin`, except affiliate tools for `affiliate_manager`.
- Keep `Affiliate Catalog` visible to normal users.
- If a normal user manually visits `/AffiliateAdmin`, render Access Denied.
- If a normal user manually visits admin-only routes, render Access Denied.

Example guard:

```jsx
export function RequireRole({ roles, children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !roles.includes(user.role)) return <AccessDenied />;
  return children;
}
```

Route wrapping examples:

```jsx
<Route
  path="/AffiliateAdmin"
  element={<RequireRole roles={['owner', 'admin', 'affiliate_manager']}><AffiliateAdmin /></RequireRole>}
/>
```

Sidebar filtering:

- Replace hardcoded `currentUserRoles = ['admin']`.
- Read roles from auth context.
- In local demo, user role may be `owner`.

## Supabase Migration Draft

Split profile auth schema from RLS enforcement:

```text
backend/supabase/migrations/0002_profile_auth_columns.sql
backend/supabase/migrations/0003_auth_rbac_rls.sql
```

`0002_profile_auth_columns.sql` draft:

```sql
alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists email text unique,
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'moderator', 'affiliate_manager', 'user'));

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_role on public.profiles(role);

alter table public.profiles enable row level security;
alter table public.affiliate_offers enable row level security;
alter table public.affiliate_merchants enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.match_entries enable row level security;
```

Helper functions:

```sql
create or replace function public.current_profile_role()
returns text
language sql
security definer
stable
as $$
  select coalesce(
    (select role from public.profiles where auth_user_id = auth.uid()),
    'guest'
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
as $$
  select public.current_profile_role() = 'owner';
$$;

create or replace function public.has_role(roles text[])
returns boolean
language sql
security definer
stable
as $$
  select public.current_profile_role() = any(roles);
$$;
```

RLS policy notes:

- Users can read their own profile.
- Users can update their own profile data except `role`.
- Admins can manage content tables.
- Owner can manage roles.
- Public users can read public catalog/prize/game data.
- Users can only read/write their own private match entries.

Draft policies:

```sql
create policy profiles_self_read
on public.profiles for select
using (auth_user_id = auth.uid() or public.has_role(array['owner','admin']));

create policy profiles_self_update
on public.profiles for update
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid() and role = (select role from public.profiles where auth_user_id = auth.uid()));

create policy profiles_owner_manage
on public.profiles for all
using (public.is_owner())
with check (public.is_owner());

create policy affiliate_offers_public_read
on public.affiliate_offers for select
using (coalesce((data->>'active')::boolean, true) = true);

create policy affiliate_offers_manager_write
on public.affiliate_offers for all
using (public.has_role(array['owner','admin','affiliate_manager']))
with check (public.has_role(array['owner','admin','affiliate_manager']));

create policy match_entries_self
on public.match_entries for all
using ((data->>'user_id') = auth.uid()::text or public.has_role(array['owner','admin']))
with check ((data->>'user_id') = auth.uid()::text or public.has_role(array['owner','admin']));
```

Role-column protection is stronger in backend code than RLS alone because the current flexible `data jsonb` model can hide fields. Production should move critical profile identity/role fields out of JSONB into typed columns.

## Exact Files To Change In Implementation Phase

Backend:

- `backend/src/lib/auth.js`: add `requireAuth`, `requireRole`, `requireOwner`, production no-demo fallback, profile role lookup/upsert.
- `backend/src/server.js`: attach `store` to `app.locals` or pass auth middleware context cleanly.
- `backend/src/routes/functions.js`: apply route/table policies to generic entity routes and function routes.
- `backend/src/lib/store.js`: add focused profile helpers if generic store calls become too awkward.
- `backend/.env.example`: add `OWNER_EMAIL=owner@example.com` placeholder.
- `backend/supabase/migrations/0002_profile_auth_columns.sql`: add typed profile role columns only.
- `backend/supabase/migrations/0003_auth_rbac_rls.sql`: add role helpers and RLS.

Frontend:

- `src/api/base44Client.js`: support real Supabase auth token flow or call backend `/api/auth/me`; keep demo only in local dev.
- `src/lib/AuthContext.jsx`: expose `user.role`, loading state, and auth-required behavior for production.
- `src/components/auth/AuthProvider.jsx`: align with the same auth context behavior or consolidate providers later.
- `src/components/layout/AppSidebar.jsx`: filter admin links based on real user role.
- `src/App.jsx`: wrap protected routes.
- New `src/components/auth/RequireRole.jsx`: reusable route guard.
- New `src/pages/AccessDenied.jsx`: simple denied page.

## Migration Sequence

1. Add backend middleware and role lookup while keeping local demo owner behavior.
2. Add frontend role-aware hiding and route guards.
3. Add and apply `0002_profile_auth_columns.sql`.
4. Bootstrap owner via `OWNER_EMAIL` sign-in and verify `public.profiles.role = 'owner'`.
5. Review and apply `0003_auth_rbac_rls.sql`.
6. Change production backend to reject unauthenticated requests instead of using demo fallback.
7. Smoke test:
   - guest catalog read
   - user profile update without role mutation
   - user blocked from `/AffiliateAdmin`
   - affiliate manager can manage offers
   - admin can manage fulfillment
   - owner can change roles
7. Only after this is stable, revisit real payments and fulfillment controls separately.

## Non-Goals

- Do not implement live payments in the auth/RBAC phase.
- Do not add affiliate API keys.
- Do not rewrite UI.
- Do not trust browser-side role values for backend decisions.
