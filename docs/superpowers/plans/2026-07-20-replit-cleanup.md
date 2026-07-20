# Replit Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Replit-specific files, dependencies, Vite plugin wiring, and stale documentation references from the Mindful Journal workspace without breaking the documented local pnpm workflow.

**Architecture:** The cleanup is a repository hygiene change across four surfaces: tracked Replit-only files, workspace dependency/config entries, frontend Vite wiring, and documentation references. The implementation should preserve existing local development behavior and explicitly keep the general supply-chain and dependency-pinning protections in `pnpm-workspace.yaml`.

**Tech Stack:** pnpm workspace, TypeScript, Vite, React, Express, Markdown docs, Prettier, ESLint

## Global Constraints

- Keep `minimumReleaseAge: 1440` unchanged in `pnpm-workspace.yaml`.
- Remove only Replit-specific allowlist/catalog/override entries; preserve unrelated override lines, including `@esbuild-kit/esm-loader` and `esbuild` version pins.
- Remove `replit.md` under the approved aggressive scope.
- Remove `scripts/post-merge.sh` because no non-Replit caller has been found.
- Update tracked docs so no repository file references the deleted `replit.md`.
- Do not change app behavior beyond removing Replit-specific development overlays, plugin hooks, and comments.

## File structure and responsibilities

- `package.json` — root workspace dependency manifest; remove unused `@replit/connectors-sdk`.
- `pnpm-workspace.yaml` — workspace security/config surface; keep the global security floor, remove Replit-specific allowlist/catalog/platform exclusions only.
- `artifacts/journal-app/package.json` — web app dev dependencies; remove Replit Vite plugins.
- `artifacts/mockup-sandbox/package.json` — sandbox dev dependencies; remove Replit Vite plugins.
- `artifacts/journal-app/vite.config.ts` — web app plugin wiring; remove Replit-only overlay/banner/cartographer hooks.
- `artifacts/mockup-sandbox/vite.config.ts` — sandbox plugin wiring; remove Replit-only overlay/cartographer hooks.
- `artifacts/journal-app/src/components/ui/badge.tsx` — cosmetic source cleanup; remove obsolete `@replit` comments.
- `README.md` — remove the `replit.md` reference from development docs.
- `.replit`, `.replitignore`, `replit.md`, `scripts/post-merge.sh`, `artifacts/*/.replit-artifact/artifact.toml` — tracked Replit-era files to delete.

---

### Task 1: Remove tracked Replit-only files and stale doc references

**Files:**

- Delete: `.replit`
- Delete: `.replitignore`
- Delete: `replit.md`
- Delete: `scripts/post-merge.sh`
- Delete: `artifacts/api-server/.replit-artifact/artifact.toml`
- Delete: `artifacts/journal-app/.replit-artifact/artifact.toml`
- Delete: `artifacts/mockup-sandbox/.replit-artifact/artifact.toml`
- Modify: `README.md:85-88`

**Interfaces:**

- Consumes: approved cleanup scope from `docs/superpowers/specs/2026-07-20-replit-cleanup-design.md`
- Produces: repository no longer tracks Replit-only top-level files, helper script, artifact configs, or a README reference to `replit.md`

- [ ] **Step 1: Verify the files exist before deletion**

Run:

```bash
ls .replit .replitignore replit.md scripts/post-merge.sh && \
ls artifacts/api-server/.replit-artifact/artifact.toml \
   artifacts/journal-app/.replit-artifact/artifact.toml \
   artifacts/mockup-sandbox/.replit-artifact/artifact.toml
```

Expected: all targeted Replit-era tracked files are present.

- [ ] **Step 2: Edit `README.md` to remove the deleted doc reference**

Replace the development docs section snippet:

```md
- `docs/local-development.md` - full local install, run, verification, and troubleshooting guide
- `replit.md` - project notes and architecture context from prior workflow setup
```

with:

```md
- `docs/local-development.md` - full local install, run, verification, and troubleshooting guide
```

- [ ] **Step 3: Delete the approved Replit-only tracked files**

Run:

```bash
rm .replit .replitignore replit.md scripts/post-merge.sh && \
rm artifacts/api-server/.replit-artifact/artifact.toml && \
rm artifacts/journal-app/.replit-artifact/artifact.toml && \
rm artifacts/mockup-sandbox/.replit-artifact/artifact.toml
```

