# Luminary — Mental Wellness Journal

A personal journaling app with daily writing prompts, mood tracking, and a visual mood calendar. Designed to feel like a quiet, warm space for reflection.

## Run & Operate

- `pnpm --filter @workspace/journal-app run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter (routing), Framer Motion, Recharts, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema (prompts.ts, entries.ts, moods.ts)
- `artifacts/api-server/src/routes/` — route handlers (prompts, entries, moods, dashboard)
- `artifacts/journal-app/src/` — React frontend

## Architecture decisions

- Mood calendar uses latest mood per day when multiple are logged the same day.
- Today's writing prompt is deterministically selected by day-of-year (mod total prompts), so all users see the same prompt daily without a DB column.
- Streak calculation runs in application code rather than SQL for simplicity.
- Entry date is stored as a `text` YYYY-MM-DD string (not timestamp) to avoid timezone issues.

## Product

- **Dashboard** — greeting, today's prompt, streak counter, mood log, recent entries
- **Write** — compose entries with today's prompt, inline mood rating 1–5
- **Journal** — browse all past entries grouped by month
- **Calendar** — visual mood calendar with color-coded days, month navigation
- **Insights** — mood stats: streak, average score, 7-day trend, mood breakdown chart

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before checking artifact packages (stale declarations cause false import errors).
- After changing `lib/api-spec/openapi.yaml`, always re-run `pnpm --filter @workspace/api-spec run codegen` before using updated types.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
