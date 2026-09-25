# Kingdom Notes — PRD / Project Memory

## Original problem statement
Import and continue developing the existing **Kingdom Notes** project (a live production faith/gospel
music MMORPG, KingdomNotes.Online) from the connected GitHub repo. It is an existing, working app —
do NOT rebuild, migrate, or replace it. Preserve Next.js 16 / React 19 / TypeScript / Supabase /
Capacitor. No FastAPI, no MongoDB, no Supabase replacement. First goal: get it building and running
in this environment from its current state; report findings before any destructive/architectural change.

## Architecture (fixed — do not change)
- **Framework:** Next.js 16.1.6 (App Router), React 19.2.4, TypeScript 5.7.3
- **Package manager:** pnpm (lockfile v9)
- **Backend/data/auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`); RLS-enforced.
  ~39 server Route Handlers under `app/api/game/*`. SQL schema/seeds in `scripts/*.sql`.
- **UI:** shadcn/ui (new-york), Tailwind CSS v4, lucide-react, next-themes (dark default).
- **Mobile:** Capacitor v6 (iOS + Android) — config present, native folders not yet generated.
- **Repo layout:** app lives at `/app` root (NOT the React+FastAPI `/app/frontend` + `/app/backend`
  template). Supervisor's default frontend/backend programs are FATAL here and are intentionally
  not used; the app runs via `pnpm dev` / `pnpm build && pnpm start` on port 3000.

## User persona
Project owner running Kingdom Notes as a live game, moving development off Vercel. This environment
is a development workspace only; production will be hosted independently (likely Firebase/Google App
Hosting). Nothing here should become a required production dependency.

## Status — Phase 1 (Import, build, verify) — DONE (2026-06)
- Installed deps (pnpm). Build passes with no errors. Dev + prod servers run on :3000.
- Fixed one crash: `hooks/use-online-presence.ts` referenced an undefined `supabase` in a useEffect
  dependency array (refactor leftover) → `/game` returned 500. Changed deps to `[characterId]`.
  `/game` now 200. Only code change made this pass.
- Verified all major routes load (landing, all auth pages, game, onboarding). Capacitor config valid.
- Supabase credentials deferred → placeholder values in `.env.local`; integration left intact.
- Full details in `/app/FINDINGS.md`.

## Known issues / backlog
- P1: Add real Supabase credentials to enable auth/DB and existing player data (run `scripts/*.sql`).
- P2: Dead footer links `/manual`, `/community`, `/support` (404) — build or remove.
- P2: `middleware.ts` deprecated in Next 16 (rename to `proxy`); currently harmless pass-through.
- P2: `next.config.mjs` has `typescript.ignoreBuildErrors: true` (type errors suppressed).
- P3 (mobile): generate `ios/`/`android/` native projects; decide API strategy — static export
  (`output: 'export'`) can't serve the ~39 Route Handlers, so mobile must hit hosted APIs via
  Capacitor `server.url`.
- P3 (hosting): move production off Vercel to owner's chosen platform.

## Phase plan
- Phase 1 — Inspect, build, verify. ✅ Done.
- Phase 2 — New UI design direction over the verified app. Not started.
- Phase 3 — Independent production hosting (off Vercel) + progress Capacitor mobile builds. Not started.

## Required credentials (not yet provided)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET,
(optional) NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL.
