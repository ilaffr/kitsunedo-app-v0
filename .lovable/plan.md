
Add a GitHub Actions workflow that runs build + tests on every push and PR to `main`. Since GitHub is bidirectionally synced, creating the file in Lovable pushes it to the `kitsunedo` repo automatically.

## File to create

**`.github/workflows/ci.yml`**

## Workflow design

- **Name**: `CI`
- **Triggers**: `push` to `main` + `pull_request` targeting `main`
- **Runner**: `ubuntu-latest`
- **Node version**: 20 (LTS, matches Vite 5 requirements)
- **Package manager**: npm with `package-lock.json` (project has both `bun.lockb` and `package-lock.json` — npm is the safer default for CI since `package.json` scripts use it and the README documents `npm i` / `npm run dev`)

## Steps

1. `actions/checkout@v4` — clone repo
2. `actions/setup-node@v4` — Node 20 + npm cache keyed on `package-lock.json`
3. `npm ci` — clean reproducible install
4. `npm run lint` — fast feedback on style errors (script already exists in `package.json`)
5. `npm run test -- --run` — vitest in single-run mode (no watch); `vitest.config.ts` is already configured with jsdom + setup file
6. `npm run build` — production Vite build to catch type/build errors

All steps run sequentially in one job called `build-and-test` so a single red ✗ pinpoints the failing stage.

## Notes

- No secrets needed — the build doesn't hit Supabase at compile time (env vars are read at runtime in the browser), and `vitest` uses jsdom with no network calls in `src/test/example.test.ts`.
- If the build later starts requiring `VITE_SUPABASE_*` at build time, we'd add them as repo secrets and inject via `env:` — out of scope for now.
- No caching beyond npm's built-in setup-node cache; project is small enough that adding Vite/Vitest caches is premature.
- Workflow will appear as a green check on PRs and on the `main` branch in GitHub once the file syncs.

## Out of scope

- Deploy steps (Lovable handles publishing)
- Branch protection rules (configured in GitHub UI, not in the workflow file)
- Matrix testing across Node versions (single Node 20 is sufficient for a Vite SPA)
