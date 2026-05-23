# Supabase Auth Implementation Plan

Phase 11 is a planning checkpoint. Do not apply these changes until they can be implemented and tested as a controlled auth migration.

## Goals

- Replace production demo auth with Supabase Auth.
- Keep local demo mode available for development.
- Load roles from the backend/database, not browser localStorage.
- Attach Supabase access tokens to backend API calls.
- Bootstrap the first owner from `OWNER_EMAIL`.
- Create a profile row on first successful login.

Non-goals:

- Do not implement live payments.
- Do not add affiliate API keys.
- Do not rewrite the UI.
- Do not remove local demo mode from development.

## Current State

Frontend:

- `src/api/base44Client.js` is the Base44-compatible local shim. It currently returns and persists a demo user through localStorage.
- `src/lib/AuthContext.jsx` and `src/components/auth/AuthProvider.jsx` are separate auth providers. Both ultimately rely on `User.me()`.
- `src/api/apiClient.js` sends backend requests but does not attach `Authorization: Bearer <access_token>`.
- The root `package.json` does not currently include `@supabase/supabase-js`; only the backend does.

Backend:

- `backend/src/lib/auth.js` already has `getRequestUser`, `requireAuth`, `requireRole`, and `requireOwner`.
- Token lookup currently delegates to `store.authUserFromToken` when available.
- Non-production requests can still fall back to a local demo user.
- Production behavior should become strict once Supabase Auth is wired end-to-end.

Database:

- `backend/supabase/migrations/0001_the_poles_core.sql` creates `profiles` as a flexible `data jsonb` table.
- `profiles` does not yet have first-class `auth_user_id`, `email`, or `role` columns.
- RLS policies are not yet enabled.

## Auth Modes

Use an explicit mode switch so local demo behavior remains predictable:

```text
VITE_AUTH_MODE=demo|supabase
```

Recommended behavior:

- `demo`: keep current localStorage demo user behavior.
- `supabase`: use Supabase Auth session and backend-loaded profile/role.
- unset in local dev: default to `demo` if Supabase frontend env vars are absent.
- production: require `supabase`; do not accept demo headers or local demo role authority.

Frontend env vars to add when implementing:

```text
VITE_AUTH_MODE=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend env already has:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
OWNER_EMAIL=
```

## Frontend Supabase Client

Add a browser-only Supabase client, for example:

```text
src/api/supabaseAuthClient.js
```

Responsibilities:

- Create the Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Expose `getSession()`, `getAccessToken()`, `onAuthStateChange()`.
- Expose auth actions:
  - `signUp(email, password, metadata)`
  - `signInWithPassword(email, password)`
  - `signOut()`
  - optional later OAuth methods
- Do nothing in demo mode except return null session/token.

Implementation note:

- Add `@supabase/supabase-js` to the root frontend dependencies during the implementation phase.
- Keep the backend service role key backend-only. Never expose it through `VITE_*`.

## Signup, Login, Logout

Keep the UI changes small and focused. Existing auth-facing methods can preserve the current app shape:

- `User.loginWithRedirect(callbackUrl)`:
  - in demo mode, keep existing local demo behavior.
  - in Supabase mode, route to a login screen or call Supabase OAuth/password flow depending on the final UI decision.
- `User.logout()`:
  - in demo mode, clear demo-local auth state.
  - in Supabase mode, call `supabase.auth.signOut()` and clear in-memory auth state.
- `User.me()`:
  - in demo mode, read the local demo user from localStorage.
  - in Supabase mode, read the current Supabase session, call backend `/api/auth/me`, and return the backend profile/user payload.
- `User.updateMyUserData(data)`:
  - in demo mode, keep localStorage persistence.
  - in Supabase mode, call a backend profile update endpoint that strips/ignores `role`.

Supabase session persistence:

- Use Supabase's default localStorage session persistence.
- Subscribe to `onAuthStateChange` and refresh the app user from backend `/api/auth/me` after sign-in, token refresh, and sign-out.

## Backend API Token Attachment

Update `src/api/apiClient.js` during implementation:

- Ask the auth client for the current access token before each backend request.
- If a token exists, add:

```text
Authorization: Bearer <access_token>
```

