# Supabase Setup

This backend uses Supabase when `SUPABASE_URL` and a backend-only key are configured. If those variables are unset, it keeps using the in-memory store for local development.

## 1. Create a Supabase project

Create a project in Supabase and wait for the database to finish provisioning.

## 2. Apply the core schema

Run this SQL file in the Supabase SQL editor:

```text
backend/supabase/migrations/0001_the_poles_core.sql
```

The schema creates the core app tables:

```text
profiles
products
prizes
games
matches
match_entries
scores
fulfillments
fulfillment_events
affiliate_merchants
affiliate_offers
affiliate_clicks
affiliate_applications
donations
audit_logs
```

These tables use `data jsonb` for flexible frontend entity payloads while app shapes are still settling.

The migration also keeps compatibility tables used by current backend functions, including `user_matches`, `tickets`, `leaderboard`, `audit_events`, `push_subscriptions`, and `hinge_commands`.

## 3. Apply profile auth columns

Run this SQL file after `0001` and before Supabase Auth smoke testing:

```text
backend/supabase/migrations/0002_profile_auth_columns.sql
```

This migration only adds typed auth/profile columns and indexes:

```text
profiles.auth_user_id
profiles.email
profiles.role
```

It does not enable RLS and does not require an existing owner profile. Do not apply `0003_auth_rbac_rls.sql` yet.

## 4. Configure backend env

Copy the backend env example:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set these values in `backend/.env`:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-backend-only-service-role-key
SUPABASE_ANON_KEY=your-project-anon-key
OWNER_EMAIL=owner@example.com
```

Do not put the service role key in frontend `VITE_*` variables or browser-exposed hosting settings.

The backend will prefer `SUPABASE_SERVICE_ROLE_KEY` for data access when both keys are present. `SUPABASE_ANON_KEY` is still useful for validating auth-token behavior against the same project.

`OWNER_EMAIL` is the server-side owner bootstrap email. Set it to the exact Supabase Auth email for the first owner account before testing owner/admin access.

## 5. Configure frontend env

Copy the frontend env example:

```powershell
Copy-Item .env.example .env
```

Demo mode remains the default:

```text
VITE_AUTH_MODE=demo
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
```

To smoke test Supabase Auth, set:

```text
VITE_AUTH_MODE=supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-project-anon-key
VITE_API_BASE_URL=http://localhost:8787
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in `.env`, `VITE_*`, frontend hosting variables, or any browser-exposed setting.

## 6. Run locally

Start the backend:

```powershell
npm.cmd --prefix backend run dev
```

Start the frontend:

```powershell
npm.cmd run dev
```

Check the backend storage mode:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
```

The response should report `storage` as `supabase` when env vars are configured, or `memory` when they are not.

## 7. Demo-mode smoke test

Use this test before enabling Supabase mode:

1. Leave `VITE_AUTH_MODE=demo`, or leave it unset.
2. Leave backend Supabase env blank if you want in-memory local dev.
3. Start backend and frontend.
4. Confirm the app opens without a login screen.
5. Confirm the demo user loads as the current user.
6. Update profile/demo user data and refresh.
7. Confirm the update remains in browser localStorage.
8. Confirm owner/admin navigation still appears for the local owner demo user.

This confirms the Supabase auth work has not changed the current demo-mode behavior.

## 8. Supabase Auth smoke test

Use this test after `0001` and `0002_profile_auth_columns.sql` are applied, and before applying RLS migration `0003_auth_rbac_rls.sql`.

1. In Supabase Auth settings, confirm email/password sign-in is enabled.
2. Configure allowed site URL and redirect URLs for local development, for example `http://localhost:5173`.
3. Set backend `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and `OWNER_EMAIL`.
4. Set frontend `VITE_AUTH_MODE=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
5. Start backend and frontend.
6. Open the frontend. With no existing Supabase session, the login/signup screen should appear.
7. Sign up with the email that matches `OWNER_EMAIL`, or sign in if the user already exists.
8. If email confirmation is enabled, confirm the email, then sign in.
9. Confirm the app loads after sign-in.
10. Confirm the frontend calls `GET /api/auth/me`.
11. Confirm a row exists in `public.profiles` with:
    - `auth_user_id` equal to the Supabase Auth user id
    - `email` equal to the Supabase Auth email
    - `role` equal to `owner` for `OWNER_EMAIL`, otherwise `user`
12. Confirm owner/admin navigation is visible for the owner account.
13. Sign out and confirm the login/signup screen returns.
14. Sign in as a non-owner test user and confirm owner/admin navigation is not available.

Do not apply `backend/supabase/migrations/0003_auth_rbac_rls.sql` until the owner profile row is verified. See `docs/SUPABASE_RLS_APPLY_CHECKLIST.md` before enabling RLS.

## 9. Apply RLS only after owner bootstrap

After the Supabase Auth smoke test verifies `public.profiles.role = 'owner'` for `OWNER_EMAIL`, review and apply:

```text
backend/supabase/migrations/0003_auth_rbac_rls.sql
```

Then run the RLS checks in `docs/SUPABASE_RLS_APPLY_CHECKLIST.md`.

## 10. Persistence smoke test

With backend and frontend running, create or update an entity through the app. The frontend adapter calls backend functions such as `entityCreate`, `entityList`, and `entityUpdate`; those routes persist supported core entities into Supabase.

You can also test directly:

```powershell
Invoke-RestMethod http://localhost:8787/api/functions/entityCreate `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"entity":"Product","data":{"title":"Local smoke product","status":"draft"}}'
```

Then list rows:

```powershell
Invoke-RestMethod http://localhost:8787/api/functions/entityList `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"entity":"Product"}'
```

## 11. Auth endpoint smoke commands

After signing in through the frontend, use the browser network panel to confirm `Authorization: Bearer <access_token>` is sent to backend API requests in Supabase mode.

You can also test the backend endpoint directly with a copied Supabase access token:

```powershell
$token = "paste-supabase-access-token"
Invoke-RestMethod http://localhost:8787/api/auth/me `
  -Headers @{ Authorization = "Bearer $token" }
```

Expected result:

```text
success: true
mode: supabase
user.role: owner|admin|moderator|affiliate_manager|user
profile.auth_user_id: Supabase Auth user id
```

To test safe profile updates:

```powershell
Invoke-RestMethod http://localhost:8787/api/auth/me `
  -Method Patch `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"full_name":"Smoke Test User","role":"owner","auth_user_id":"blocked"}'
```

Expected result: `full_name` may update, while `role` and `auth_user_id` are ignored.

## Notes

Payments, donations, and prize fulfillment remain demo/manual-review paths. Do not process live money until payment provider approval, legal/compliance review, fraud controls, dispute handling, and accounting/tax workflows are in place.
