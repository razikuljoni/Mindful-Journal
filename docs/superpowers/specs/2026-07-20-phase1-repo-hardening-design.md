# Phase 1 Repo Hardening Design

## Goal

Improve local developer operability for the Mindful Journal monorepo without changing product behavior. Phase 1 covers documentation, environment examples, root-level scripts, formatting and linting gates, Husky hooks, and ignore-file hygiene.

## Scope

This phase is limited to repository and developer-experience hardening:

- Add a root `README.md` as the primary project entrypoint.
- Add a local development guide with exact install, configuration, run, and verification steps.
- Add a root `.env.example` that documents the shared local environment contract.
- Add root package scripts for bootstrap, local development entrypoints, and repo-wide checks.
- Add formatting and linting tooling with Git hooks for pre-commit and optional pre-push verification.
- Expand ignore hygiene for environment files, logs, local caches, and generated artifacts.

Out of scope for Phase 1:

- UI or API behavior changes.
- Feature refactors or architecture restructuring.
- Generated-client regeneration or schema redesign.
- Deeper simplification work inside application packages.

## Current Repo Facts

The repository is a pnpm workspace with these primary packages:

- `artifacts/journal-app` — React + Vite frontend.
- `artifacts/api-server` — Express API server.
- `artifacts/mockup-sandbox` — preview-only Vite app.
- `lib/db` — Drizzle database package.
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — contract and client layers.
- `scripts` — workspace utility package.

The root currently has no `README.md`, and the root `package.json` only exposes `build` and `typecheck` flows. Local-run expectations are partially captured in `replit.md`, but not in a standard contributor-facing entrypoint.

## Local Environment Contract

Phase 1 standardizes the documented local environment around the variables the code already requires.

Required:

- `DATABASE_URL` — required by `lib/db` and Drizzle config.
- `API_PORT` — source of truth for the API process port.
- `WEB_PORT` — source of truth for the web Vite dev/preview port.
- `MOCKUP_PORT` — source of truth for the mockup sandbox port.
- `WEB_BASE_PATH` — base path passed to the journal app Vite config.
- `MOCKUP_BASE_PATH` — base path passed to the mockup sandbox Vite config.

Optional:

- `LOG_LEVEL` — API logger override.

The docs will assume PostgreSQL is already available locally, matching the user’s environment.

## Documentation Design

### Root README

The root `README.md` will become the main onboarding document. It should explain:

- what the repository contains,
- the package layout,
- the minimum prerequisites,
- the fastest local-start path,
- the key root scripts, and
- where to find deeper setup and architecture notes.

The README should stay concise and delegate detailed steps to `docs/local-development.md`.

### Local Development Guide

`docs/local-development.md` will be the operational source of truth for:

- prerequisite tooling,
- copying `.env.example`,
- setting values for local PostgreSQL,
- bootstrapping dependencies,
- running API and web locally,
- optional mockup sandbox usage,
- checking typecheck/lint/format/build health, and
- troubleshooting the most likely setup failures.

## Script Design

Root scripts should make local work predictable from the repo root. Phase 1 adds root commands instead of requiring contributors to memorize per-package invocations.

Planned categories:

- `bootstrap` — install workspace dependencies.
- `dev:api` — run the API with the documented local env contract.
- `dev:web` — run the journal app with the documented local env contract.
- `dev:mockup` — run the mockup sandbox with the documented local env contract.
- `format` / `format:check` — Prettier write/check.
- `lint` — repo-wide ESLint on TypeScript and JavaScript workspace files.
- `check` — combined verification path for format, lint, typecheck, and build.

The scripts should prefer root-managed environment mapping so the docs can teach one workflow.

## Quality Gate Design

Phase 1 adds lightweight contributor safety rails:

- Prettier for repository formatting.
- ESLint for repo-wide TypeScript and JavaScript linting.
- Husky Git hooks.
- `lint-staged` so pre-commit runs only against staged files.

Hook policy:

- `pre-commit` runs formatting/lint-staged checks.
- `pre-push` may run the heavier root `check` command if the cost is acceptable after implementation review.

The chosen setup should avoid changing application behavior and should be easy to understand from package scripts alone.

## Ignore Hygiene Design

The root `.gitignore` will be extended to cover common local-only noise that should not reach upstream, including:

- `.env` and local env variants,
- log files,
- temporary debug output,
- common generated build artifacts not already ignored,
- Husky/local cache noise where applicable.

The design must avoid ignoring committed examples such as `.env.example`.

## Verification Plan

Success for Phase 1 is operational, not cosmetic. Verification should prove:

1. A contributor can understand the repo from `README.md`.
2. A contributor can configure local env from `.env.example` and `docs/local-development.md`.
3. Root scripts successfully drive format, lint, typecheck, and build flows.
4. The API and frontend can be started locally through the documented root scripts.
5. The journal app loads in a browser against the locally running API.

Manual QA will use the real browser surface for the web app after the repo-hardening changes land.

## Implementation Priority

Recommended order:

1. Root documentation and environment contract.
2. Root scripts for bootstrap, local dev, and checks.
3. Formatting and linting setup.
4. Husky and staged-file gates.
5. Ignore hygiene cleanup.
6. End-to-end verification with build and browser-based app load.

## Risks and Constraints

- Existing package configs require `PORT` and `BASE_PATH` in some places, so root scripts must map the documented env contract into the package-specific process env that current code expects.
- This repo already contains tool-specific folders (`.agents`, `.claude`, `.omo`), so ignore changes must be careful not to hide intentionally tracked workflow assets.
- Phase 1 should not refactor application internals just to satisfy tooling; repo hardening comes first.

## Acceptance Criteria

Phase 1 is complete when all of the following are true:

- `README.md` exists and accurately explains repo purpose, structure, prerequisites, and root workflow.
- `docs/local-development.md` gives exact local setup and verification steps.
- `.env.example` documents the local environment contract without secrets.
- Root scripts exist for bootstrap, local dev entrypoints, and repo-wide checks.
- Formatting, linting, and Husky gates are configured and documented.
- `.gitignore` is updated to prevent common local-only files from being pushed upstream.
- Root verification commands pass, and the app is manually exercised through its browser surface.
