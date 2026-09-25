# Kingdom Notes — Import & Verification Findings (Phase 1)

Date: 2026-06 (initial import pass)
Goal of this pass: install, build, run, and navigate the existing app — no UI redesign, no
game-system rewrites, no stack migration. Architecture preserved exactly (Next.js 16 / React 19 /
TypeScript / Supabase / Capacitor).

---

## Summary — the app is running

- ✅ Dependencies install cleanly (pnpm, lockfile v9).
- ✅ Production build succeeds (`pnpm build`) with **no errors**.
- ✅ Dev server (`pnpm dev`) and production server (`pnpm start`) both start and serve on port 3000.
- ✅ All major screens/routes load without runtime errors after one small fix (below).
- ✅ Capacitor `capacitor.config.ts` parses as valid.
- ⚠️ Live Supabase is intentionally deferred — placeholder credentials are in `.env.local`, so
  auth/database-gated flows can't be exercised yet. The Supabase integration is untouched.

---

## Environment

- Node v20.20.2, npm 10.8.2. The project uses **pnpm** (there is a `pnpm-lock.yaml`). pnpm was not
  preinstalled; it was enabled via corepack (pnpm 9/12 both read the v9 lockfile fine).
- `pnpm install` completes. `sharp`'s post-install build script is intentionally skipped
  (declared in `pnpm-workspace.yaml` → `ignoredBuiltDependencies`). Not a problem.

## The one code fix applied (was crashing the core game screen)

- **File:** `hooks/use-online-presence.ts` (line 74)
- **Bug:** The hook was refactored to call `fetch("/api/game/presence")` instead of a Supabase
  client, but its `useEffect` dependency array still listed a now-undefined `supabase` variable:
  `}, [characterId, supabase])`. This threw `ReferenceError: supabase is not defined` on every
  render of `/game`, returning **HTTP 500** for the entire main game screen.
- **Fix:** changed the dependency array to `}, [characterId])`. One line. Not architectural, not a
  UI/game change — a leftover from a previous refactor. This is the same class of "supabase
  undefined" issue visible in the git history.
- **Result:** `/game` now returns HTTP 200 and renders.

## Route check (production build, no live Supabase)

| Route | Status | Notes |
|---|---|---|
| `/` (landing) | 200 ✅ | Fully renders (marquee, hero, interactive demo cards). |
| `/auth/login` | 200 ✅ | Renders with the "While You Were Away" preview panel. |
| `/auth/sign-up` | 200 ✅ | |
| `/auth/forgot-password` | 200 ✅ | |
| `/auth/reset-password` | 200 ✅ | |
| `/game` | 200 ✅ | Renders after the fix. Content is auth-gated; without a live Supabase session it
  attempts to redirect to `/auth/login` (expected, environment-dependent). |
| `/game/onboarding` | 200 ✅ | |
| `/manual`, `/community`, `/support` | 404 ⚠️ | Linked from the landing-page footer but **no routes exist**. Dead links. |
| ~39 `/api/game/*` route handlers | server-side | Not exercised — all require Supabase + auth. |

## Environment variables needed (currently placeholders in `.env.local`)

The app reads these; real values must be added to enable auth/DB and existing player data:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`  (used by `app/api/game/housing/rent/route.ts` and others)
- `CRON_SECRET`  (guards `app/api/game/tick/route.ts` — the game "tick" cron endpoint)
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`  (optional; auth email redirect override for dev)

Database schema/seed SQL for Supabase lives in `scripts/*.sql` (schema, characters, albums, songs,
lodging, story progression, seeds, etc.) — ready to run against the Supabase project.

## Non-blocking warnings / observations

1. **Middleware deprecation (Next 16):** `middleware.ts` triggers a warning — Next 16 deprecates the
   `middleware` file convention in favor of `proxy`. Currently a pass-through, so harmless; rename
   later. Not fixed in this pass.
2. **Dead footer links:** `/manual`, `/community`, `/support` (404). Either build these pages or
   remove/point the links elsewhere. Flagged, not changed.
3. **`typescript.ignoreBuildErrors: true`** in `next.config.mjs` — type errors are suppressed at
   build time. The build passing does not guarantee type-safety. Left as-is per "preserve".

## Capacitor / mobile (verified for validity only — no mobile build run)

- `capacitor.config.ts` is valid (`appId: com.kingdomnotes.app`, `webDir: 'out'`, plugins for
  SplashScreen/StatusBar/Keyboard/PushNotifications/Haptics). Parses correctly via the Capacitor CLI.
- All `@capacitor/*` deps are present (v6). **No `ios/` or `android/` native project folders exist
  yet** — `cap add ios` / `cap add android` have not been run. Mobile is scaffolded (config +
  plugins) but native projects are unfinished. Left untouched.
- **Architectural note for Phase 3 (flagged, not acted on):** mobile uses static export
  (`build:static` → `output: 'export'`, `webDir: 'out'`). Next.js static export does **not** support
  server Route Handlers, and this app has ~39 `/api/game/*` handlers. So a static Capacitor bundle
  cannot serve those APIs itself — the mobile app will need to hit the hosted backend (e.g. via the
  Capacitor `server.url` pointing at the production URL). This needs a decision before mobile builds.

## How to run in this environment

- Install: `pnpm install`
- Dev:    `pnpm dev`   (http://localhost:3000)
- Prod:   `pnpm build && pnpm start`
- Note: this environment's default process manager (supervisor) is preconfigured for a
  React+FastAPI layout (`/app/frontend`, `/app/backend`) that does not exist here — this is a
  Next.js app at the repo root. That setup was **not** forced onto the app per the plan; the app is
  run directly with its own scripts. In-browser preview here is therefore run manually.

## What needs a decision (owner)

1. Add real Supabase credentials to fully exercise auth, DB, and existing player data.
2. Build or remove the `/manual`, `/community`, `/support` pages.
3. Confirm the Phase-3 mobile API strategy (static bundle + remote APIs via `server.url`).
4. Confirm production hosting target (moving off Vercel — e.g. Firebase/Google App Hosting).
