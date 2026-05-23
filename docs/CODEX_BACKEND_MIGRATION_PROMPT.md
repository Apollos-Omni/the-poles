# Codex task: finish Base44 backend-function migration

Goal: The Poles frontend should use the custom `backend/` Node/Supabase API for backend functions and stop calling Base44 Functions.

Current state:
- Frontend app: React/Vite in project root.
- New backend scaffold: `backend/`.
- Supabase schema: `backend/supabase/migrations/0001_the_poles_core.sql`.
- Archived Base44 Deno functions: `legacy_base44_functions/`.
- Frontend wrapper files in `src/functions/` now call `src/api/apiClient.js`.
- `src/api/base44Client.js` overrides `base44.functions.invoke()` so old direct calls route to `/api/functions/:name`.

Tasks:
1. Run `npm install` in the root and `npm install` in `backend/`.
2. Run frontend checks: `npm run lint`, `npm run typecheck`, `npm run build`.
3. Run backend checks: `npm --prefix backend run check`.
4. Start backend with `npm --prefix backend run dev` and frontend with `npm run dev`.
5. Test:
   - `/api/health`
   - product search from Shop/Santa Clause page
   - create match
   - join match
   - submit score
   - finalize match
6. Wire real Supabase project env into `backend/.env` and run the SQL migration.
7. Keep payment and prize fulfillment in manual-review mode until legal/compliance and payment-provider approval are complete.

Do not reintroduce Base44 backend functions unless explicitly rolling back.