- Keep requests working without a token in demo mode.
- Keep `VITE_API_BASE_URL` behavior unchanged.

This ensures existing backend function calls such as `entityList`, `entityCreate`, `affiliateRedirect`, and profile calls can share the same auth path.

## Backend Token Verification

Extend `backend/src/lib/auth.js` and store helpers so the backend is the source of truth:

1. Extract bearer token.
2. Verify token with Supabase Auth using backend configuration.
3. Resolve the Supabase user id and email.
4. Load or create the matching `profiles` row.
5. Return a request user shaped like:

```js
{
  id: profile.id,
  authUserId: supabaseUser.id,
  email: profile.email,
  role: profile.role
}
```

Important rules:

- Do not trust browser-sent role values.
- Do not trust JWT user metadata as the final role authority.
- Role comes from `profiles.role`, except during server-side `OWNER_EMAIL` bootstrap.
- In production, reject requests without a valid Supabase token for protected routes.
- Keep demo fallback only when `NODE_ENV !== "production"` or explicit demo mode is configured.

## OWNER_EMAIL Bootstrap

Use `OWNER_EMAIL` as a server-side bootstrap only:

- On first authenticated `/api/auth/me` call, if the Supabase user's email matches `OWNER_EMAIL`, upsert their profile with `role = "owner"`.
- This should be idempotent.
- Do not allow frontend payloads to set owner/admin roles.
- Role changes after bootstrap should use an owner-only backend endpoint and audit log.

Recommended safety:

- If a profile already exists with a stronger manual role, do not downgrade it.
- If `OWNER_EMAIL` is blank, no automatic owner bootstrap occurs.
- Document that production launch must set `OWNER_EMAIL` before the first owner signs in.

## Profile Creation On First Login

Add backend profile helper behavior:

- Lookup by `auth_user_id`.
- If missing, lookup by email to support migration of existing demo/profile rows.
- If still missing, insert:

```text
auth_user_id = auth.users.id
email = auth.users.email
role = owner if email matches OWNER_EMAIL else user
data = {
  full_name/name/avatar_url from Supabase user metadata when present
}
```

The backend response should include a normalized user object for the frontend:

```js
{
  id,
  email,
  role,
  name,
  full_name,
  data
}
```

## Role Loading

Frontend guards should use only the backend-returned user role:

- `src/components/auth/RequireRole.jsx`
- `src/components/layout/AppSidebar.jsx`
- route wrappers in `src/App.jsx`

The role should flow through a single auth state source. During implementation, either:

- consolidate `src/lib/AuthContext.jsx` and `src/components/auth/AuthProvider.jsx`, or
- make both providers call the same shared auth session module.

Avoid letting one provider use Supabase while the other still uses stale demo state.

## Backend Routes To Add

Add a dedicated auth route module, for example:

```text
backend/src/routes/auth.js
```

Routes:

- `GET /api/auth/me`
  - requires valid Supabase token in Supabase mode.
  - returns normalized profile/user with role.
  - creates profile on first login.
- `PATCH /api/auth/me`
  - updates safe profile fields only.
  - never accepts `role`, `auth_user_id`, or privileged fields.
- `POST /api/auth/roles`
  - owner-only role update endpoint.
  - validates role enum.
  - writes audit log.

Wire the route in:

```text
backend/src/server.js
```

## Supabase Migrations

Split auth schema from RLS enforcement so owner bootstrap can be verified before policies are enabled:

```text
backend/supabase/migrations/0002_profile_auth_columns.sql
backend/supabase/migrations/0003_auth_rbac_rls.sql
```

