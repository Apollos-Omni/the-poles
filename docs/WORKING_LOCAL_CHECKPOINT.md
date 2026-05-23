# Working Local Checkpoint

Date: 2026-05-22

## Current Working State

The app is working in local development with separate frontend and backend processes.

- Frontend runs with Vite.
- Backend runs with Express on port `8787`.
- Base44 npm packages have been removed.
- The local Base44-compatible adapter is still present as a compatibility shim.
- Demo auth works locally.
- Profile name changes persist after refresh.
- Affiliate Admin and Affiliate Catalog routes work and are visible in sidebar navigation.
- North Pole / Santa Clause demo flows work in local dev.
- Production build passes.

## Windows Run Commands

Run these from the repo root:

```powershell
cd "C:\Users\nckph\Downloads\The_Poles\The Poles"
npm.cmd run install:all
```

Start backend in terminal 1:

```powershell
npm.cmd run backend:dev
```

Start frontend in terminal 2:

```powershell
npm.cmd run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8787/api/health`

## Tested Flows

- Demo auth loads without Base44 login.
- Profile edit saves name and remains after browser refresh.
- Affiliate Admin can create and edit merchants/offers.
- Affiliate Catalog displays active offers.
- Affiliate outbound redirect route works.
- North Pole / Santa Clause prize-match demo flow runs locally.
- Backend health endpoint responds.
- Frontend production build completes.

## Storage Behavior

Without Supabase env vars, the backend uses in-memory storage for local dev. Backend memory storage resets when the backend process restarts.

Some browser-side demo state, such as the demo auth user and profile display data, is stored in `localStorage` and survives browser refresh.

To persist backend entity data across backend restarts, configure Supabase in `backend/.env`:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Then apply:

```text
backend/supabase/migrations/0001_the_poles_core.sql
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Remaining Limitations

- Auth is still local demo auth, not real Supabase auth.
- Payments, donations, virtual cards, and prize fulfillment remain sandbox/manual-review flows.
- No live affiliate API keys are configured.
- Supabase schema must be applied manually to a real Supabase project before persistent backend storage is available.
- Vite build reports a large chunk warning.
- Some legacy/mojibake text remains in UI copy and has not been cleaned up.
