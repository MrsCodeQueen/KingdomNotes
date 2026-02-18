# KingdomNotes

This repository contains the KingdomNotes monorepo template (web + mobile) and example apps.

Quick links
- Repo: https://github.com/MrsCodeQueen/KingdomNotes

Getting started (local)

1. Clone the repo

```bash
git clone https://github.com/MrsCodeQueen/KingdomNotes.git
cd KingdomNotes
```

2. Inspect apps

- Web app: `apps/web` (Vite + React Router)
- Mobile app: `apps/mobile` (Expo)
- External tests: `tests/` (Playwright)

3. Run the web dev server (requires Bun installed for web dev in this template)

```bash
cd apps/web
# Using Bun for this template (if installed):
bun dev

# Or use the repo docs for alternate commands
```

4. Run external tests (devserver tests)

```bash
cd tests
npm install
npx playwright install chromium
npm test
```

Notes
- This repo uses multiple package managers (Bun for web, npm for mobile/tests). Follow the per-app README files for exact commands.
- See `CLAUDE.md` and `TESTING_STRATEGY.md` for project guidelines and testing instructions.

Contributing

Open a PR against `main`. Consider adding small, focused changes and include tests when possible.

License

This project does not include a license file; add one if you plan to publish.
```bash
(cd apps/web && bun dev) & (cd apps/mobile && EAS_NO_VCS=1 EAS_PROJECT_ROOT=. EXPO_NO_METRO_LAZY=1 EXPO_UNSTABLE_TREE_SHAKING=1 EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1 bunx expo start --offline --web)
```

# Managing e2b

All of this requires the e2b cli to be installed.

## How to develop on your own template
### Create your template
1. Make sure you have auth configured to the devleopment team
2. NOTE: you will have to stop this command soon after running it. This is the only way I know how to create a template...
3. Run:
```bash
e2b template build
```
and after about a second, just cancel it This will create an e2b.toml file in the current directory.The only important part of this config is the template_id.

1. Now, move this file to e2b.local.toml. This will ensure it is not committed
1. Finally, copy the other relevant fileds from the e2b.development.beta.toml file to your e2b.local.toml file.
1. Set your template_name to something that is specific to you e.g. "create-development-marcus"
1. Go into launchdarkly (https://app.launchdarkly.com/projects/flux/flags/e2b-monorepo-template/targeting?env=production&env=development&selected-env=development)
1. Add your template name as a variation, and configure it to be served in whatever environments you want in the development environment.

NOTE: if you want to test it in production, you will have to create your own template (with a different id) in the production team as well.