`0002_profile_auth_columns.sql` contains only profile auth schema:

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
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
```

It must not enable RLS or require an existing owner row.

`0003_auth_rbac_rls.sql` contains role helpers and RLS enforcement:

- Users can read their own profile.
- Users can update their own profile `data`, `name`, or safe profile fields, but not `role`.
- Owner can update roles.
- Admins can manage content tables.
- Public users can read approved public catalog/prize/game data.
- Users can only manage their own entries, matches, and private profile data.

Apply `0003` only after `OWNER_EMAIL` has signed in and `public.profiles.role = 'owner'` is verified for that auth user.

Because the current entity model uses flexible `data jsonb`, keep role and identity fields as typed columns rather than hidden inside JSON.

## Files To Change During Implementation

Frontend:

- `package.json`: add `@supabase/supabase-js`.
- `.env.example` if present, or project setup docs: add frontend Supabase placeholders.
- `src/api/supabaseAuthClient.js`: new Supabase browser auth client.
- `src/api/apiClient.js`: attach bearer token to backend requests.
- `src/api/base44Client.js`: switch `User.*` methods between demo and Supabase-backed behavior.
- `src/lib/AuthContext.jsx`: read shared auth state and backend-loaded role.
- `src/components/auth/AuthProvider.jsx`: align with shared auth state or consolidate with `src/lib/AuthContext.jsx`.
- `src/components/auth/RequireRole.jsx`: continue using backend-loaded role.
- `src/components/layout/AppSidebar.jsx`: continue hiding admin links from normal users.
- auth/login page files if a dedicated login/signup page is added.

Backend:

- `backend/src/lib/auth.js`: strict Supabase verification path, profile role lookup, production no-demo fallback.
- `backend/src/lib/store.js`: add profile lookup/upsert helpers if generic entity calls are insufficient.
- `backend/src/routes/auth.js`: new auth/profile routes.
- `backend/src/routes/functions.js`: keep existing role enforcement and ensure profile role writes stay owner-only.
- `backend/src/server.js`: mount auth routes.
- `backend/.env.example`: already has backend Supabase and `OWNER_EMAIL`; keep placeholders blank.
- `backend/supabase/migrations/0002_profile_auth_columns.sql`: profile auth columns only.
- `backend/supabase/migrations/0003_auth_rbac_rls.sql`: role helpers and RLS policies.

Docs:

- `docs/SUPABASE_SETUP.md`: add frontend auth env setup and auth smoke test steps.
- `docs/AUTH_RBAC_PLAN.md`: update after implementation if route names or policies change.

## Safe Migration Order

1. Add Supabase Auth dependency and frontend env placeholders, but keep default local mode as demo.
2. Add `0002_profile_auth_columns.sql` with typed profile auth/role columns and indexes.
3. Apply `0002_profile_auth_columns.sql` in Supabase and confirm `profiles` still works with existing flexible JSON rows.
4. Add backend profile helpers and `/api/auth/me` while preserving local demo fallback.
5. Add backend token verification and role loading from `profiles`.
6. Add frontend Supabase auth client and bearer token attachment behind `VITE_AUTH_MODE=supabase`.
7. Update `User.me()`, `User.logout()`, and profile update methods to call the backend in Supabase mode.
8. Align the two frontend auth providers to one shared auth state.
9. Smoke test demo mode:
   - profile save persists locally
   - admin sidebar remains available to local owner demo user
   - backend functions still work without Supabase env
10. Smoke test Supabase mode:
   - sign up
   - login
   - session survives refresh
   - `/api/auth/me` creates profile
    - role loads from database
    - normal user cannot access `/AffiliateAdmin`
    - owner from `OWNER_EMAIL` can access owner/admin routes
11. Verify `public.profiles.role = 'owner'` for the `OWNER_EMAIL` auth user.
12. Review and apply `0003_auth_rbac_rls.sql`.
13. Validate RLS policies.
14. Switch production env to Supabase mode and `NODE_ENV=production`.
15. Disable production demo fallback and verify protected backend calls reject missing/invalid tokens.

## Blockers And Risks

- The frontend has two auth providers; leaving them divergent can cause stale roles or inconsistent route guards.
- The root frontend does not yet depend on `@supabase/supabase-js`.
- `profiles` currently stores flexible JSON only; production auth needs typed `auth_user_id`, `email`, and `role` columns.
- Existing local demo profile data may not map cleanly to Supabase users unless email matching is handled during first login.
- Supabase email confirmation, redirect URLs, and allowed origins must be configured before public launch.
- `OWNER_EMAIL` bootstrap is powerful and must be set carefully before launch.
- RLS with flexible JSON ownership fields can be brittle; critical identity and role fields should remain typed columns.
- Backend generic entity routes should remain conservative. User-owned write policies need table-by-table review before opening public write access broadly.
