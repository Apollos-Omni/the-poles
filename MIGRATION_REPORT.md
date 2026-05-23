# The Poles — Backend Migration Report

Date: 2026-05-22

## Completed in this package

- Added a custom Node/Express backend under `backend/`.
- Added Supabase-ready storage adapter with in-memory fallback for local demos.
- Added initial Supabase SQL migration at `backend/supabase/migrations/0001_the_poles_core.sql`.
- Rewired frontend function wrappers in `src/functions/` to call `/api/functions/:name`.
- Overrode `base44.functions.invoke()` in `src/api/base44Client.js` so remaining direct calls, such as `publishHingeCommand`, route to the custom backend.
- Archived prior Base44/Deno functions into `legacy_base44_functions/`.
- Added Vite dev proxy for `/api` and `/functions` to `http://localhost:8787`.
- Added Codex handoff prompt at `docs/CODEX_BACKEND_MIGRATION_PROMPT.md`.
- Added backend setup notes at `docs/BACKEND_MIGRATION.md`.

## Implemented backend endpoints

- `GET /api/health`
- `POST /api/functions/searchProducts`
- `POST /api/functions/searchPrizes`
- `POST /api/functions/createMatch`
- `POST /api/functions/joinMatch`
- `POST /api/functions/submitScore`
- `POST /api/functions/finalizeMatch`
- `POST /api/functions/affiliateRedirect`
- `GET|POST|DELETE /api/functions/managePushSubscription`
- `GET /api/functions/getVapidPublicKey`
- `GET /api/functions/downloadAgentToolkit`
- `POST /api/functions/publishHingeCommand`
- Compatibility aliases under `/functions/*`

## Verification performed here

- `npm --prefix backend run check` passed.
- `node --check` passed for frontend API wrappers.

## Verification not completed here

I could not run a full root `npm install`/`npm run build` in this execution environment after the migration. The previous frontend source package was build-ready before this backend migration, and the changed frontend files were syntax-checked, but Codex/local dev should still run the full checks listed below.

```bash
npm install
npm --prefix backend install
npm run lint
npm run typecheck
npm run build
npm --prefix backend run check
```

## Important live-launch note

Payments, real prize purchases, affiliate API production access, fulfillment automation, and donation handling remain intentionally in demo/manual-review mode. They should not be activated with real money until legal/compliance review and provider approvals are complete.