Expected: all approved tracked files are removed.

- [ ] **Step 4: Verify no tracked docs still mention `replit.md`**

Run:

```bash
rg -n "replit\.md" README.md docs || true
```

Expected: no output.

- [ ] **Step 5: Commit the file-removal slice**

```bash
git add README.md . && git commit -m "chore: remove tracked replit files"
```

### Task 2: Remove Replit packages and workspace config entries

**Files:**

- Modify: `package.json:24-26`
- Modify: `pnpm-workspace.yaml:28-160`
- Modify: `artifacts/journal-app/package.json:12-76`
- Modify: `artifacts/mockup-sandbox/package.json:12-73`

**Interfaces:**

- Consumes: Task 1 completed cleanup scope and current package manifests
- Produces: workspace manifests with no Replit package dependencies, no Replit catalog entries, no Replit allowlist entries, and no Replit-era platform exclusions while preserving the unrelated bottom override pins

- [ ] **Step 1: Snapshot the exact lines that must be preserved in `pnpm-workspace.yaml`**

Run:

```bash
sed -n '28,160p' pnpm-workspace.yaml
```

Expected: you can clearly see `minimumReleaseAge: 1440`, the Replit allowlist/catalog entries, the large platform exclusion block, and the final `@esbuild-kit/esm-loader` / `esbuild` override lines that must stay.

- [ ] **Step 2: Remove the root Replit dependency from `package.json`**

Change:

```json
  "dependencies": {
    "@replit/connectors-sdk": "^0.4.1"
  },
```

to:

```json
  "dependencies": {},
```

- [ ] **Step 3: Remove Replit plugin dependencies from the app package manifests**

Delete these exact lines from `artifacts/journal-app/package.json`:

```json
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
```

Delete these exact lines from `artifacts/mockup-sandbox/package.json`:

```json
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
```

- [ ] **Step 4: Remove only the Replit-specific workspace entries from `pnpm-workspace.yaml`**

Delete the Replit allowlist block:

```yaml
minimumReleaseAgeExclude:
  # Exclude @replit scoped packages from the minimum release age check.
  # These are published by Replit and trusted — the supply-chain attack vector
  # this setting guards against does not apply to our own packages.
  - "@replit/*"
  - stripe-replit-sync
```

Delete the Replit catalog entries:

```yaml
"@replit/vite-plugin-cartographer": ^0.5.21
"@replit/vite-plugin-dev-banner": ^0.1.1
"@replit/vite-plugin-runtime-error-modal": ^0.0.6
```

Delete the Replit-era platform exclusion entries under `overrides:` for `esbuild`, `lightningcss`, `@tailwindcss/oxide`, `rollup`, and `@expo/ngrok-bin`, but keep this bottom block intact:

```yaml
"@esbuild-kit/esm-loader": "npm:tsx@^4.21.0"
esbuild: "0.27.3"
```

- [ ] **Step 5: Refresh the lockfile to match the manifest removals**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` updates to remove the deleted Replit packages without lowering the general security floor.

- [ ] **Step 6: Commit the dependency/config cleanup slice**

```bash
git add package.json pnpm-workspace.yaml artifacts/journal-app/package.json artifacts/mockup-sandbox/package.json pnpm-lock.yaml && git commit -m "chore: remove replit workspace dependencies"
```

### Task 3: Remove Replit-specific Vite wiring and source comments

**Files:**

- Modify: `artifacts/journal-app/vite.config.ts:1-56`
- Modify: `artifacts/mockup-sandbox/vite.config.ts:1-47`
- Modify: `artifacts/journal-app/src/components/ui/badge.tsx:5-23`

**Interfaces:**

- Consumes: Task 2 package cleanup, so removed packages are no longer referenced
- Produces: app and sandbox Vite configs that use only local plugins already present in the repo, plus cleaned source comments with no leftover `@replit` markers

- [ ] **Step 1: Write the target plugin arrays before editing**

The `artifacts/journal-app/vite.config.ts` plugins block should end up as:

```ts
  plugins: [react(), tailwindcss()],
```

The `artifacts/mockup-sandbox/vite.config.ts` plugins block should end up as:

```ts
  plugins: [mockupPreviewPlugin(), react(), tailwindcss()],
