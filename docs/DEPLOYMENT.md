# Deployment

This app is intended to run with:

- Frontend: Vercel
- Backend: Render
- Auth/database: Supabase

Do not commit `.env` files. Put frontend-safe `VITE_` variables in Vercel and backend secrets in Render.

## 1. Push to GitHub

1. Confirm local checks pass:
   ```bash
   npm --prefix backend run check
   npm run build
   ```
2. Commit the deployment docs/config changes.
3. Push the branch to GitHub.

## 2. Deploy Backend on Render

Create a Render Web Service from the GitHub repo.

Recommended Render settings:

- Root directory: `backend`
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`

`backend/package.json` starts the service with:

```bash
node src/server.js
```

The server reads `process.env.PORT`, which Render provides automatically.

### Required Backend Env Vars

Set these in Render, not in Vercel:

```bash
NODE_ENV=production
FRONTEND_ORIGIN=https://your-vercel-domain.vercel.app
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OWNER_EMAIL=
```

Optional backend-only search provider vars:

```bash
EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
AMAZON_PAAPI_ACCESS_KEY=
AMAZON_PAAPI_SECRET_KEY=
AMAZON_ASSOCIATE_TAG=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
RAWG_API_KEY=
STEAM_API_KEY=
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` is backend only. Never add it to Vercel and never prefix it with `VITE_`.
- `ENABLE_DEMO_AUTH` must be blank or false in production.
- `FRONTEND_ORIGIN` must match the deployed Vercel origin, including protocol and without a trailing slash.

After deploy, verify:

```text
https://your-render-service.onrender.com/api/health
```

The response should include `ok: true`.

## 3. Deploy Frontend on Vercel

Create a Vercel project from the GitHub repo.

Recommended Vercel settings:

- Framework preset: Vite
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`

### Required Frontend Env Vars

Set these in Vercel:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_AUTH_MODE=supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Important:

- Vercel exposes `VITE_` variables to browser code.
- Do not add backend secrets, provider secrets, or `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
- Do not add eBay, RAWG, Amazon, IGDB, or Steam keys to Vercel.

## 4. Configure Supabase Auth URLs

In Supabase Dashboard:

1. Open Authentication settings.
2. Set Site URL to the Vercel production URL:
   ```text
   https://your-vercel-domain.vercel.app
   ```
3. Add Redirect URLs for:
   ```text
   https://your-vercel-domain.vercel.app/**
   http://localhost:5173/**
   ```
4. Confirm the database migrations and RLS policies have been applied.
5. Confirm the owner/admin profile exists for `OWNER_EMAIL`.

## 5. Production Smoke Test

1. Open the Vercel URL.
2. Sign in with Supabase Auth.
3. Confirm The North Pole loads.
4. Search for a prize.
   - Without provider keys, demo catalog results should appear.
   - With eBay keys in Render, eBay Browse API results should appear.
5. Search for a game.
   - Without provider keys, sample game catalog results should appear.
   - With RAWG key in Render, RAWG results should appear.
6. Create a North Pole match and refresh the page.
   - The match should persist.
   - The skill-based competition agreement must be accepted before create/join.
7. Join an open North Pole match as another normal user.
8. Confirm South Pole navigation still loads.
9. Confirm Demo Simulation still works as sandbox.
10. As a normal user, verify admin fulfillment controls are not visible.
11. As owner/admin, verify admin fulfillment controls load.

## Local Development

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm --prefix backend run dev
```

Use `.env.example` for frontend-safe local variables and `backend/.env.example` for backend-only local variables.
