# The Poles

Local React/Vite frontend plus Express backend for The Poles demo app.

## Windows Local Setup

From PowerShell in the repo root:

```powershell
cd "C:\Users\nckph\Downloads\The_Poles\The Poles"
npm.cmd run install:all
```

Start the backend in one terminal:

```powershell
npm.cmd run backend:dev
```

Start the frontend in another terminal:

```powershell
npm.cmd run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8787/api/health`

## Useful Checks

```powershell
npm.cmd --prefix backend run check
node node_modules/vite/bin/vite.js build
```

## Local Storage Notes

If Supabase env vars are not configured, the backend uses in-memory storage for local development. Backend memory storage resets whenever the backend process restarts.

To persist backend entity data, configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`, then apply:

```text
backend/supabase/migrations/0001_the_poles_core.sql
```

See `docs/SUPABASE_SETUP.md` for the full Supabase setup.