```

Expected: no `runtimeErrorOverlay()` call and no `REPL_ID`-gated dynamic imports remain in either file.

- [ ] **Step 2: Remove the Replit imports and plugin wiring from `artifacts/journal-app/vite.config.ts`**

Delete:

```ts
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
```

and replace:

```ts
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
```

with:

```ts
  plugins: [react(), tailwindcss()],
```

- [ ] **Step 3: Remove the Replit imports and plugin wiring from `artifacts/mockup-sandbox/vite.config.ts`**

Delete:

```ts
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
```

and replace:

```ts
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          )
        ]
      : []),
  ],
```

with:

```ts
  plugins: [mockupPreviewPlugin(), react(), tailwindcss()],
```

- [ ] **Step 4: Remove the obsolete Replit comments from `badge.tsx`**

Replace the comment-heavy block:

```ts
// @replit
// Whitespace-nowrap: Badges should never wrap.
```

with:

```ts
// Badges should never wrap.
```

Delete the inline `@replit` comments above `default`, `secondary`, `destructive`, and `outline` while preserving the class strings themselves.

- [ ] **Step 5: Run targeted typechecks for the touched frontend packages**

Run:

```bash
pnpm --filter @workspace/journal-app run typecheck && \
pnpm --filter @workspace/mockup-sandbox run typecheck
```

Expected: both commands pass with no references to missing Replit packages.

- [ ] **Step 6: Commit the app wiring cleanup slice**

```bash
git add artifacts/journal-app/vite.config.ts artifacts/mockup-sandbox/vite.config.ts artifacts/journal-app/src/components/ui/badge.tsx && git commit -m "chore: remove replit vite wiring"
```

### Task 4: Verify workspace behavior after cleanup

**Files:**

- Verify: `package.json`
- Verify: `pnpm-workspace.yaml`
- Verify: `README.md`
- Verify: `artifacts/journal-app/package.json`
- Verify: `artifacts/mockup-sandbox/package.json`
- Verify: `artifacts/journal-app/vite.config.ts`
- Verify: `artifacts/mockup-sandbox/vite.config.ts`
- Verify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Tasks 1-3 completed
- Produces: evidence that the cleanup is complete, local builds still work, and no Replit-only references remain in tracked code/config/docs

- [ ] **Step 1: Run diagnostics on the touched TypeScript files**

Run LSP diagnostics or the nearest equivalent on:

```text
artifacts/journal-app/vite.config.ts
artifacts/mockup-sandbox/vite.config.ts
artifacts/journal-app/src/components/ui/badge.tsx
```

Expected: zero errors.

- [ ] **Step 2: Run relevant build checks**

Run:

```bash
pnpm --filter @workspace/journal-app run build && \
pnpm --filter @workspace/mockup-sandbox run build
```

Expected: both builds pass without requiring Replit packages.

- [ ] **Step 3: Run the repository quality gate most relevant to this cleanup**

Run:

```bash
pnpm run lint && pnpm run typecheck
```

Expected: workspace-level lint and typecheck pass.

- [ ] **Step 4: Confirm no tracked Replit-specific references remain**

Run:

```bash
rg -n "@replit|REPL_ID|runtimeErrorOverlay|replit-artifact|stripe-replit-sync" . \
  --glob '!node_modules' \
  --glob '!.git' \
  --glob '!.local' \
  --glob '!pnpm-lock.yaml'
```

Expected: no hits in tracked source/config/docs other than historical plan/spec documents under `docs/superpowers/`.

- [ ] **Step 5: Inspect the final git diff before handoff**

Run:

```bash
git status --short && git diff --stat && git diff
```

Expected: the diff matches the approved scope only.

- [ ] **Step 6: Commit the verification-complete state**

```bash
git add -A && git commit -m "chore: finish replit cleanup"
```

## Self-review checklist

- Spec coverage: every approved deletion, manifest cleanup, Vite cleanup, README update, and verification requirement has a corresponding task above.
- Placeholder scan: no `TODO`, `TBD`, or implied “similar cleanup” instructions remain; each task names exact files, commands, and expected outcomes.
- Type consistency: package names, file paths, and preserved override keys match the current repository files and the approved spec.
