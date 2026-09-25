# Kingdom Notes — Import & Get Running (First Pass)

Bring the existing Kingdom Notes game into this environment as an AI development workspace, get it building and running against its real Supabase backend, and report exactly what state it is in — without changing the app's architecture, UI, or game systems.

## Who it's for
The project owner, who runs Kingdom Notes as a live production game (KingdomNotes.Online) and is moving development away from Vercel. This environment is the development workspace only; production will be hosted independently (likely Google/Firebase App Hosting). Nothing here should become a required production dependency.

## Core work and outcome
- Inspect the complete existing codebase as-is: Next.js 16, React, TypeScript, Supabase (database + auth), and Capacitor (iOS/Android).
- Install dependencies exactly as the project defines them; resolve only what blocks installation or the build.
- Attempt a clean build and a local dev run. Supabase credentials are deferred for now, so the app is brought up without live Supabase; the integration is left intact and ready for keys to be added later.
- Load the major screens/routes and exercise core navigation, checking for runtime errors. This is not exhaustive game-mechanic testing — it confirms the primary screens and flows render and navigate without crashing.
- Verify the Capacitor iOS/Android configuration is valid, without triggering a mobile build.
- Produce a written findings report: build errors, missing environment variables, broken or incompatible dependencies, any unfinished or partially tested features (especially mobile), and any screen or primary flow that does not load or function as expected — all flagged, never replaced.
- No UI/design changes. No game-system rewrites. No migration to another stack, database, or backend.

## What "done" looks like for this pass
- Dependencies install successfully.
- The project builds, or every remaining build blocker is documented with the specific cause.
- The dev server runs (without live Supabase for now; the integration stays intact for later).
- The major screens/routes and core navigation load without runtime errors, and any that fail are documented.
- A clear list of everything found: what works, what's broken, what's unfinished, and what needs a decision.

## Constraints (fixed, not up for change in this pass)
- Preserve Next.js 16 / React / TypeScript / Supabase / Capacitor. No FastAPI, no MongoDB, no Supabase replacement.
- Preserve existing Supabase database/auth integration and existing player data.
- Preserve existing Capacitor iOS/Android work untouched.
- No UI redesign — a new design direction comes later, after the app is verified functional.
- This environment's usual fixed-port/proxy serving setup will not be forced onto the app; the app's own architecture stays as-is even if that limits in-browser preview here.

## Implementation phases

### Phase 1 — Inspect, build, verify (this pass)
Install dependencies, get the project building and running (without live Supabase for now), load and navigate the major screens/routes to check for runtime errors, verify Capacitor config validity, and deliver the findings report. No feature work, no UI changes, no destructive edits. Any architectural or destructive change that appears necessary is flagged and explained first — not applied.

### Phase 2 — New UI design direction (later)
Implement the owner's new UI design over the verified, working app. Not started in this pass.

### Phase 3 — Independent production hosting & mobile (later)
Support moving production hosting off Vercel to the owner's chosen platform (e.g., Google/Firebase App Hosting) and progressing the mobile (Capacitor) builds. Not started in this pass.

## Assumptions
- The connected v0 development branch is the branch to use, and it is the intended current state of the game.
- Supabase credentials are deferred: the owner will add them later. The app is brought up without live Supabase, so auth and existing player data cannot be exercised in this pass; the Supabase integration is left fully intact and untouched.
- "Running correctly" for this pass means: installs, builds, dev server starts, major screens/routes and core navigation load without runtime errors, plus the findings report. Exhaustive testing of every game mechanic is not part of this pass.
- Screens or flows that hard-depend on a live Supabase connection may not fully function without credentials; where that happens it is documented as environment-dependent rather than treated as a defect.
- In-browser preview inside this environment may be limited because the app's serving setup is kept as-is; this is acceptable per the owner's instruction and is not treated as a failure.
- Capacitor config is verified for validity only; no iOS/Android build is compiled or run.
- Unfinished or partially tested features (notably mobile) are documented and left in place, never removed or rebuilt.
- No secrets, keys, or player data are altered; nothing about the production deployment is changed from this environment.
