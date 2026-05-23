# Runtime Smoke Test Checklist

Use this checklist with the backend and frontend running locally.

## Start Services

```powershell
npm.cmd --prefix backend run dev
npm.cmd run dev
```

Expected defaults:

- Backend: `http://localhost:8787`
- Frontend: `http://localhost:5173`

## Backend Health

1. Open `http://localhost:8787/api/health`.
2. Confirm JSON includes `ok: true`.
3. Confirm `storage` is `memory` for local dev without Supabase env vars, or `supabase` when Supabase env vars are configured.
4. In browser devtools, confirm frontend API calls to `/api/functions/*` or `/functions/*` return JSON and not Vite HTML.

## Login / Demo Auth

1. Open the frontend.
2. Confirm the app loads without redirecting to a Base44 login page.
3. Confirm the current user displays as the local demo user.
4. In devtools Application > Local Storage, confirm demo auth data is stored after profile edits.
5. Refresh the page and confirm the app remains in demo-auth mode.

Watch for:

- Any request to a Base44 public settings endpoint.
- Any login redirect loop.
- Any console error from `AuthContext` involving `serverUrl`, `app_id`, or public settings.

## Profile Save

1. Go to `/Profile`.
2. Click Edit Profile.
3. Change Display Name.
4. Save.
5. Confirm the profile header updates.
6. Refresh.
7. Confirm the changed name remains.
8. Go to `/ThePoles`, open the Profile tab, then Account.
9. Edit Display Name or Email there.
10. Refresh and confirm `User.me()` driven areas keep the updated value.

Watch for:

- Profile entity saves succeeding while auth user data reverts.
- `poles_profile` and `the_poles_demo_user` drifting apart.

## Product / Prize Creation

Manual product/prize creation is mostly represented through affiliate offers and North Pole prize selection.

1. Go to `/AffiliateAdmin`.
2. Open Offers.
3. Add a test offer with:
   - Title: `Smoke Test Prize`
   - Merchant: `Smoke Merchant`
   - Category: `Retail & General Prizes`
   - Affiliate URL: `https://example.com/smoke`
   - Active: checked
4. Save.
5. Refresh `/AffiliateAdmin` and confirm the offer remains.
6. Go to `/AffiliateCatalog`.
7. Confirm the offer appears.
8. Click the offer and confirm `/out/:offerId` redirects to the stored affiliate URL or the backend fallback.

Watch for:

- Empty catalog after creating an active offer.
- `/out/:offerId` falling back to `https://example.com` for an offer that exists.
- Console errors from `entityCreate`, `entityList`, or `affiliateRedirect`.

## Match Creation

Test both match creation paths because they use different persistence shapes.

### SantaClause Flow

1. Go to `/SantaClause`.
2. Choose a featured prize or use Prize Shop.
3. Go to Create Match.
4. Select a game.
5. Confirm match details.
6. Save/create the match.
7. Confirm no live payment prompt appears.

### CreateMatch Page

1. Select a prize from the North Pole shop flow if available.
2. Go to `/CreateMatch`.
3. Select a game.
4. Configure match settings.
5. Review and create.

Watch for:

- `Missing gameId or productId` from backend `createMatch`.
- Generic `UserMatch.create()` failing when Supabase is enabled, because `UserMatch` normalizes to `user_matches`, which is currently a strict compatibility table rather than a flexible app entity table.
- Match data saving locally in memory but not persisting after backend restart.

## Affiliate Catalog / Admin

1. Go to `/AffiliateAdmin`.
2. Add a merchant.
3. Edit the merchant status.
4. Add an application.
5. Add an offer tied to the merchant name.
6. Toggle offer active/inactive.
7. Go to `/AffiliateCatalog`.
8. Confirm only active offers are visible.
9. Use category filters and search.
10. Click an offer and verify redirect behavior.

Watch for:

- Boolean filters on `active` behaving differently between memory and Supabase.
- Click analytics remaining empty if affiliate clicks are not currently logged by redirect code.
- Admin-created rows missing after refresh or backend restart depending on storage mode.

## North Pole Pages

1. Go to `/NorthPole`.
2. Confirm the Play & Win tab loads.
3. Select a prize.
4. Select a game in the lobby.
5. Start the game.
6. Complete the game enough to trigger result verification.
7. Confirm result screen appears.
8. Switch to Admin Dashboard.
9. Confirm the created match and fulfillment are listed.

Watch for:

- `NorthPoleMatch`, `NorthPoleFulfillment`, and `MatchEvent` working in memory but failing under Supabase because their normalized tables are not included in the current flexible migration.
- Result verification showing an invalid payload error if a game adapter does not emit `MATCH_RESULT_FINALIZED`.
- Admin dashboard empty after a completed match.

## Fulfillment Simulation

1. Complete a North Pole match through the result screen.
2. Open `/NorthPole` > Admin Dashboard.
3. Expand the match if needed.
4. Approve the fulfillment.
5. Mark it shipped in sandbox mode.
6. Confirm status and tracking text update.
7. Refresh and confirm state persists for the active storage mode.

Watch for:

- Fulfillment status not updating because `NorthPoleFulfillment.update()` cannot find the row.
- Event log not showing admin actions.
- Any UI suggesting a real purchase, live card issuance, or real shipment occurred.

## Likely Runtime Issues Found During Inspection

1. `src/lib/AuthContext.jsx` still contains Base44-era public settings fetch logic using `appParams.serverUrl` and `VITE_BASE44_BACKEND_URL`. The app currently opens, but this path is a likely source of login/demo-auth runtime errors if those params are unset or stale.
2. Dynamic links like `createPageUrl("VisionDetail/:id")` or `createPageUrl("Profile/:id")` style paths may not match declared routes, because `App.jsx` only registers simple page routes plus a few explicit hand-added routes.
3. Supabase persistence for generic entities is strongest for the Phase 5 core tables. Several active app entities use names outside that list, including `NorthPoleMatch`, `NorthPoleFulfillment`, `MatchEvent`, `UserMatch`, `SouthPoleChallenge`, and campaign/team-prize entities.
4. `UserMatch` normalizes to `user_matches`, but `user_matches` is currently a strict compatibility table for backend match functions. Generic `UserMatch.create()` payloads may fail in Supabase even though they work in memory.
5. Affiliate click analytics may not populate unless `/out/:offerId` or the backend redirect path creates `AffiliateClick` records.
6. Some text appears mojibake-encoded in inspected files, especially emoji labels. This may be visual-only, but it should be checked in the browser.

Do not process live payments, issue real virtual cards, or use real affiliate API credentials during this smoke test.
