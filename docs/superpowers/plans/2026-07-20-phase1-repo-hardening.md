# Phase 1 Repo Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Mindful Journal monorepo straightforward to install, run, and verify locally from the repository root.

**Architecture:** Add a root-level developer contract instead of changing application internals. The contract consists of one onboarding README, one local-development guide, one root env example, one set of root scripts, and one lightweight formatting/linting/hook layer that wraps the existing package structure.

**Tech Stack:** pnpm workspaces, TypeScript, React + Vite, Express, PostgreSQL, Prettier, ESLint, Husky, lint-staged

## Global Constraints

- Do not change product behavior in the journal app, API, or shared libraries.
- Preserve current package boundaries and existing package-level commands.
- Document the real env contract already implied by the code: `DATABASE_URL`, package ports, and Vite base paths.
- Keep secrets out of version control; only commit examples and docs.
- Verification must include repo checks plus a manual browser load of the app.

---

### Task 1: Define the root developer contract

**Files:**

- Create: `README.md`
- Create: `docs/local-development.md`
- Create: `.env.example`

**Interfaces:**

- Consumes: current workspace package layout, package scripts, env requirements from code
- Produces: documented root workflow and root env variable names used by later root scripts

- [ ] **Step 1: Write the root README**

Include sections for project overview, workspace layout, prerequisites, quick start, root scripts, and docs links.

- [ ] **Step 2: Write the local development guide**

Include prerequisites, env setup, bootstrap, API/web/mockup run commands, repo checks, and troubleshooting.

- [ ] **Step 3: Write `.env.example`**

Document these variables with safe local defaults or placeholders:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindful_journal
API_PORT=3001
WEB_PORT=5173
MOCKUP_PORT=4173
WEB_BASE_PATH=/
MOCKUP_BASE_PATH=/
LOG_LEVEL=info
```

- [ ] **Step 4: Review docs against actual package requirements**

Run: `rg -n 'DATABASE_URL|PORT|BASE_PATH' artifacts lib`
Expected: the documented variables cover the required env surface.

### Task 2: Add root workflow scripts

**Files:**

- Modify: `package.json`
- Create: `scripts/src/dev-api.ts`
- Create: `scripts/src/dev-web.ts`
- Create: `scripts/src/dev-mockup.ts`
- Create: `scripts/src/check-env.ts`

**Interfaces:**

- Consumes: `.env.example`, package-level `dev`, `build`, and `typecheck` commands
- Produces: root commands `bootstrap`, `dev:api`, `dev:web`, `dev:mockup`, `check`, `format`, `format:check`, `lint`

- [ ] **Step 1: Add root script names to `package.json`**

Add scripts for:

```json
{
  "bootstrap": "pnpm install",
  "dev:api": "tsx ./scripts/src/dev-api.ts",
  "dev:web": "tsx ./scripts/src/dev-web.ts",
  "dev:mockup": "tsx ./scripts/src/dev-mockup.ts",
  "check:env": "tsx ./scripts/src/check-env.ts",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lint": "eslint . --ext .ts,.tsx,.js,.cjs,.mjs",
  "check": "pnpm run check:env && pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run build"
}
```

- [ ] **Step 2: Implement `scripts/src/check-env.ts`**

Validate that required local env keys are present before dev/check flows. It should fail fast with a readable missing-key message.

- [ ] **Step 3: Implement `scripts/src/dev-api.ts`**

Launch `pnpm --filter @workspace/api-server run dev` with `PORT` mapped from `API_PORT` and pass through `DATABASE_URL`, `LOG_LEVEL`, and `NODE_ENV=development`.

- [ ] **Step 4: Implement `scripts/src/dev-web.ts`**

Launch `pnpm --filter @workspace/journal-app run dev` with `PORT` mapped from `WEB_PORT` and `BASE_PATH` mapped from `WEB_BASE_PATH`.

- [ ] **Step 5: Implement `scripts/src/dev-mockup.ts`**

Launch `pnpm --filter @workspace/mockup-sandbox run dev` with `PORT` mapped from `MOCKUP_PORT` and `BASE_PATH` mapped from `MOCKUP_BASE_PATH`.

- [ ] **Step 6: Verify each script resolves**

Run:

```bash
pnpm run check:env
pnpm run dev:api --help || true
pnpm run dev:web --help || true
pnpm run dev:mockup --help || true
```

Expected: script entrypoints resolve without TypeScript/module errors.

### Task 3: Add formatting and linting

**Files:**

- Modify: `package.json`
- Create: `.prettierignore`
- Create: `eslint.config.mjs`

**Interfaces:**

- Consumes: root scripts from Task 2
- Produces: working `format`, `format:check`, and `lint` commands used by Task 4 and final verification

- [ ] **Step 1: Add linting dependencies**

Add the minimum required packages to root `devDependencies`, such as `eslint`, `@eslint/js`, `typescript-eslint`, `globals`, `husky`, and `lint-staged`.

- [ ] **Step 2: Create `eslint.config.mjs`**

Target workspace TypeScript/JavaScript files, ignore generated/build folders, and keep the rule set lightweight enough for Phase 1.

- [ ] **Step 3: Create `.prettierignore`**

Ignore build output, coverage, node_modules, lock artifacts outside the intended root lockfile, and generated folders.

- [ ] **Step 4: Run formatter and linter**

Run:

```bash
pnpm run format
pnpm run lint
```

Expected: formatter normalizes repo files; linter passes or surfaces actionable config gaps to fix before moving on.

### Task 4: Add Git hooks and ignore hygiene

**Files:**

- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`

**Interfaces:**

- Consumes: `format`, `lint`, `check` commands from Tasks 2 and 3
- Produces: automatic staged-file gate on commit and repo check gate on push

- [ ] **Step 1: Add a `prepare` script and `lint-staged` config**

Use `prepare` to install Husky. Configure `lint-staged` to run Prettier and ESLint fix mode on staged source/docs/config files.

- [ ] **Step 2: Create `.husky/pre-commit`**

Run `pnpm exec lint-staged`.

- [ ] **Step 3: Create `.husky/pre-push`**

Run `pnpm run check`.

- [ ] **Step 4: Extend `.gitignore`**

Add safe ignores for `.env`, `.env.*.local`, `*.log`, additional temp caches, and local-only dev output while preserving `.env.example` and tracked workflow/config files.

- [ ] **Step 5: Verify hooks are installed and files are ignored correctly**

Run:

```bash
pnpm install
git check-ignore -v .env .env.local sample.log
```

Expected: Husky files exist, and sensitive/local-only files are ignored.

### Task 5: Verify the developer flow end-to-end

**Files:**

- Modify: any Phase 1 file as needed to fix verification gaps

**Interfaces:**

- Consumes: docs, env example, scripts, linting, hooks from Tasks 1-4
- Produces: final evidence that the Phase 1 contract works

- [ ] **Step 1: Run repo verification from root**

Run:

```bash
pnpm run check
```

Expected: environment check, format check, lint, typecheck, and build all exit 0.

- [ ] **Step 2: Start API and web using the new root scripts**

Run in separate processes:

```bash
pnpm run dev:api
pnpm run dev:web
```

Expected: both services start with the documented local env contract.

- [ ] **Step 3: Manually load the app in a browser**

Open the local web URL, confirm the dashboard renders, and confirm the app can reach the local API without obvious startup errors.

- [ ] **Step 4: Update docs if verification discovered drift**

If the real run flow differs from the written docs, fix the docs before closing the task.
