# Base44 Removal Checkpoint

## Audit summary

- The frontend has two direct Base44 package dependencies in `package.json`: `@base44/sdk` and `@base44/vite-plugin`.
- `vite.config.js` loads `@base44/vite-plugin` and enables legacy SDK import support behind `BASE44_LEGACY_SDK_IMPORTS`.
- `src/api/base44Client.js` is the central Base44 adapter. It imports `createClient` from `@base44/sdk`, creates `base44`, and overrides `base44.functions.invoke()` to call the local backend.
- Backend functions have already started migrating to the local Express backend under `backend/`; frontend function wrappers in `src/functions/*` call `src/api/apiClient.js`.
- The active backend currently mounts `/api/functions` and `/functions`. It does not expose a generic `/api/entities/:entity` CRUD API.
- `src/entities/*` files are generated wrappers around `base44.entities.EntityName`; 103 entity modules currently depend on the central adapter shape.
- Several pages/components also import `base44` directly for `auth`, `entities`, `functions.invoke`, `integrations.Core`, and `appLogs`.
- `legacy_base44_functions/` contains archived Deno/Base44 functions and should remain reference-only.

## Phase 1 strategy

1. Preserve the public adapter contract used by the app:
   - `base44.entities.EntityName`
   - `base44.auth`
   - `base44.functions.invoke`
   - `base44.integrations.Core`
   - `base44.appLogs`
2. Replace `src/api/base44Client.js` with a local implementation that does not import `@base44/sdk`.
3. Keep existing UI files untouched. Existing `src/entities/*` wrappers should continue to work because the adapter still exposes `base44.entities.*`.
4. Route `base44.functions.invoke(name, data)` to the existing local backend through `invokeBackendFunction()`.
5. Route common entity calls through backend functions if matching function names exist, using names such as:
   - `entityList`
   - `entityFilter`
   - `entityCreate`
   - `entityUpdate`
   - `entityDelete`
   - `entityBulkCreate`
   The current backend does not provide these routes, so Phase 1 must catch missing-route failures and fall back safely.
6. Provide deterministic in-browser mock storage for unsupported entity methods so demos do not crash when backend routes are absent.
7. Replace Base44 auth calls with a local demo auth shim:
   - `me()` returns a stable demo user.
   - `logout()` clears local auth state and optionally redirects.
   - `redirectToLogin()` logs a warning and keeps local demo behavior.
8. Stub `base44.integrations.Core` methods with clear console warnings and safe mock/demo results.
9. Stub `base44.appLogs.logUserInApp()` with a console warning and no-op success.
10. Remove the Base44 Vite plugin from `vite.config.js`.
11. Do not remove `@base44/*` from `package.json` until the app builds without the plugin and SDK imports.
12. Run `npm run build` after changes and report every changed file plus remaining blockers.

## Non-goals

- Do not delete or rewrite UI files.
- Do not implement live payments.
- Do not add affiliate API keys or secrets.
- Do not deploy or reactivate `legacy_base44_functions/`.
- Do not remove Base44 packages from dependency manifests during Phase 1.
