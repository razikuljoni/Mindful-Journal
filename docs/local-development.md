# Local development

## Prerequisites

- Node.js 24 or newer
- pnpm 10 or newer
- PostgreSQL running locally

## 1. Install dependencies

From the repository root:

```bash
pnpm run bootstrap
```

## 2. Configure local environment

Copy the example file:

```bash
cp .env.example .env
```

Default local values:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindful_journal
API_PORT=3001
WEB_PORT=5173
MOCKUP_PORT=4173
WEB_BASE_PATH=/
MOCKUP_BASE_PATH=/
LOG_LEVEL=info
```

Update `DATABASE_URL` if your local PostgreSQL container uses different credentials, host, port, or database name.

If you already have Postgres running in Docker, make sure `DATABASE_URL` matches that container's `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and published port.

## 3. Prepare the local database

Apply the current schema before starting the app:

```bash
pnpm run db:push
```

## 4. Run the app locally

Start the API in one terminal:

```bash
pnpm run dev:api
```

Start the web app in a second terminal:

```bash
pnpm run dev:web
```

Open:

```text
http://localhost:5173/
```

Optional: start the preview sandbox in a third terminal:

```bash
pnpm run dev:mockup
```

## 5. Verify the repo before pushing

Run the full root check:

```bash
pnpm run check
```

This runs:

- env validation
- Prettier format check
- ESLint
- workspace typecheck
- workspace build

## 6. Common workflows

Regenerate API-derived packages after OpenAPI changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Push database schema changes in development:

```bash
pnpm --filter @workspace/db run push
```

## Troubleshooting

### `DATABASE_URL must be set`

Create `.env` from `.env.example` and make sure `DATABASE_URL` points at a reachable local PostgreSQL instance.

### `Failed query` or `relation does not exist`

Run:

```bash
pnpm run db:push
```

against the local database configured by `DATABASE_URL`.

### `password authentication failed for user ...`

Your local `.env` database credentials do not match the running PostgreSQL instance. Update `DATABASE_URL` to match the active container or local server, then rerun:

```bash
pnpm run db:push
```

### `PORT environment variable is required`

Use the root `dev:*` and `build` scripts instead of invoking package scripts directly, or export the package-specific `PORT` variable yourself.

### `BASE_PATH environment variable is required`

Use the root `dev:web`, `dev:mockup`, and `build` scripts, which map `WEB_BASE_PATH` and `MOCKUP_BASE_PATH` to the Vite configs.

### Hooks did not install

Run:

```bash
pnpm run prepare
```

### Type errors after schema changes

If you modify `lib/db/src/schema`, rerun:

```bash
pnpm run typecheck:libs
```

before re-checking artifact packages.
