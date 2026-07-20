# Mindful Journal

Mindful Journal is a pnpm workspace for a personal journaling app with a React frontend, an Express API, a PostgreSQL-backed data layer, and generated API client packages.

## Workspace layout

- `artifacts/journal-app` - main React + Vite app
- `artifacts/api-server` - Express API server
- `artifacts/mockup-sandbox` - component preview sandbox
- `lib/db` - Drizzle database package
- `lib/api-spec` - OpenAPI source of truth
- `lib/api-zod` - generated Zod validators from the API spec
- `lib/api-client-react` - generated React Query client
- `scripts` - helper runners used by root scripts

## Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL running locally

## Quick start

1. Install dependencies:

   ```bash
   pnpm run bootstrap
   ```

2. Copy the example env file and update the database URL if needed:

   ```bash
   cp .env.example .env
   ```

3. Push the local database schema:

   ```bash
   pnpm run db:push
   ```

4. Start the API in one terminal:

   ```bash
   pnpm run dev:api
   ```

5. Start the web app in another terminal:

   ```bash
   pnpm run dev:web
   ```

6. Open `http://localhost:5173/`.

## Root scripts

- `pnpm run bootstrap` - install workspace dependencies
- `pnpm run dev:api` - start the Express API with the root env contract
- `pnpm run dev:web` - start the journal app with the root env contract
- `pnpm run dev:mockup` - start the mockup sandbox
- `pnpm run db:push` - apply the Drizzle schema to the local database
- `pnpm run check:env` - validate required local env values
- `pnpm run typecheck` - typecheck libraries and package code
- `pnpm run build` - build the workspace with the documented local env mapping
- `pnpm run format` - apply Prettier formatting
- `pnpm run format:check` - verify formatting
- `pnpm run lint` - run ESLint across workspace code and config files
- `pnpm run check` - run env validation, formatting check, lint, typecheck, and build

## Environment contract

The local workflow uses the following root env variables:

- `DATABASE_URL`
- `API_PORT`
- `WEB_PORT`
- `MOCKUP_PORT`
- `WEB_BASE_PATH`
- `MOCKUP_BASE_PATH`
- `LOG_LEVEL` (optional)

See `.env.example` for defaults and `docs/local-development.md` for setup details.

## Development docs

- `docs/local-development.md` - full local install, run, verification, and troubleshooting guide

## Git quality gates

- `pre-commit` runs `lint-staged`
- `pre-push` runs `pnpm run check`

If hooks are missing after install, rerun:

```bash
pnpm run prepare
```
