# The Poles backend migration

This package starts the move away from Base44 backend functions.

## What changed

- Base44/Deno backend functions were moved to `legacy_base44_functions/`.
- New backend lives in `backend/`.
- Frontend function wrappers now call `/api/functions/:name`.
- Direct `base44.functions.invoke()` calls are intercepted and routed to the new backend.
- Supabase schema is included at `backend/supabase/migrations/0001_the_poles_core.sql`.
- Backend runs with an in-memory store when Supabase env vars are missing, so local demos still work.

## Local setup

```bash
npm install
npm --prefix backend install
cp backend/.env.example backend/.env
npm --prefix backend run dev
npm run dev
```

Open the frontend at the Vite URL and keep the backend on port `8787`.

## Supabase setup

1. Create a Supabase project.
2. Run `backend/supabase/migrations/0001_the_poles_core.sql` in the SQL editor.
3. Copy `backend/.env.example` to `backend/.env`.
4. Fill in:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Use the service role key only inside the backend environment. Never put it in `VITE_*` variables.

## Deployment notes

Frontend can deploy to Vercel/Netlify. Backend can deploy to Railway, Render, Fly.io, or a VPS. Set this in frontend hosting:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Money/prizes warning

The backend intentionally leaves payments and prize fulfillment in manual-review/demo mode. Before real buy-ins, donations, or prize purchases go live, the app still needs payment provider approval, legal/compliance review, dispute handling, fraud controls, tax/accounting rules, and official affiliate/retailer API approvals.
