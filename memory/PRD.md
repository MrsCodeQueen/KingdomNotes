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

## Status — Supabase Verification Phase — DONE (2026-06)
- Owner provided live Supabase creds (project dwmvbowpdhfktkbwpzys). Stored in `/app/.env.local`.
- Verified: auth healthy, all core tables present (~10 existing characters), password login works.
- Fixed a CRITICAL server-auth bug: `lib/supabase/server.ts` hand-parsed the auth cookie with
  `JSON.parse`, but `@supabase/ssr` writes it as `base64-<encoded>` (and can chunk it). Parse failed,
  fell back to sending the raw string as a Bearer token → EVERY authenticated `/api/game/*` returned
  401 (and lodgings 500). Replaced with `createServerClient` + `getAll/setAll` cookie adapter (per
  integration_expert playbook). Now all ~39 API routes authenticate correctly.
- Verified end-to-end in a real browser (testing_agent iteration_3, 100%): login → /game dashboard
  renders live character; all read routes (presence/challenges/opportunities/lodgings/daily) = 200;
  write path POST /api/game/action = 200 with UI stat mutation + activity log. No runtime errors.
- ENVIRONMENT SHIM: this preview's ingress routes `/api/*` to port 8001 (default FastAPI slot, which
  doesn't exist here) while the Next.js app serves its own `/api/*` on 3000. Added `/app/dev-proxy.mjs`
  (a tiny Node reverse proxy 8001→3000) so the public preview URL's `/api/*` reaches Next.js. This is
  an environment-only bridge; it does NOT change the app architecture (still pure Next.js on :3000).

## Running the app in THIS environment (manual — supervisor template doesn't fit)
1. `cd /app && pnpm start` (or `pnpm dev`) — serves Next.js on :3000.
2. `cd /app && node dev-proxy.mjs &` — bridges :8001 → :3000 so preview `/api/*` works.
3. After any `pnpm build`, RESTART `next start` (`next start` does not hot-reload compiled routes).

## Known issues / backlog
- P2: Dead footer links `/manual`, `/community`, `/support` (404) — build or remove.
- P2: `middleware.ts` deprecated in Next 16 (rename to `proxy`); currently harmless pass-through.
  NOTE: integration_expert recommends a `proxy.ts` that calls Supabase `getClaims()` to persist
  refreshed tokens for Server Components. Not required for current API-route auth (browser client
  keeps the cookie fresh), but recommended for robustness — deferred, flagged.
- P2: `next.config.mjs` has `typescript.ignoreBuildErrors: true` (type errors suppressed).
- P2: `app/api/game/lodgings/route.ts` returns 500 (not 401) when unauthenticated — minor hardening.
- P2: Vercel Web Analytics script 404 (`/_vercel/insights/script.js`) in console — harmless outside
  Vercel; consider gating `@vercel/analytics` on a VERCEL env or removing.
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
